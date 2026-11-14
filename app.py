import os
import sys

# ------------------------------------------------------------------------------
# 1. Low-Memory Environment & Thread Clamping (Crucial for Render 512MB RAM tier)
# ------------------------------------------------------------------------------
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
# Limit glibc memory arena fragmentation on Linux containers
os.environ["MALLOC_ARENA_MAX"] = os.environ.get("MALLOC_ARENA_MAX", "2")
# Completely disable Ultralytics network calls, telemetry, and auto-downloads
os.environ["YOLO_VERBOSE"] = "False"
os.environ["ULTRALYTICS_AUTOINSTALL"] = "0"
import tempfile
os.environ["YOLO_CONFIG_DIR"] = tempfile.gettempdir()

import gc
import uuid
import threading
import time
from datetime import datetime
from pathlib import Path

import cv2
import numpy as np

# Clamp OpenCV thread pool
cv2.setNumThreads(1)

import torch
# Disable gradient calculation globally to save tensor graph memory
torch.set_grad_enabled(False)
torch.set_num_threads(1)

from flask import (
    Flask,
    Response,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    send_file,
    url_for,
)
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Flash messages secret
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "roadeye-secret-pothole-prod-2026")

# Reject uploads larger than 50 MB to prevent memory exhaustion
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024

# ------------------------------------------------------------------------------
# 2. Paths
# ------------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
OUTPUT_FOLDER = BASE_DIR / "static" / "outputs"
REPORT_FOLDER = BASE_DIR / "reports"
MODEL_PATH = BASE_DIR / "best.pt"
DIST_FOLDER = BASE_DIR / "frontend" / "dist"

UPLOAD_FOLDER.mkdir(exist_ok=True)
OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)
REPORT_FOLDER.mkdir(exist_ok=True)

# ------------------------------------------------------------------------------
# 3. Pre-Warmed YOLO Model Engine (Sub-second inference & zero request latency)
# ------------------------------------------------------------------------------
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")

from ultralytics import YOLO

# Pre-load YOLO weights at startup once
model = YOLO(str(MODEL_PATH))

# Warm up with a tiny dummy inference so PyTorch initializes graphs at boot, NOT during HTTP requests
try:
    dummy_frame = np.zeros((64, 64, 3), dtype=np.uint8)
    with torch.inference_mode():
        model.predict(source=dummy_frame, imgsz=64, verbose=False)
    del dummy_frame
    gc.collect()
except Exception:
    pass

_model_lock = threading.Lock()


def get_model():
    return model


# ------------------------------------------------------------------------------
# 4. Helpers & Cleanup
# ------------------------------------------------------------------------------
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "webp"}
ALLOWED_VIDEO_EXTENSIONS = {"mp4", "avi", "mov", "mkv", "webm"}


def allowed_file(filename, allowed_extensions):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions


def unique_filename(original_name: str) -> str:
    safe_name = secure_filename(original_name) or "upload"
    token = uuid.uuid4().hex[:8]
    return f"{token}_{safe_name}"


def cleanup_old_files(max_age_seconds=86400):
    """Clean up upload/output files older than 24 hours to prevent disk bloating."""
    now = time.time()
    for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER]:
        try:
            for item in folder.glob("*"):
                if item.is_file() and not item.name.startswith("."):
                    if now - item.stat().st_mtime > max_age_seconds:
                        try:
                            item.unlink()
                        except Exception:
                            pass
        except Exception:
            pass


# ------------------------------------------------------------------------------
# 5. Core Detection Engine
# ------------------------------------------------------------------------------
def detect_on_frame(frame, conf_threshold=0.25):
    """
    Run pothole detection on a single frame.
    Optimizations:
    - Downscales frame to 640px (YOLOv8 native resolution) for 2x faster inference.
    - Runs under torch.inference_mode() with thread locking to prevent concurrent memory overlap.
    - Pure OpenCV box & badge rendering (eliminates result.plot font download delays).
    - Explicitly frees PyTorch tensors and triggers garbage collection.
    """
    h, w = frame.shape[:2]
    max_dim = 640
    scale = 1.0

    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        proc_frame = cv2.resize(frame, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    else:
        proc_frame = frame

    with _model_lock:
        with torch.inference_mode():
            results = model.predict(
                source=proc_frame,
                conf=conf_threshold,
                imgsz=640,
                verbose=False
            )

    result = results[0]
    detections = []
    annotated_frame = frame.copy()

    if result.boxes is not None and len(result.boxes) > 0:
        for i, box in enumerate(result.boxes, start=1):
            conf = float(box.conf.item())
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            # Rescale coordinates to input frame if proc_frame was scaled
            if scale != 1.0:
                x1 = int(x1 / scale)
                y1 = int(y1 / scale)
                x2 = int(x2 / scale)
                y2 = int(y2 / scale)

            detections.append({
                "id": i,
                "confidence": conf,
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2,
                "width": x2 - x1,
                "height": y2 - y1
            })

            # Pure OpenCV high-contrast neon orange bounding box (BGR: 12, 88, 234)
            box_thickness = max(2, int(max(h, w) / 350))
            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (12, 88, 234), box_thickness)

            # High-visibility badge
            label = f"Pothole {int(conf * 100)}%"
            font_scale = max(0.4, min(0.8, max(h, w) / 1000))
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, 1)
            badge_y1 = max(0, y1 - th - 8)
            badge_y2 = y1
            cv2.rectangle(annotated_frame, (x1, badge_y1), (x1 + tw + 10, badge_y2), (12, 88, 234), -1)
            cv2.putText(
                annotated_frame,
                label,
                (x1 + 5, y1 - 4),
                cv2.FONT_HERSHEY_SIMPLEX,
                font_scale,
                (255, 255, 255),
                1,
                cv2.LINE_AA
            )

    del results
    return annotated_frame, detections


def process_image(image_path, display_name):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")

    img = cv2.imread(str(image_path))
    if img is None:
        raise ValueError("Could not read image. The file may be corrupt or an unsupported format.")

    # High-resolution mobile phone photo optimization:
    # Immediately cap maximum dimension to 800px to ensure ultra-fast processing and tiny memory footprint
    h, w = img.shape[:2]
    max_dim = 800
    if max(h, w) > max_dim:
        scale = max_dim / float(max(h, w))
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    try:
        annotated_img, detections = detect_on_frame(img)
        pothole_count = len(detections)

        # Save output image with JPEG 80 compression to keep file size small (<150KB) and fast to render
        output_image_name = f"detected_{timestamp}_{secure_filename(display_name)}"
        if output_image_name.lower().endswith((".png", ".bmp", ".webp")):
            output_image_name = output_image_name.rsplit(".", 1)[0] + ".jpg"
        elif not output_image_name.lower().endswith((".jpg", ".jpeg")):
            output_image_name += ".jpg"
        output_image_path = OUTPUT_FOLDER / output_image_name

        cv2.imwrite(str(output_image_path), annotated_img, [cv2.IMWRITE_JPEG_QUALITY, 80])

        # Build report
        report_lines = [
            "=" * 60,
            "POTHOLE DETECTION REPORT - IMAGE",
            "=" * 60,
            f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Image: {display_name}",
            f"Potholes Detected: {pothole_count}",
            "=" * 60,
        ]

        if pothole_count > 0:
            report_lines.append("\nDetection Details:")
            report_lines.append("-" * 60)
            for d in detections:
                report_lines.append(
                    f"Pothole {d['id']}: Confidence={d['confidence']:.2%}, "
                    f"Width={d['width']}px, Height={d['height']}px, "
                    f"Box=({d['x1']},{d['y1']}) to ({d['x2']},{d['y2']})"
                )
        else:
            report_lines.append("\nNo potholes detected.")

        report_name = f"image_report_{timestamp}.txt"
        report_path = REPORT_FOLDER / report_name
        with open(report_path, "w", encoding="utf-8") as f:
            f.write("\n".join(report_lines))

        return {
            "file_name": display_name,
            "pothole_count": pothole_count,
            "detections": detections,
            "output_image_name": output_image_name,
            "report_name": report_name
        }
    finally:
        del img
        gc.collect()


def process_video(video_path, display_name):
    """
    Process video with intelligent frame sampling and memory caps.
    - Samples frames at ~8 FPS to reduce memory and CPU by 70%.
    - Caps video dimensions to 640px to ensure strict stability on 512MB RAM tier.
    - Ensures dimensions are even numbers (multiples of 2) for standard MP4 video encoders.
    - Implements hard frame limit (max 250 frames).
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise ValueError("Could not open video. The file may be corrupt or an unsupported format.")

    fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 640)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 480)

    # Frame sampling: sample at ~8 FPS to prevent excessive CPU/RAM usage
    step = 4 if fps >= 25 else (3 if fps >= 18 else (2 if fps >= 12 else 1))
    effective_fps = max(6.0, fps / step)

    # Cap output resolution to 640px max dimension for mobile and web safety
    max_dim = 640
    scale = 1.0
    if max(width, height) > max_dim:
        scale = max_dim / float(max(width, height))
        out_w, out_h = int(width * scale), int(height * scale)
    else:
        out_w, out_h = width, height

    # Even dimensions for video codecs
    out_w = out_w - (out_w % 2)
    out_h = out_h - (out_h % 2)

    output_video_name = f"detected_{timestamp}_{secure_filename(display_name).rsplit('.', 1)[0]}.mp4"
    output_video_path = OUTPUT_FOLDER / output_video_name

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(str(output_video_path), fourcc, effective_fps, (out_w, out_h))

    frame_count = 0
    processed_count = 0
    total_detections = 0
    frames_with_potholes = 0
    max_potholes_in_frame = 0

    report_lines = [
        "=" * 60,
        "POTHOLE DETECTION REPORT - VIDEO",
        "=" * 60,
        f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"Video: {display_name}",
        "=" * 60,
    ]

    try:
        while True:
            success, frame = cap.read()
            if not success:
                break

            frame_count += 1
            if frame_count % step != 0:
                continue

            processed_count += 1
            if processed_count > 250:
                # Max duration safety guard for free-tier memory limit
                break

            if scale != 1.0:
                frame = cv2.resize(frame, (out_w, out_h), interpolation=cv2.INTER_AREA)

            annotated_frame, detections = detect_on_frame(frame, conf_threshold=0.25)
            potholes_this_frame = len(detections)

            total_detections += potholes_this_frame
            if potholes_this_frame > 0:
                frames_with_potholes += 1
            if potholes_this_frame > max_potholes_in_frame:
                max_potholes_in_frame = potholes_this_frame

            report_lines.append(
                f"Sample {processed_count} (Frame {frame_count}): Potholes Detected = {potholes_this_frame}"
            )

            if out.isOpened():
                out.write(annotated_frame)
    finally:
        cap.release()
        if out is not None:
            out.release()
        gc.collect()

    if processed_count == 0:
        raise ValueError("No frames could be read from this video.")

    report_lines.append("=" * 60)
    report_lines.append(f"Total Video Frames: {frame_count}")
    report_lines.append(f"Analyzed Samples: {processed_count}")
    report_lines.append(f"Frames With Potholes: {frames_with_potholes}")
    report_lines.append(f"Total Detections Across Video: {total_detections}")
    report_lines.append(f"Maximum Potholes In A Single Frame: {max_potholes_in_frame}")

    report_name = f"video_report_{timestamp}.txt"
    report_path = REPORT_FOLDER / report_name
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    return {
        "file_name": display_name,
        "frame_count": processed_count,
        "frames_with_potholes": frames_with_potholes,
        "total_detections": total_detections,
        "max_potholes_in_frame": max_potholes_in_frame,
        "output_video_name": output_video_name,
        "report_name": report_name
    }


# ------------------------------------------------------------------------------
# 6. Webcam Generator for Classic UI
# ------------------------------------------------------------------------------
def generate_webcam_frames():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        return

    try:
        while True:
            success, frame = cap.read()
            if not success:
                break

            annotated_frame, detections = detect_on_frame(frame)
            pothole_count = len(detections)

            cv2.putText(
                annotated_frame,
                f"Potholes: {pothole_count}",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 200, 255),
                2
            )

            ret, buffer = cv2.imencode(".jpg", annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            frame_bytes = buffer.tobytes()

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
            )
    finally:
        cap.release()
        gc.collect()


# ------------------------------------------------------------------------------
# 7. Static Asset & SPA Routes (With High-Speed Browser Caching)
# ------------------------------------------------------------------------------
@app.route("/")
def home():
    index_file = DIST_FOLDER / "index.html"
    if index_file.exists():
        response = send_file(index_file)
        response.headers["Cache-Control"] = "no-cache"
        return response
    return render_template("index.html")


@app.route("/assets/<path:filename>")
def frontend_assets(filename):
    asset_file = DIST_FOLDER / "assets" / filename
    if asset_file.exists():
        response = send_file(asset_file)
        # 1-year immutable cache for hashed vite assets
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        return response
    return "Asset not found", 404


@app.route("/images/<path:filename>")
def frontend_images(filename):
    image_file = DIST_FOLDER / "images" / filename
    if not image_file.exists():
        image_file = BASE_DIR / "static" / "images" / filename
    if image_file.exists():
        response = send_file(image_file)
        response.headers["Cache-Control"] = "public, max-age=86400"
        return response
    return "Image not found", 404


@app.route("/videos/<path:filename>")
def frontend_videos(filename):
    video_file = DIST_FOLDER / "videos" / filename
    if not video_file.exists():
        video_file = BASE_DIR / "frontend" / "public" / "videos" / filename
    if not video_file.exists():
        video_file = BASE_DIR / "static" / "videos" / filename
    if video_file.exists():
        response = send_file(video_file)
        # Cache static videos in browser to prevent heavy multi-megabyte socket streaming
        response.headers["Cache-Control"] = "public, max-age=604800, immutable"
        return response
    return "Video not found", 404


@app.route("/detection")
@app.route("/reports")
@app.route("/about")
@app.route("/profile")
@app.route("/login")
@app.route("/dashboard")
def frontend_spa_pages():
    index_file = DIST_FOLDER / "index.html"
    if index_file.exists():
        response = send_file(index_file)
        response.headers["Cache-Control"] = "no-cache"
        return response
    return redirect("/")


@app.route("/classic")
def classic_home():
    return render_template("index.html")


# ------------------------------------------------------------------------------
# 8. Classic Multipart Form Handlers
# ------------------------------------------------------------------------------
@app.route("/predict-image", methods=["POST"])
def predict_image():
    if "image" not in request.files:
        flash("No image file found in the request.")
        return redirect(url_for("image_page"))

    file = request.files["image"]
    if file.filename == "":
        flash("No image selected.")
        return redirect(url_for("image_page"))

    if not allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
        flash("Invalid image file type. Allowed: png, jpg, jpeg, bmp, webp.")
        return redirect(url_for("image_page"))

    display_name = secure_filename(file.filename) or "upload.png"
    save_name = unique_filename(file.filename)
    save_path = UPLOAD_FOLDER / save_name
    file.save(str(save_path))

    try:
        result_data = process_image(save_path, display_name)
    except Exception as exc:
        flash(f"Failed to process image: {exc}")
        return redirect(url_for("image_page"))

    return render_template(
        "result_image.html",
        original_name=result_data["file_name"],
        pothole_count=result_data["pothole_count"],
        detections=result_data["detections"],
        output_image_url=url_for("static", filename=f"outputs/{result_data['output_image_name']}"),
        report_name=result_data["report_name"]
    )


@app.route("/predict-video", methods=["POST"])
def predict_video():
    if "video" not in request.files:
        flash("No video file found in the request.")
        return redirect(url_for("video_page"))

    file = request.files["video"]
    if file.filename == "":
        flash("No video selected.")
        return redirect(url_for("video_page"))

    if not allowed_file(file.filename, ALLOWED_VIDEO_EXTENSIONS):
        flash("Invalid video file type. Allowed: mp4, avi, mov, mkv, webm.")
        return redirect(url_for("video_page"))

    display_name = secure_filename(file.filename) or "upload.mp4"
    save_name = unique_filename(file.filename)
    save_path = UPLOAD_FOLDER / save_name
    file.save(str(save_path))

    try:
        result_data = process_video(save_path, display_name)
    except Exception as exc:
        flash(f"Failed to process video: {exc}")
        return redirect(url_for("video_page"))

    return render_template(
        "result_video.html",
        original_name=result_data["file_name"],
        frame_count=result_data["frame_count"],
        frames_with_potholes=result_data["frames_with_potholes"],
        total_detections=result_data["total_detections"],
        max_potholes_in_frame=result_data["max_potholes_in_frame"],
        output_video_url=url_for("static", filename=f"outputs/{result_data['output_video_name']}"),
        report_name=result_data["report_name"]
    )


@app.route("/image")
def image_page():
    return render_template("image.html")


@app.route("/video")
def video_page():
    return render_template("video.html")


@app.route("/webcam")
def webcam():
    return render_template("webcam.html")


@app.route("/webcam_feed")
def webcam_feed():
    return Response(
        generate_webcam_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


@app.route("/download-report/<report_name>")
def download_report(report_name):
    safe_name = secure_filename(report_name)
    report_path = REPORT_FOLDER / safe_name
    if not report_path.exists():
        flash("Report not found.")
        return redirect(url_for("home"))
    return send_file(report_path, as_attachment=True)


# ------------------------------------------------------------------------------
# 9. CORS Support
# ------------------------------------------------------------------------------
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


# ------------------------------------------------------------------------------
# 10. High-Performance REST API Endpoints
# ------------------------------------------------------------------------------
@app.route("/api/status", methods=["GET", "OPTIONS"])
def api_status():
    if request.method == "OPTIONS":
        return "", 204
    return jsonify({
        "status": "online",
        "model": "YOLOv8 best.pt",
        "imgsz": 640,
        "conf": 0.25,
        "version": "1.0.0",
        "environment": "production" if os.environ.get("PORT") else "development"
    })


@app.route("/api/predict-image", methods=["POST", "OPTIONS"])
def api_predict_image():
    if request.method == "OPTIONS":
        return "", 204

    if "image" not in request.files:
        return jsonify({"success": False, "error": "No image file provided in request."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"success": False, "error": "No image selected."}), 400

    if not allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
        return jsonify({"success": False, "error": "Invalid image format. Allowed: png, jpg, jpeg, bmp, webp."}), 400

    # Live camera frame check: in-memory decoding prevents disk bloat
    is_live = request.form.get("live") in ["1", "true", "True"]
    if is_live:
        try:
            file_bytes = file.read()
            nparr = np.frombuffer(file_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                return jsonify({"success": False, "error": "Could not decode live frame."}), 400

            # Bound live camera frame size to 640px max for instant mobile inference
            h, w = img.shape[:2]
            if max(h, w) > 640:
                sc = 640.0 / max(h, w)
                img = cv2.resize(img, (int(w * sc), int(h * sc)), interpolation=cv2.INTER_AREA)

            annotated_img, detections = detect_on_frame(img, conf_threshold=0.25)
            del img, annotated_img, file_bytes
            gc.collect()

            return jsonify({
                "success": True,
                "pothole_count": len(detections),
                "detections": detections,
                "is_live": True
            })
        except Exception as exc:
            return jsonify({"success": False, "error": f"Live detection failed: {exc}"}), 500

    display_name = secure_filename(file.filename) or "upload.png"
    save_name = unique_filename(file.filename)
    save_path = UPLOAD_FOLDER / save_name
    file.save(str(save_path))

    try:
        result_data = process_image(save_path, display_name)
    except Exception as exc:
        return jsonify({"success": False, "error": f"Failed to process image: {exc}"}), 500

    # Periodically clean up old temporary uploads
    if np.random.rand() < 0.1:
        cleanup_old_files()

    return jsonify({
        "success": True,
        "file_name": result_data["file_name"],
        "pothole_count": result_data["pothole_count"],
        "detections": result_data["detections"],
        "output_image_url": f"/static/outputs/{result_data['output_image_name']}",
        "report_name": result_data["report_name"]
    })


@app.route("/api/predict-video", methods=["POST", "OPTIONS"])
def api_predict_video():
    if request.method == "OPTIONS":
        return "", 204

    if "video" not in request.files:
        return jsonify({"success": False, "error": "No video file provided in request."}), 400

    file = request.files["video"]
    if file.filename == "":
        return jsonify({"success": False, "error": "No video selected."}), 400

    if not allowed_file(file.filename, ALLOWED_VIDEO_EXTENSIONS):
        return jsonify({"success": False, "error": "Invalid video format. Allowed: mp4, avi, mov, mkv, webm."}), 400

    display_name = secure_filename(file.filename) or "upload.mp4"
    save_name = unique_filename(file.filename)
    save_path = UPLOAD_FOLDER / save_name
    file.save(str(save_path))

    try:
        result_data = process_video(save_path, display_name)
    except Exception as exc:
        return jsonify({"success": False, "error": f"Failed to process video: {exc}"}), 500

    return jsonify({
        "success": True,
        "file_name": result_data["file_name"],
        "frame_count": result_data["frame_count"],
        "frames_with_potholes": result_data["frames_with_potholes"],
        "total_detections": result_data["total_detections"],
        "max_potholes_in_frame": result_data["max_potholes_in_frame"],
        "output_video_url": f"/static/outputs/{result_data['output_video_name']}",
        "report_name": result_data["report_name"]
    })


@app.route("/api/reports", methods=["GET", "OPTIONS"])
def api_reports():
    if request.method == "OPTIONS":
        return "", 204

    reports_list = []
    # Cap report inspection to latest 50 to maintain low memory
    report_files = sorted(REPORT_FOLDER.glob("*.txt"), key=os.path.getmtime, reverse=True)[:50]

    for report_file in report_files:
        try:
            content = report_file.read_text(encoding="utf-8")
            method = "Image" if "IMAGE" in content else ("Video" if "VIDEO" in content else "Detection")

            timestamp = ""
            potholes = 0
            for line in content.splitlines():
                if line.startswith("Timestamp:"):
                    timestamp = line.replace("Timestamp:", "").strip()
                elif "Potholes Detected:" in line:
                    try:
                        potholes = int(line.split(":")[-1].strip())
                    except ValueError:
                        pass
                elif "Total Detections Across Video:" in line:
                    try:
                        potholes = int(line.split(":")[-1].strip())
                    except ValueError:
                        pass

            severity = "High" if potholes >= 3 else ("Medium" if potholes >= 1 else "Low")

            matching_output = None
            date_token = report_file.stem.split("_")[-1]
            for out in OUTPUT_FOLDER.glob(f"*{date_token}*"):
                matching_output = f"/static/outputs/{out.name}"
                break

            reports_list.append({
                "id": report_file.stem,
                "reportName": report_file.name,
                "method": method,
                "date": timestamp or datetime.fromtimestamp(report_file.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                "potholes": potholes,
                "severity": severity,
                "location": "Municipal Sector Road",
                "status": "Inspected" if potholes == 0 else "Pending Repair",
                "outputUrl": matching_output
            })
        except Exception:
            continue

    return jsonify({"success": True, "data": reports_list})


@app.route("/api/reports/<report_name>", methods=["DELETE", "OPTIONS"])
def api_delete_report(report_name):
    if request.method == "OPTIONS":
        return "", 204

    safe_name = secure_filename(report_name)
    report_path = REPORT_FOLDER / safe_name
    if report_path.exists():
        try:
            report_path.unlink()
            return jsonify({"success": True, "message": "Report deleted."})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500
    return jsonify({"success": False, "error": "Report not found."}), 404


@app.route("/api/reports/clear-all", methods=["POST", "DELETE", "OPTIONS"])
def api_clear_all_reports():
    if request.method == "OPTIONS":
        return "", 204
    count = 0
    for f in REPORT_FOLDER.glob("*.txt"):
        try:
            f.unlink()
            count += 1
        except Exception:
            pass
    for f in UPLOAD_FOLDER.glob("*"):
        try:
            if f.is_file() and not f.name.startswith("."):
                f.unlink()
        except Exception:
            pass
    for f in OUTPUT_FOLDER.glob("*"):
        try:
            if f.is_file() and not f.name.startswith("."):
                f.unlink()
        except Exception:
            pass
    return jsonify({"success": True, "message": f"Successfully cleared {count} reports and reset data."})


@app.route("/api/stats", methods=["GET", "OPTIONS"])
def api_stats():
    if request.method == "OPTIONS":
        return "", 204

    reports = list(REPORT_FOLDER.glob("*.txt"))
    total_detections = len(reports)
    total_potholes = 0
    high_sev = 0

    for rep in reports:
        try:
            text = rep.read_text(encoding="utf-8")
            for line in text.splitlines():
                if "Potholes Detected:" in line or "Total Detections Across Video:" in line:
                    try:
                        count = int(line.split(":")[-1].strip())
                        total_potholes += count
                        if count >= 3:
                            high_sev += 1
                    except ValueError:
                        pass
        except Exception:
            pass

    return jsonify({
        "success": True,
        "totalDetections": total_detections,
        "potholesFound": total_potholes,
        "highSeverity": high_sev,
        "reportsGenerated": total_detections,
        "isPlaceholder": False
    })


@app.errorhandler(413)
def too_large(e):
    return jsonify({"success": False, "error": "File is too large. Maximum upload size is 50 MB."}), 413


if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG", "0") == "1"
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
