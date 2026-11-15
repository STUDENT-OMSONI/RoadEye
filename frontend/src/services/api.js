import axios from 'axios';

// Backend URL configured from environment or fallback to relative URL (supported by Vite proxy)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Resolves API asset URLs (images/videos) so they point to the backend server
 * when deployed as a separate Static Site on Render.
 */
export function resolveApiUrl(urlPath) {
  if (!urlPath) return '';
  if (
    urlPath.startsWith('http://') ||
    urlPath.startsWith('https://') ||
    urlPath.startsWith('blob:') ||
    urlPath.startsWith('data:')
  ) {
    return urlPath;
  }
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
  return base ? `${base}/${urlPath.replace(/^\/+/, '')}` : urlPath;
}

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 minutes for heavy video processing
});

/**
 * File validation helpers
 */
export const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'bmp'];
export const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'avi', 'mov', 'mkv', 'webm'];
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB limit matches Flask config

export function validateFile(file, allowedTypes) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }
  const ext = file.name.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file format (.${ext}). Allowed: ${allowedTypes.join(', ')}.`
    };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 100MB.`
    };
  }
  return { valid: true };
}

/**
 * Automatically resize and compress image client-side before uploading.
 * Reduces 10MB mobile camera photos to ~100-150KB in under 30ms,
 * speeding up upload over cellular connections from 8s to 0.1s.
 */
export async function optimizeImageForUpload(file, maxDimension = 1024, quality = 0.85) {
  if (!file || !file.type.startsWith('image/')) {
    return file;
  }
  // If already under 180 KB, no need to resize
  if (file.size <= 180 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (Math.max(w, h) > maxDimension) {
          const scale = maxDimension / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            const optimizedFile = new File([blob], cleanName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Calculate severity rating for a detection or set of detections
 */
export function calculateSeverity(potholeCount, detections = []) {
  if (potholeCount === 0 || !detections || detections.length === 0) {
    return { level: 'Low', label: 'Clear / Low Risk', color: 'green' };
  }

  // Check individual pothole box areas and confidence
  let maxArea = 0;
  let maxConf = 0;
  detections.forEach(d => {
    const area = (d.width || 0) * (d.height || 0);
    if (area > maxArea) maxArea = area;
    if (d.confidence > maxConf) maxConf = d.confidence;
  });

  // High severity: multiple potholes or large pothole area (>10,000px) or very high confidence
  if (potholeCount >= 3 || maxArea > 10000 || (maxConf > 0.8 && maxArea > 5000)) {
    return { level: 'High', label: 'High Hazard', color: 'red' };
  }
  if (potholeCount >= 1 || maxArea > 3000) {
    return { level: 'Medium', label: 'Moderate Hazard', color: 'orange' };
  }
  return { level: 'Low', label: 'Minor Hazard', color: 'green' };
}

export function getSinglePotholeSeverity(detection) {
  const area = (detection.width || 0) * (detection.height || 0);
  const conf = detection.confidence || 0;
  if (area > 10000 || (conf >= 0.8 && area > 6000)) return 'High';
  if (area > 3000 || conf >= 0.65) return 'Medium';
  return 'Low';
}

/**
 * Central API Service
 */
export const api = {
  /**
   * Healthcheck / Model status
   */
  async checkHealth() {
    try {
      const response = await client.get('/api/status', { timeout: 3000 });
      return response.data;
    } catch {
      // Fallback check against root
      try {
        await client.get('/', { timeout: 3000 });
        return { status: 'online', model: 'YOLOv8 best.pt', mode: 'flask_legacy' };
      } catch {
        return { status: 'offline', message: 'Backend unreachable' };
      }
    }
  },

  /**
   * Predict image using real YOLO model with automatic cold-start retry
   */
  async predictImage(file, isLive = false, retryAttempts = 2) {
    const validation = validateFile(file, ALLOWED_IMAGE_EXTENSIONS);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Automatically optimize large smartphone photos to 1024px (<150KB) for instant upload
    let uploadFile = file;
    if (!isLive && file.size > 180 * 1024) {
      try {
        uploadFile = await optimizeImageForUpload(file);
      } catch (optErr) {
        console.warn('Image optimization fallback:', optErr);
        uploadFile = file;
      }
    }

    const formData = new FormData();
    formData.append('image', uploadFile);
    if (isLive) {
      formData.append('live', 'true');
    }

    try {
      const response = await client.post('/api/predict-image', formData);
      if (response.data && response.data.output_image_url) {
        response.data.output_image_url = resolveApiUrl(response.data.output_image_url);
      }
      return response.data;
    } catch (err) {
      // If Render instance was asleep (502, 503, 504), automatically retry once after a short 2.5s delay
      if (
        !isLive &&
        retryAttempts > 0 &&
        (err.response?.status === 502 || err.response?.status === 503 || err.response?.status === 504 || !err.response)
      ) {
        console.warn(`Server cold start detected. Retrying predictImage (${retryAttempts} attempts left)...`);
        await new Promise((resolve) => setTimeout(resolve, 2500));
        return api.predictImage(file, isLive, retryAttempts - 1);
      }
      throw err;
    }
  },

  /**
   * Predict video using real YOLO model with automatic cold-start retry
   */
  async predictVideo(file, onProgress, retryAttempts = 1) {
    const validation = validateFile(file, ALLOWED_VIDEO_EXTENSIONS);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await client.post('/api/predict-video', formData, {
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });
      if (response.data && response.data.output_video_url) {
        response.data.output_video_url = resolveApiUrl(response.data.output_video_url);
      }
      return response.data;
    } catch (err) {
      if (
        retryAttempts > 0 &&
        (err.response?.status === 502 || err.response?.status === 503 || err.response?.status === 504 || !err.response)
      ) {
        console.warn(`Server cold start detected. Retrying predictVideo (${retryAttempts} attempts left)...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return api.predictVideo(file, onProgress, retryAttempts - 1);
      }
      throw err;
    }
  },

  /**
   * Fetch all inspection reports
   */
  async getReports() {
    try {
      const response = await client.get('/api/reports');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((item) => ({
          ...item,
          outputUrl: resolveApiUrl(item.outputUrl)
        }));
      }
      return response.data;
    } catch (error) {
      console.warn('API /api/reports not yet available, falling back to mock placeholder data:', error.message);
      return { isPlaceholder: true, data: [] };
    }
  },

  /**
   * Delete report
   */
  async deleteReport(reportName) {
    return client.delete(`/api/reports/${encodeURIComponent(reportName)}`);
  },

  /**
   * Clear all reports & data
   */
  async clearAllReports() {
    return client.post('/api/reports/clear-all');
  },

  /**
   * Get Dashboard stats
   */
  async getDashboardStats() {
    try {
      const response = await client.get('/api/stats');
      return response.data;
    } catch (error) {
      console.warn('API /api/stats not yet available, returning placeholder demo data:', error.message);
      return { isPlaceholder: true };
    }
  },

  /**
   * Download raw report file
   */
  getReportDownloadUrl(reportName) {
    return `${BASE_URL}/download-report/${encodeURIComponent(reportName)}`;
  },

  /**
   * Webcam MJPEG stream URL
   */
  getWebcamStreamUrl() {
    return `${BASE_URL}/webcam_feed`;
  }
};

export default api;

