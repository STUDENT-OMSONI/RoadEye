import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Camera,
  Video,
  Radio,
  UploadCloud,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileDown,
  RefreshCw,
  Scan,
  AlertTriangle
} from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import {
  api,
  validateFile,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_VIDEO_EXTENSIONS,
  calculateSeverity
} from '../services/api';
import { generateDetectionPdf } from '../utils/pdfGenerator';
import { useTheme } from '../context/ThemeContext';
import TiltCard3D from '../components/TiltCard3D';
import { Click3D, Stagger3D, Item3D } from '../components/Motion3D';
import {
  MotionPulse3D,
  AetherLoop,
  NebulaFrame,
  PrismForge,
  LuminaMotion,
  PixelDrift,
} from '../components/MotionPlusEngine';

export default function AIDetection({ backendStatus }) {
  const { isDark } = useTheme();

  // High-contrast inverted dual-mode styling:
  // Dark mode (canvas #091119): Things in LIGHT (white cards, dark text)
  // Light mode (canvas #edf2f7): Things in DARK (navy cards #142430, white text)
  const cardBg = isDark
    ? 'bg-white border border-slate-200/90 text-slate-900 shadow-2xl shadow-black/40'
    : 'bg-[#142430] border border-slate-700/60 text-white shadow-xl shadow-slate-900/10';

  const cardTitle = isDark ? 'text-slate-900 font-bold' : 'text-white font-bold';
  const cardDesc = isDark ? 'text-slate-600' : 'text-slate-300';
  const borderColor = isDark ? 'border-slate-200' : 'border-slate-700/60';

  const tabBarBg = isDark
    ? 'bg-white border border-slate-200/90 shadow-md'
    : 'bg-[#142430] border border-slate-700/60 shadow-md';
  const tabInactiveText = isDark ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white';

  const dropzoneBg = isDark
    ? 'border-slate-300 bg-slate-50 hover:border-[#ea580c]'
    : 'border-slate-700 bg-[#0f1b24] hover:border-[#ea580c]';
  const dropzoneIconBox = isDark
    ? 'bg-orange-50 border-orange-200 text-[#ea580c]'
    : 'bg-[#142430] border-slate-700 text-[#ea580c]';
  const dropzoneTitle = isDark ? 'text-slate-900 font-bold' : 'text-white font-bold';
  const dropzoneSub = isDark ? 'text-slate-500' : 'text-slate-400';

  const statLabel = isDark ? 'text-slate-500 font-medium' : 'text-slate-400 font-medium';
  const statVal = isDark ? 'text-slate-900 font-black' : 'text-white font-black';

  const previewFrameBg = isDark ? 'bg-slate-100 border-slate-200' : 'bg-[#101827] border-[#1f2e42]';
  const tableHeadBg = isDark ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-[#101827] text-slate-400 border-[#1f2e42]';
  const tableRowHover = isDark ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-[#101827]/50 text-slate-300';
  const tableDivide = isDark ? 'divide-slate-200' : 'divide-[#1f2e42]';
  const tableCellPrimary = isDark ? 'text-slate-900 font-medium' : 'text-white font-medium';

  const pageTitle = isDark ? 'text-white' : 'text-slate-900';
  const pageSubtitle = isDark ? 'text-slate-400' : 'text-slate-600';

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'image';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['image', 'video', 'camera'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ==========================================
  // IMAGE DETECTION STATE
  // ==========================================
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const imageInputRef = useRef(null);

  const handleImageSelect = (file) => {
    setImageError(null);
    setImageResult(null);

    const validation = validateFile(file, ALLOWED_IMAGE_EXTENSIONS);
    if (!validation.valid) {
      setImageError(validation.error);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleStartImageDetection = async () => {
    if (!imageFile) return;
    setImageLoading(true);
    setImageError(null);

    try {
      const data = await api.predictImage(imageFile);
      if (!data.success) {
        throw new Error(data.error || 'Failed to detect potholes.');
      }
      setImageResult(data);
    } catch (err) {
      console.error('Image detection failed:', err);
      setImageError(err.response?.data?.error || err.message || 'Detection failed. Ensure backend is running.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleResetImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageResult(null);
    setImageError(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleGenerateImagePdf = () => {
    if (!imageResult) return;
    const severityInfo = calculateSeverity(imageResult.pothole_count, imageResult.detections);
    const avgConf = imageResult.detections?.length > 0
      ? (imageResult.detections.reduce((acc, cur) => acc + (cur.confidence || 0), 0) / imageResult.detections.length)
      : 0;

    generateDetectionPdf({
      reportId: imageResult.report_name?.replace('.txt', '') || `IMG-${Date.now()}`,
      method: 'Image Detection',
      potholeCount: imageResult.pothole_count,
      overallSeverity: severityInfo.level,
      confidence: avgConf,
      detections: imageResult.detections,
      location: 'Road Survey Section',
      originalImageUrl: imagePreview,
      detectedImageUrl: imageResult.output_image_url
    });
  };

  // ==========================================
  // VIDEO DETECTION STATE
  // ==========================================
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoError, setVideoError] = useState(null);
  const [videoResult, setVideoResult] = useState(null);
  const videoInputRef = useRef(null);

  const handleVideoSelect = (file) => {
    setVideoError(null);
    setVideoResult(null);

    const validation = validateFile(file, ALLOWED_VIDEO_EXTENSIONS);
    if (!validation.valid) {
      setVideoError(validation.error);
      return;
    }

    setImageFile(null);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleVideoDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoSelect(e.dataTransfer.files[0]);
    }
  };

  const handleStartVideoDetection = async () => {
    if (!videoFile) return;
    setVideoLoading(true);
    setVideoError(null);
    setVideoProgress(15);

    try {
      const data = await api.predictVideo(videoFile, (pct) => {
        setVideoProgress(Math.min(pct, 95));
      });

      if (!data.success) {
        throw new Error(data.error || 'Video inference failed.');
      }
      setVideoProgress(100);
      setVideoResult(data);
    } catch (err) {
      console.error('Video detection error:', err);
      setVideoError(err.response?.data?.error || err.message || 'Video processing failed.');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleResetVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setVideoResult(null);
    setVideoError(null);
    setVideoProgress(0);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleGenerateVideoPdf = () => {
    if (!videoResult) return;
    const sev = videoResult.max_potholes_in_frame >= 3 ? 'High' : videoResult.total_detections > 0 ? 'Medium' : 'Low';

    generateDetectionPdf({
      reportId: videoResult.report_name?.replace('.txt', '') || `VID-${Date.now()}`,
      method: 'Video Analysis',
      potholeCount: videoResult.total_detections,
      overallSeverity: sev,
      confidence: 0.85,
      location: 'Road Video Corridor',
      summaryNotes: `Processed ${videoResult.frame_count} frames. Potholes found across ${videoResult.frames_with_potholes} frames. Maximum potholes in single frame: ${videoResult.max_potholes_in_frame}.`
    });
  };

  // ==========================================
  // LIVE CAMERA STATE
  // ==========================================
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraDetectionActive, setCameraDetectionActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [livePotholeCount, setLivePotholeCount] = useState(0);
  const [liveSeverity, setLiveSeverity] = useState('Low');
  const [isProcessingFrame, setIsProcessingFrame] = useState(false);

  const videoElementRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
        videoElementRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError('Webcam access error: ' + err.message);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setCameraActive(false);
    setCameraDetectionActive(false);
  };

  // Live detection sampling: captures a frame from video element and runs model inference
  const captureAndDetect = async () => {
    if (!videoElementRef.current || isProcessingFrame) return;
    setIsProcessingFrame(true);

    try {
      const video = videoElementRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsProcessingFrame(false);
          return;
        }
        const file = new File([blob], 'live_frame.jpg', { type: 'image/jpeg' });
        try {
          const data = await api.predictImage(file, true);
          if (data && data.success) {
            setLivePotholeCount(data.pothole_count);
            const sev = calculateSeverity(data.pothole_count, data.detections);
            setLiveSeverity(sev.level);
          }
        } catch {
          // Keep running
        } finally {
          setIsProcessingFrame(false);
        }
      }, 'image/jpeg', 0.85);
    } catch {
      setIsProcessingFrame(false);
    }
  };

  const toggleLiveDetection = () => {
    if (cameraDetectionActive) {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      setCameraDetectionActive(false);
    } else {
      setCameraDetectionActive(true);
      captureAndDetect();
      // Run inference every 2 seconds to avoid freezing the camera feed
      detectionIntervalRef.current = setInterval(captureAndDetect, 2000);
    }
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Stagger3D delay={0.07} className="space-y-6">
      {/* Page Title & Tab Selector */}
      <Item3D tiltOnHover={false}>
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-300'
        }`}>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${pageTitle}`}>AI Detection</h1>
            <p className={`text-xs mt-0.5 font-medium ${pageSubtitle}`}>
              Select detection input method: Image, Video or Live Camera
            </p>
          </div>

          {/* 3 Clean Tabs with 3D Clicks (Responsive Grid on Mobile) */}
          <div className={`w-full sm:w-auto grid grid-cols-3 sm:flex items-center rounded-xl p-1.5 border shadow-md transition-colors duration-200 ${tabBarBg}`}>
            <Click3D fullWidth scaleDown={0.92} depth={-10} tiltX={-4} className="w-full">
              <button
                onClick={() => switchTab('image')}
                className={`w-full justify-center flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'image'
                    ? 'bg-[#ea580c] text-white shadow-sm'
                    : tabInactiveText
                }`}
              >
                <Camera size={15} />
                <span>Image</span>
              </button>
            </Click3D>

            <Click3D fullWidth scaleDown={0.92} depth={-10} tiltX={-4} className="w-full">
              <button
                onClick={() => switchTab('video')}
                className={`w-full justify-center flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'video'
                    ? 'bg-[#ea580c] text-white shadow-sm'
                    : tabInactiveText
                }`}
              >
                <Video size={15} />
                <span>Video</span>
              </button>
            </Click3D>

            <Click3D fullWidth scaleDown={0.92} depth={-10} tiltX={-4} className="w-full">
              <button
                onClick={() => switchTab('camera')}
                className={`w-full justify-center flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 sm:px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'camera'
                    ? 'bg-[#ea580c] text-white shadow-sm'
                    : tabInactiveText
                }`}
              >
                <Radio size={15} />
                <span>Camera</span>
              </button>
            </Click3D>
          </div>
        </div>
      </Item3D>

      {/* ========================================================================= */}
      {/* TAB 1: IMAGE DETECTION */}
      {/* ========================================================================= */}
      {activeTab === 'image' && (
        <div className="space-y-6">
          {imageError && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span>{imageError}</span>
            </div>
          )}

          {/* Upload & Preview Step */}
          {!imageResult && (
            <div className={`${cardBg} rounded-2xl p-6 shadow-xl space-y-4 border transition-colors`}>
              <div className={`flex items-center justify-between pb-3 border-b ${borderColor}`}>
                <h2 className={`text-base font-bold flex items-center gap-2 ${cardTitle}`}>
                  <Camera size={18} className="text-[#ea580c]" />
                  Upload Road Image
                </h2>
                {imageFile && (
                  <button
                    onClick={handleResetImage}
                    className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={13} /> Reset
                  </button>
                )}
              </div>

              {!imagePreview ? (
                /* Drag & Drop Area */
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleImageDrop}
                  onClick={() => imageInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 sm:p-12 text-center transition-colors cursor-pointer ${dropzoneBg}`}
                >
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.bmp"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                  />
                  <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full border flex items-center justify-center mb-3 shadow-inner ${dropzoneIconBox}`}>
                    <UploadCloud size={24} className="sm:hidden" />
                    <UploadCloud size={28} className="hidden sm:block" />
                  </div>
                  <p className={`text-xs sm:text-sm font-bold ${dropzoneTitle}`}>
                    Click to upload or drag and drop image
                  </p>
                  <p className={`text-[11px] sm:text-xs ${dropzoneSub} mt-1`}>
                    PNG, JPG, JPEG, BMP (up to 100MB)
                  </p>
                </div>
              ) : (
                /* Preview & Detect Button */
                <div className="space-y-4">
                  <div className={`relative rounded-xl overflow-hidden bg-black border ${borderColor} max-h-[340px] sm:max-h-[460px] flex items-center justify-center p-2`}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-[320px] sm:max-h-[440px] w-auto object-contain rounded-lg"
                    />
                    <button
                      onClick={handleResetImage}
                      className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/70 hover:bg-black text-white p-2 rounded-lg transition-colors"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-slate-400 truncate max-w-xs">
                      {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                    </span>

                    <LuminaMotion className="w-full sm:w-auto">
                      <button
                        onClick={handleStartImageDetection}
                        disabled={imageLoading}
                        className="w-full sm:w-auto justify-center inline-flex items-center gap-2 bg-gradient-to-r from-[#ea580c] to-amber-600 hover:from-orange-600 hover:to-orange-500 disabled:bg-slate-700 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full shadow-md shadow-black/20 transition-all"
                      >
                        {imageLoading ? (
                          <>
                            <RefreshCw size={16} className="animate-spin text-white" />
                            <span>Processing YOLOv8...</span>
                          </>
                        ) : (
                          <>
                            <Scan size={16} />
                            <span>Detect</span>
                          </>
                        )}
                      </button>
                    </LuminaMotion>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results View: Original vs Result, Count, Confidence, Severity, [Download PDF] */}
          {imageResult && (
            <div className="space-y-6">
              {/* Stat Summary Bar with MotionPulse3D */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MotionPulse3D pulseScale={1.02} pulseSpeed={4} depth={-10}>
                  <div className={`${cardBg} rounded-2xl p-4 shadow-md border h-full`}>
                    <span className={`text-xs ${statLabel} block`}>Potholes Detected</span>
                    <span className={`text-2xl font-black ${statVal} mt-1 block`}>
                      {imageResult.pothole_count}
                    </span>
                  </div>
                </MotionPulse3D>

                <MotionPulse3D pulseScale={1.02} pulseSpeed={3.6} depth={-10}>
                  <div className={`${cardBg} rounded-2xl p-4 shadow-md border h-full`}>
                    <span className={`text-xs ${statLabel} block`}>Avg Confidence</span>
                    <span className="text-2xl font-black text-[#ea580c] mt-1 block">
                      {imageResult.detections?.length > 0
                        ? `${(
                            (imageResult.detections.reduce((acc, cur) => acc + (cur.confidence || 0), 0) /
                              imageResult.detections.length) *
                            100
                          ).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                </MotionPulse3D>

                <MotionPulse3D pulseScale={1.02} pulseSpeed={4.4} depth={-10}>
                  <div className={`${cardBg} rounded-2xl p-4 shadow-md border h-full`}>
                    <span className={`text-xs ${statLabel} block`}>Hazard Severity</span>
                    <div className="mt-2">
                      <SeverityBadge
                        severity={calculateSeverity(imageResult.pothole_count, imageResult.detections).level}
                        size="md"
                      />
                    </div>
                  </div>
                </MotionPulse3D>

                <MotionPulse3D pulseScale={1.02} pulseSpeed={4.2} depth={-10}>
                  <div className={`${cardBg} rounded-2xl p-4 shadow-md border flex flex-col justify-between h-full`}>
                    <span className={`text-xs ${statLabel} block`}>Export</span>
                    <Click3D fullWidth scaleDown={0.93} depth={-10} tiltX={-3}>
                      <button
                        onClick={handleGenerateImagePdf}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-[#ea580c] hover:bg-orange-500 text-white text-xs font-bold py-2 px-3 rounded-full transition-all shadow-md"
                      >
                        <FileDown size={14} /> Download PDF
                      </button>
                    </Click3D>
                  </div>
                </MotionPulse3D>
              </div>

              {/* Side by side: Original vs Result with Bounding Boxes */}
              <div className={`${cardBg} rounded-2xl p-6 shadow-xl space-y-4 border`}>
                <div className={`flex items-center justify-between pb-3 border-b ${borderColor}`}>
                  <h3 className={`text-sm font-bold ${cardTitle}`}>Detection Comparison</h3>
                  <Click3D scaleDown={0.92} depth={-8}>
                    <button
                      onClick={handleResetImage}
                      className="text-xs text-[#ea580c] hover:text-orange-400 flex items-center gap-1 font-bold"
                    >
                      <RotateCcw size={13} /> Detect Another Image
                    </button>
                  </Click3D>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Image */}
                  <div className="space-y-2">
                    <span className={`text-xs font-semibold block ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>Original Input</span>
                    <div className={`rounded-xl overflow-hidden ${previewFrameBg} h-[240px] sm:h-[340px] flex items-center justify-center border`}>
                      <img
                        src={imagePreview}
                        alt="Original"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Detected Image */}
                  <div className="space-y-2">
                    <span className={`text-xs font-semibold block ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>
                      YOLOv8 Result ({imageResult.pothole_count} bounding boxes)
                    </span>
                    <div className={`rounded-xl overflow-hidden ${previewFrameBg} h-[240px] sm:h-[340px] flex items-center justify-center border`}>
                      <img
                        src={imageResult.output_image_url}
                        alt="Detected Result"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Individual Pothole Details Table (if any) */}
                {imageResult.detections && imageResult.detections.length > 0 && (
                  <div className={`pt-4 border-t ${borderColor} space-y-2`}>
                    <h4 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      Detected Pothole Bounding Boxes
                    </h4>
                    <div className={`overflow-x-auto rounded-lg border ${borderColor}`} style={{ WebkitOverflowScrolling: 'touch' }}>
                      <table className={`min-w-[480px] w-full text-xs text-left ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>
                        <thead className={`uppercase tracking-wider text-[11px] ${tableHeadBg}`}>
                          <tr>
                            <th className="px-3 py-2">Defect #</th>
                            <th className="px-3 py-2">Confidence</th>
                            <th className="px-3 py-2">Box Dimensions</th>
                            <th className="px-3 py-2">Coordinates (x1, y1) to (x2, y2)</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${tableDivide}`}>
                          {imageResult.detections.map((d) => (
                            <tr key={d.id} className={`${tableRowHover} transition-colors`}>
                              <td className={`px-3 py-2 ${tableCellPrimary}`}>Pothole #{d.id}</td>
                              <td className="px-3 py-2 font-mono text-[#ea580c] font-bold">
                                {(d.confidence * 100).toFixed(1)}%
                              </td>
                              <td className="px-3 py-2 font-mono">
                                {d.width} × {d.height} px
                              </td>
                              <td className={`px-3 py-2 font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                ({d.x1}, {d.y1}) to ({d.x2}, {d.y2})
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VIDEO DETECTION */}
      {/* ========================================================================= */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          {videoError && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span>{videoError}</span>
            </div>
          )}

          {!videoResult && (
            <div className={`${cardBg} rounded-2xl p-6 shadow-xl space-y-4 border transition-colors`}>
              <div className={`flex items-center justify-between pb-3 border-b ${borderColor}`}>
                <h2 className={`text-base font-bold flex items-center gap-2 ${cardTitle}`}>
                  <Video size={18} className="text-[#ea580c]" />
                  Upload Road Video (MP4)
                </h2>
                {videoFile && (
                  <button
                    onClick={handleResetVideo}
                    className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={13} /> Reset
                  </button>
                )}
              </div>

              {!videoPreview ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleVideoDrop}
                  onClick={() => videoInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 sm:p-12 text-center transition-colors cursor-pointer ${dropzoneBg}`}
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept=".mp4"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleVideoSelect(e.target.files[0])}
                  />
                  <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full border flex items-center justify-center mb-3 shadow-inner ${dropzoneIconBox}`}>
                    <Video size={24} className="sm:hidden" />
                    <Video size={28} className="hidden sm:block" />
                  </div>
                  <p className={`text-xs sm:text-sm font-bold ${dropzoneTitle}`}>
                    Click to upload or drag and drop MP4 video
                  </p>
                  <p className={`text-[11px] sm:text-xs ${dropzoneSub} mt-1`}>
                    MP4 format (up to 100MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`rounded-xl overflow-hidden bg-black max-h-[300px] sm:max-h-[380px] flex items-center justify-center border ${borderColor}`}>
                    <video
                      src={videoPreview}
                      controls
                      className="max-h-[280px] sm:max-h-[360px] w-auto"
                    />
                  </div>

                  {videoLoading && (
                    <div className="space-y-2 py-2">
                      <div className={`flex justify-between text-xs ${cardDesc}`}>
                        <span>Processing video with YOLOv8...</span>
                        <span className="font-bold text-[#ea580c]">{videoProgress}%</span>
                      </div>
                      <div className={`w-full rounded-full h-2 overflow-hidden border ${isDark ? 'bg-slate-200 border-slate-300' : 'bg-[#101827] border-[#1f2e42]'}`}>
                        <div
                          className="bg-[#ea580c] h-full transition-all duration-300"
                          style={{ width: `${videoProgress}%` }}
                        ></div>
                      </div>
                      <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'} text-center pt-1`}>
                        Analyzing frames, drawing bounding boxes, and rendering output video...
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} truncate max-w-xs`}>
                      {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </span>

                    <LuminaMotion className="w-full sm:w-auto">
                      <button
                        onClick={handleStartVideoDetection}
                        disabled={videoLoading}
                        className="w-full sm:w-auto justify-center inline-flex items-center gap-2 bg-gradient-to-r from-[#ea580c] to-amber-600 hover:from-orange-600 hover:to-orange-500 disabled:bg-slate-700 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full shadow-md shadow-black/20 transition-all"
                      >
                        {videoLoading ? (
                          <>
                            <RefreshCw size={16} className="animate-spin text-white" />
                            <span>Detecting...</span>
                          </>
                        ) : (
                          <>
                            <Play size={16} />
                            <span>Detect</span>
                          </>
                        )}
                      </button>
                    </LuminaMotion>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processed Video Result */}
          {videoResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MotionPulse3D pulseScale={1.02} pulseSpeed={4.2} depth={-10}>
                  <div className={`${cardBg} rounded-2xl p-4 shadow-md border h-full`}>
                    <span className={`text-xs ${statLabel} block`}>Total Detections</span>
                    <span className={`text-2xl font-black ${statVal} mt-1 block`}>
                      {videoResult.total_detections}
                    </span>
                  </div>
                </MotionPulse3D>

                <MotionPulse3D pulseScale={1.02} pulseSpeed={3.6} depth={-10}>
                  <div className={`${cardBg} rounded-2xl p-4 shadow-md border h-full`}>
                    <span className={`text-xs ${statLabel} block`}>Frames Analyzed</span>
                    <span className="text-2xl font-black text-[#ea580c] mt-1 block">
                      {videoResult.frame_count}
                    </span>
                  </div>
                </MotionPulse3D>

                <MotionPulse3D pulseScale={1.02} pulseSpeed={4} depth={-10}>
                  <div className={`${cardBg} rounded-2xl p-4 shadow-md border h-full`}>
                    <span className={`text-xs ${statLabel} block`}>Max in Frame</span>
                    <span className="text-2xl font-black text-amber-500 mt-1 block">
                      {videoResult.max_potholes_in_frame}
                    </span>
                  </div>
                </MotionPulse3D>

                <MotionPulse3D pulseScale={1.02} pulseSpeed={4.4} depth={-10}>
                  <div className={`${cardBg} rounded-2xl p-4 shadow-md border flex flex-col justify-between h-full`}>
                    <span className={`text-xs ${statLabel} block`}>Export</span>
                    <Click3D fullWidth scaleDown={0.93} depth={-10} tiltX={-3}>
                      <button
                        onClick={handleGenerateVideoPdf}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-[#ea580c] hover:bg-orange-600 text-white text-xs font-bold py-2 px-3 rounded-full transition-all shadow-md"
                      >
                        <FileDown size={14} /> Download PDF
                      </button>
                    </Click3D>
                  </div>
                </MotionPulse3D>
              </div>

              {/* Video Player */}
              <div className={`${cardBg} rounded-2xl p-6 shadow-xl space-y-4 border`}>
                <div className={`flex items-center justify-between pb-3 border-b ${borderColor}`}>
                  <h3 className={`text-sm font-bold ${cardTitle}`}>Processed Video Result</h3>
                  <Click3D scaleDown={0.92} depth={-8}>
                    <button
                      onClick={handleResetVideo}
                      className="text-xs text-[#ea580c] hover:text-orange-500 flex items-center gap-1 font-bold"
                    >
                      <RotateCcw size={13} /> Detect Another Video
                    </button>
                  </Click3D>
                </div>

                <div className={`rounded-xl overflow-hidden bg-black max-h-[460px] flex items-center justify-center border ${borderColor}`}>
                  <video
                    src={videoResult.output_video_url}
                    controls
                    className="max-h-[440px] w-auto"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LIVE CAMERA */}
      {/* ========================================================================= */}
      {activeTab === 'camera' && (
        <div className="space-y-6">
          {cameraError && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          <div className={`${cardBg} rounded-2xl p-6 shadow-xl space-y-4 border transition-colors`}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${borderColor}`}>
              <div>
                <h2 className={`text-base font-bold flex items-center gap-2 ${cardTitle}`}>
                  <Radio size={18} className="text-[#ea580c]" />
                  Live Camera Feed
                </h2>
                <p className={`text-xs ${cardDesc} mt-0.5`}>
                  Connect device webcam for real-time pothole monitoring
                </p>
              </div>

              {/* Start/Stop Camera Button */}
              <div className="w-full sm:w-auto">
                <Click3D scaleDown={0.93} depth={-12} tiltX={-4} className="w-full sm:w-auto">
                  {!cameraActive ? (
                    <button
                      onClick={startCamera}
                      className="w-full sm:w-auto justify-center inline-flex items-center gap-2 bg-[#ea580c] hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-md"
                    >
                      <Play size={14} /> Start Camera
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="w-full sm:w-auto justify-center inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-md"
                    >
                      <X size={14} /> Stop Camera
                    </button>
                  )}
                </Click3D>
              </div>
            </div>

            {/* Video Feed Screen */}
            <div className={`relative rounded-xl overflow-hidden bg-black min-h-[260px] sm:min-h-[420px] flex items-center justify-center border ${borderColor}`}>
              <video
                ref={videoElementRef}
                autoPlay
                playsInline
                muted
                className={`w-full max-h-[460px] object-contain ${!cameraActive ? 'hidden' : 'block'}`}
              />

              {!cameraActive && (
                <div className="text-center p-6 sm:p-8 space-y-3">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full border ${isDark ? 'bg-slate-100 border-slate-300 text-slate-500' : 'bg-[#101827] border-[#1f2e42] text-slate-500'}`}>
                    <Camera size={24} />
                  </div>
                  <p className={`text-sm font-bold ${cardTitle}`}>Camera is turned off</p>
                  <p className={`text-xs ${cardDesc} max-w-xs mx-auto`}>
                    Click "Start Camera" above to activate your webcam and detect road defects.
                  </p>
                </div>
              )}

              {/* HUD Overlay when Camera & Detection Active */}
              {cameraActive && (
                <div className={`absolute top-3 left-3 backdrop-blur-sm border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs ${isDark ? 'bg-white/90 border-slate-200 text-slate-900 shadow-md' : 'bg-[#101827]/80 border-[#1f2e42] text-slate-200'}`}>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className={`font-mono ${isDark ? 'text-slate-800 font-bold' : 'text-slate-200'}`}>FEED LIVE</span>
                </div>
              )}
            </div>

            {/* Live Count and Live Controls */}
            {cameraActive && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center justify-around sm:justify-start gap-6">
                  <div>
                    <span className={`text-xs ${statLabel} block`}>Live Count</span>
                    <span className={`text-xl font-bold ${statVal} block mt-0.5`}>
                      {livePotholeCount} potholes
                    </span>
                  </div>

                  <div>
                    <span className={`text-xs ${statLabel} block`}>Live Severity</span>
                    <div className="mt-1">
                      <SeverityBadge severity={liveSeverity} size="sm" />
                    </div>
                  </div>
                </div>

                <Click3D scaleDown={0.93} depth={-12} tiltX={-4} className="w-full sm:w-auto">
                  <button
                    onClick={toggleLiveDetection}
                    className={`w-full sm:w-auto justify-center inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-md ${
                      cameraDetectionActive
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                        : 'bg-[#ea580c] hover:bg-orange-600 text-white'
                    }`}
                  >
                    <Scan size={14} />
                    <span>{cameraDetectionActive ? 'Pause Detection' : 'Start Detection'}</span>
                  </button>
                </Click3D>
              </div>
            )}
          </div>
        </div>
      )}
    </Stagger3D>
  );
}
