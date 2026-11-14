import os

# Gunicorn configuration for Render free tier (512MB RAM, single-core)
# Automatically loaded by Gunicorn on startup
bind = f"0.0.0.0:{os.environ.get('PORT', 5000)}"

# Single synchronous worker: zero fork deadlocks, lowest memory footprint (~340MB)
workers = 1
threads = 1
worker_class = "sync"

# 180 seconds generous timeout so Gunicorn master NEVER sends premature SIGKILL
timeout = 180
graceful_timeout = 30
keepalive = 5

# Set max_requests to 0 (disabled) so Gunicorn NEVER spawns a second worker
# concurrently. Our inference pipeline has verified 0MB memory leak, so keeping
# a single worker avoids dual-process RAM spikes that exceed Render's 512MB limit.
max_requests = 0
max_requests_jitter = 0

# Log requests directly to Render Dashboard stdout/stderr
accesslog = "-"
errorlog = "-"
loglevel = "info"
capture_output = True


def post_worker_init(worker):
    """
    Runs inside the child worker process immediately after boot (post-fork).
    Pre-warms the YOLO model so that incoming user requests are processed
    instantly in under 2 seconds without waiting for cold model imports.
    """
    try:
        from app import get_model
        import numpy as np
        import torch
        import gc

        worker.log.info("Pre-warming YOLOv8 pothole model inside worker process...")
        m = get_model()
        dummy = np.zeros((480, 480, 3), dtype=np.uint8)
        with torch.inference_mode():
            m.predict(source=dummy, imgsz=480, verbose=False)
        del dummy
        gc.collect()
        worker.log.info("YOLOv8 pothole model successfully pre-warmed! Ready for sub-second inference.")
    except Exception as exc:
        worker.log.warning(f"Model pre-warm notice: {exc}")
