import axios from 'axios';

// Backend URL configured from environment or fallback to relative URL (supported by Vite proxy)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
   * Predict image using real YOLO model
   */
  async predictImage(file, isLive = false) {
    const validation = validateFile(file, ALLOWED_IMAGE_EXTENSIONS);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('image', file);
    if (isLive) {
      formData.append('live', 'true');
    }

    // Call REST endpoint
    const response = await client.post('/api/predict-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  /**
   * Predict video using real YOLO model
   */
  async predictVideo(file, onProgress) {
    const validation = validateFile(file, ALLOWED_VIDEO_EXTENSIONS);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('video', file);

    const response = await client.post('/api/predict-video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return response.data;
  },

  /**
   * Fetch all inspection reports
   */
  async getReports() {
    try {
      const response = await client.get('/api/reports');
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

