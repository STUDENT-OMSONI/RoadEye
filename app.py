from flask import Flask, render_template, request, send_file, Response, url_for, redirect, flash, jsonify
from werkzeug.utils import secure_filename
from pathlib import Path
from datetime import datetime
from ultralytics import YOLO
import cv2
import os
import uuid

app = Flask(__name__)

# Needed for flash() messages. Set a real secret in production via env var.
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-secret-change-me")

# Reject uploads bigger than 100 MB before they even hit disk.
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 104

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
OUTPUT_FOLDER = BASE_DIR / "static" / "outputs"
REPORT_FOLDER = BASE_DIR / "reports"
MODEL_PATH = BASE_DIR / "best.pt"
DIST_FOLDER = BASE_DIR / "frontend" / "dist"

UPLOAD_FOLDER.mkdir(exist_ok=True)
OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)
REPORT_FOLDER.mkdir(exist_ok=True)

# -----------------------------
# Load YOLO model
# -----------------------------
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")

model = YOLO(str(MODEL_PATH))

# -----------------------------
# Helpers
# -----------------------------
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "bmp"}
ALLOWED_VIDEO_EXTENSIONS = {"mp4", "avi", "mov", "mkv", "webm"}


def allowed_file(filename, allowed_extensions):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions


def unique_filename(original_name: str) -> str:
    """Sanitize the filename and prefix it with a unique token so concurrent
    uploads never collide and path traversal isn't possible."""
    safe_name = secure_filename(original_name) or "upload"
    token = uuid.uuid4().hex[:8]
    return f"{token}_{safe_name}"


def detect_on_frame(frame):
    """
    Run pothole detection on a single frame.
    Returns:
        annotated_frame, detections
    """
    results = model.predict(source=frame, conf=0.2, imgsz=640, verbose=False)
    result = results[0]

    detections = []

    if result.boxes is not None:
        for i, box in enumerate(result.boxes, start=1):
            conf = float(box.conf.item())
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            width = x2 - x1
            height = y2 - y1

            detections.append({
                "id": i,
                "confidence": conf,
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2,
                "width": width,
                "height": height
            })

            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
            label = f"pothole {conf:.2f}"
            cv2.putText(
                frame,
                label,
                (x1, max(y1 - 10, 20)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 0, 255),
                2
            )

    return frame, detections


def process_image(image_path, display_name):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")

    img = cv2.imread(str(image_path))
    if img is None:
        raise ValueError("Could not read image. The file may be corrupt or an unsupported format.")

    annotated_img, detections = detect_on_frame(img.copy())
    pothole_count = len(detections)

    # Save output image
    output_image_name = f"detected_{timestamp}_{secure_filename(display_name)}"
    output_image_path = OUTPUT_FOLDER / output_image_name
    cv2.imwrite(str(output_image_path), annotated_img)

    # Build report
    report_lines = []
    report_lines.append("=" * 60)
    report_lines.append("POTHOLE DETECTION REPORT - IMAGE")
    report_lines.append("=" * 60)
    report_lines.append(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report_lines.append(f"Image: {display_name}")
    report_lines.append(f"Potholes Detected: {pothole_count}")
    report_lines.append("=" * 60)

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


def process_video(video_path, display_name):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise ValueError("Could not open video. The file may be corrupt or an unsupported format.")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0:
        fps = 20.0

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    output_video_name = f"detected_{timestamp}_{secure_filename(display_name).rsplit('.', 1)[0]}.mp4"
    output_video_path = OUTPUT_FOLDER / output_video_name

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(str(output_video_path), fourcc, fps, (width, height))

    if not out.isOpened():
        cap.release()
        raise ValueError("Could not initialize video writer for output.")

    frame_count = 0
    total_detections = 0
    frames_with_potholes = 0
    max_potholes_in_frame = 0

    report_lines = []
    report_lines.append("=" * 60)
    report_lines.append("POTHOLE DETECTION REPORT - VIDEO")
    report_lines.append("=" * 60)
    report_lines.append(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report_lines.append(f"Video: {display_name}")
    report_lines.append("=" * 60)

    try:
        while True:
            success, frame = cap.read()
            if not success:
                break

            frame_count += 1
            annotated_frame, detections = detect_on_frame(frame.copy())
            potholes_this_frame = len(detections)

            total_detections += potholes_this_frame
            if potholes_this_frame > 0:
                frames_with_potholes += 1
            if potholes_this_frame > max_potholes_in_frame:
                max_potholes_in_frame = potholes_this_frame

            report_lines.append(
                f"Frame {frame_count}: Potholes Detected = {potholes_this_frame}"
            )

            out.write(annotated_frame)
    finally:
        cap.release()
        out.release()

    if frame_count == 0:
        raise ValueError("No frames could be read from this video.")

    report_lines.append("=" * 60)
    report_lines.append(f"Total Frames Processed: {frame_count}")
    report_lines.append(f"Frames With Potholes: {frames_with_potholes}")
    report_lines.append(f"Total Detections Across Video: {total_detections}")
    report_lines.append(f"Maximum Potholes In A Single Frame: {max_potholes_in_frame}")

    report_name = f"video_report_{timestamp}.txt"
    report_path = REPORT_FOLDER / report_name
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    return {
        "file_name": display_name,
        "frame_count": frame_count,
        "frames_with_potholes": frames_with_potholes,
        "total_detections": total_detections,
        "max_potholes_in_frame": max_potholes_in_frame,
        "output_video_name": output_video_name,
        "report_name": report_name
    }


# -----------------------------
# Webcam stream generator
# -----------------------------
def generate_webcam_frames():
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        return

    try:
        while True:
            success, frame = cap.read()
            if not success:
                break

            annotated_frame, detections = detect_on_frame(frame.copy())

            pothole_count = len(detections)
            cv2.putText(
                annotated_frame,
                f"Potholes: {pothole_count}",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (255, 0, 0),
                2
            )

            ret, buffer = cv2.imencode(".jpg", annotated_frame)
            frame_bytes = buffer.tobytes()

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
            )
    finally:
        cap.release()


# -----------------------------
# Routes
# -----------------------------
@app.route("/")
def home():
    index_file = DIST_FOLDER / "index.html"
    if index_file.exists():
        return send_file(index_file)
    return render_template("index.html")


@app.route("/assets/<path:filename>")
def frontend_assets(filename):
    asset_file = DIST_FOLDER / "assets" / filename
    if asset_file.exists():
        return send_file(asset_file)
    return "Asset not found", 404


@app.route("/images/<path:filename>")
def frontend_images(filename):
    image_file = DIST_FOLDER / "images" / filename
    if image_file.exists():
        return send_file(image_file)
    fallback_static = BASE_DIR / "static" / "images" / filename
    if fallback_static.exists():
        return send_file(fallback_static)
    return "Image not found", 404


@app.route("/videos/<path:filename>")
def frontend_videos(filename):
    video_file = DIST_FOLDER / "videos" / filename
    if video_file.exists():
        return send_file(video_file)
    public_file = BASE_DIR / "frontend" / "public" / "videos" / filename
    if public_file.exists():
        return send_file(public_file)
    fallback_static = BASE_DIR / "static" / "videos" / filename
    if fallback_static.exists():
        return send_file(fallback_static)
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
        return send_file(index_file)
    return redirect("/")


@app.route("/classic")
def classic_home():
    return render_template("index.html")


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
        flash("Invalid image file type. Allowed: png, jpg, jpeg, bmp.")
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
        flash("Invalid video file type. Allowed: mp4, avi, mov, mkv.")
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
    # secure_filename strips any path traversal attempts (../, etc.)
    safe_name = secure_filename(report_name)
    report_path = REPORT_FOLDER / safe_name
    if not report_path.exists():
        flash("Report not found.")
        return redirect(url_for("home"))
    return send_file(report_path, as_attachment=True)


# -----------------------------
# CORS Support
# -----------------------------
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


# -----------------------------
# REST API Endpoints (for RoadEye Frontend)
# -----------------------------
@app.route("/api/status", methods=["GET", "OPTIONS"])
def api_status():
    if request.method == "OPTIONS":
        return "", 204
    return jsonify({
        "status": "online",
        "model": "YOLOv8 best.pt",
        "imgsz": 640,
        "conf": 0.2,
        "version": "1.0.0"
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
        return jsonify({"success": False, "error": "Invalid image file type. Allowed: png, jpg, jpeg, bmp."}), 400

    display_name = secure_filename(file.filename) or "upload.png"
    save_name = unique_filename(file.filename)
    save_path = UPLOAD_FOLDER / save_name
    file.save(str(save_path))

    try:
        result_data = process_image(save_path, display_name)
    except Exception as exc:
        return jsonify({"success": False, "error": f"Failed to process image: {exc}"}), 500

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
        return jsonify({"success": False, "error": "Invalid video file type. Allowed: mp4, avi, mov, mkv."}), 400

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
    for report_file in sorted(REPORT_FOLDER.glob("*.txt"), key=os.path.getmtime, reverse=True):
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
            if f.is_file():
                f.unlink()
        except Exception:
            pass
    for f in OUTPUT_FOLDER.glob("*"):
        try:
            if f.is_file():
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
    return "File is too large. Maximum upload size is 100 MB.", 413


if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG", "0") == "1"
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
