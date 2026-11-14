web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 2 --worker-class gthread --worker-tmp-dir /dev/shm --max-requests 500 --max-requests-jitter 50 --timeout 120
