import os

# Gunicorn configuration for Render free tier (512MB RAM, single-core)
# Automatically loaded by Gunicorn on startup
bind = f"0.0.0.0:{os.environ.get('PORT', 5000)}"

# Single synchronous worker: zero fork deadlocks, lowest memory footprint
workers = 1
threads = 1
worker_class = "sync"

# 180 seconds generous timeout so Gunicorn master NEVER sends premature SIGKILL
timeout = 180
graceful_timeout = 30
keepalive = 5

# Periodic worker recycling to prevent any cumulative memory growth
max_requests = 500
max_requests_jitter = 50

# Log requests directly to Render Dashboard stdout/stderr
accesslog = "-"
errorlog = "-"
loglevel = "info"
capture_output = True
