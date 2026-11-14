import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  FileDown,
  X,
  RefreshCw,
  Camera,
  AlertCircle
} from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import { api } from '../services/api';
import { generateDetectionPdf } from '../utils/pdfGenerator';
import { useTheme } from '../context/ThemeContext';
import { Click3D, Stagger3D, Item3D } from '../components/Motion3D';
import { MotionPulse3D, NebulaFrame } from '../components/MotionPlusEngine';

export default function Reports() {
  const { isDark } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // High-contrast inverted dual-mode styling:
  // Dark mode (canvas #091119): Things in LIGHT (white card, dark text)
  // Light mode (canvas #edf2f7): Things in DARK (navy card, white text)
  const cardBg = isDark
    ? 'bg-white border border-slate-200/90 text-slate-900 shadow-2xl shadow-black/40'
    : 'bg-[#13222e] border border-slate-700/60 text-white shadow-xl shadow-slate-900/10';

  const btnRefresh = isDark
    ? 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-100 shadow-sm'
    : 'border border-slate-700/60 bg-[#142430] text-white hover:bg-slate-800 shadow-sm';

  const theadBg = isDark ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-[#0b141d] text-slate-400 border-[#1f2e42]';
  const tableDivide = isDark ? 'divide-slate-200' : 'divide-[#1f2e42]';
  const tableRowHover = isDark ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-[#162838] text-slate-300';
  const tableIdText = isDark ? 'text-slate-900 font-semibold' : 'text-white font-semibold';
  const methodPill = isDark ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#101827] border-[#1f2e42] text-slate-300';
  const actionBtn = isDark ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-[#101827]';

  const modalBg = isDark ? 'bg-white border-slate-200/90 text-slate-900 shadow-2xl' : 'bg-[#172536] border-[#1f2e42] text-white shadow-2xl';
  const modalInner = isDark ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#101827] border-[#1f2e42] text-white';
  const modalBorder = isDark ? 'border-slate-200' : 'border-[#1f2e42]';
  const modalCloseBtn = isDark ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' : 'bg-[#101827] hover:bg-slate-800 text-slate-300 border-[#1f2e42]';

  // View Modal State
  const [viewReport, setViewReport] = useState(null);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Clear All Modal State
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.getReports();
      if (res && res.success && Array.isArray(res.data)) {
        setReports(res.data);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      setErrorMessage('Could not load reports from backend.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDownloadPdf = (report) => {
    generateDetectionPdf({
      reportId: report.id,
      method: `${report.method || 'Image'} Detection`,
      date: report.date,
      potholeCount: report.potholes || 0,
      overallSeverity: report.severity || 'Low',
      confidence: report.confidence || 0.85,
      location: 'Road Section',
      detectedImageUrl: report.outputUrl
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      if (deleteTarget.reportName) {
        await api.deleteReport(deleteTarget.reportName);
      }
      setReports((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete report from backend.');
    } finally {
      setDeleting(false);
    }
  };

  const handleClearAll = async () => {
    setClearingAll(true);
    setErrorMessage(null);
    try {
      await api.clearAllReports();
      setReports([]);
      setShowClearAllModal(false);
    } catch (err) {
      console.error('Clear all failed:', err);
      setErrorMessage('Failed to clear reports from backend.');
    } finally {
      setClearingAll(false);
    }
  };

  return (
    <Stagger3D delay={0.07} className="space-y-6">
      {/* Top Header */}
      <Item3D tiltOnHover={false}>
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2.5`}>
              Reports
              <MotionPulse3D pulseScale={1.04} pulseSpeed={4} depth={-6}>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#ea580c]/15 border border-[#ea580c]/30 text-[#ea580c]">
                  <span>{reports.length} total</span>
                </span>
              </MotionPulse3D>
            </h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-0.5 font-medium`}>
              Real inspection logs generated from model inference
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {reports.length > 0 && (
              <Click3D scaleDown={0.92} depth={-8}>
                <button
                  onClick={() => setShowClearAllModal(true)}
                  disabled={loading || clearingAll}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white shadow-sm"
                  title="Clear all past reports"
                >
                  <Trash2 size={13} />
                  <span>Clear All</span>
                </button>
              </Click3D>
            )}

            <Click3D scaleDown={0.92} depth={-8}>
              <button
                onClick={loadReports}
                disabled={loading}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${btnRefresh}`}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </Click3D>
          </div>
        </div>
      </Item3D>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Reports Table Card */}
      <div className={`rounded-2xl overflow-hidden shadow-xl border transition-colors ${cardBg}`}>
        {loading ? (
          <div className={`py-16 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Loading reports from backend...
          </div>
        ) : reports.length === 0 ? (
          /* Empty state: No reports */
          <div className="py-16 text-center space-y-3">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full border ${isDark ? 'bg-slate-100 border-slate-300 text-slate-500' : 'bg-[#101827] border-[#1f2e42] text-slate-500'}`}>
              <FileText size={22} />
            </div>
            <h3 className={`text-base font-bold ${isDark ? 'text-slate-900' : 'text-white'}`}>No reports found</h3>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} max-w-sm mx-auto`}>
              Run an image or video detection to generate inspection reports.
            </p>
          </div>
        ) : (
          /* Table: ID | Method | Date | Potholes | Severity | Actions */
          <div className="overflow-x-auto">
            <table className={`w-full text-left text-xs ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>
              <thead className={`uppercase tracking-wider text-[11px] border-b ${theadBg}`}>
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Potholes</th>
                  <th className="px-5 py-3.5">Severity</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${tableDivide}`}>
                {reports.map((report) => (
                  <tr key={report.id} className={`${tableRowHover} transition-colors`}>
                    {/* ID */}
                    <td className={`px-5 py-4 font-mono max-w-[200px] truncate ${tableIdText}`} title={report.id}>
                      {report.id}
                    </td>

                    {/* Method */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${methodPill}`}>
                        {report.method || 'Image'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className={`px-5 py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {report.date}
                    </td>

                    {/* Potholes */}
                    <td className={`px-5 py-4 font-bold ${isDark ? 'text-slate-900' : 'text-white'}`}>
                      {report.potholes}
                    </td>

                    {/* Severity */}
                    <td className="px-5 py-4">
                      <SeverityBadge severity={report.severity} size="sm" />
                    </td>

                    {/* Actions: View | Download PDF | Delete */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View */}
                        <Click3D scaleDown={0.88} depth={-6}>
                          <button
                            onClick={() => setViewReport(report)}
                            className={`p-1.5 rounded-lg transition-colors ${actionBtn}`}
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                        </Click3D>

                        {/* Download PDF */}
                        <Click3D scaleDown={0.88} depth={-6}>
                          <button
                            onClick={() => handleDownloadPdf(report)}
                            className={`p-1.5 rounded-lg transition-colors ${actionBtn}`}
                            title="Download PDF"
                          >
                            <FileDown size={15} />
                          </button>
                        </Click3D>

                        {/* Delete (with confirm) */}
                        <Click3D scaleDown={0.88} depth={-6}>
                          <button
                            onClick={() => setDeleteTarget(report)}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-red-400 hover:bg-[#101827]'}`}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </Click3D>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {viewReport && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl ${modalBg}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${modalBorder}`}>
              <div>
                <h3 className={`text-base font-bold ${isDark ? 'text-slate-900' : 'text-white'}`}>Report View</h3>
                <p className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{viewReport.id}</p>
              </div>
              <button
                onClick={() => setViewReport(null)}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                <X size={18} />
              </button>
            </div>

            {viewReport.outputUrl && (
              <div className={`rounded-xl overflow-hidden bg-black max-h-[300px] flex items-center justify-center border ${modalBorder}`}>
                <img
                  src={viewReport.outputUrl}
                  alt={viewReport.id}
                  className="max-h-[300px] w-auto object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`p-3 rounded-xl border ${modalInner}`}>
                <span className={`block font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Date</span>
                <span className={`font-semibold mt-0.5 block ${isDark ? 'text-slate-900' : 'text-white'}`}>{viewReport.date}</span>
              </div>
              <div className={`p-3 rounded-xl border ${modalInner}`}>
                <span className={`block font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Method</span>
                <span className={`font-semibold mt-0.5 block ${isDark ? 'text-slate-900' : 'text-white'}`}>{viewReport.method || 'Image'}</span>
              </div>
              <div className={`p-3 rounded-xl border ${modalInner}`}>
                <span className={`block font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Potholes Detected</span>
                <span className={`font-bold text-base mt-0.5 block ${isDark ? 'text-slate-900' : 'text-white'}`}>{viewReport.potholes}</span>
              </div>
              <div className={`p-3 rounded-xl border ${modalInner}`}>
                <span className={`block font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Severity</span>
                <div className="mt-1">
                  <SeverityBadge severity={viewReport.severity} size="sm" />
                </div>
              </div>
            </div>

            <div className={`flex items-center justify-end gap-2 pt-2 border-t ${modalBorder}`}>
              <button
                onClick={() => handleDownloadPdf(viewReport)}
                className="inline-flex items-center gap-1.5 bg-[#ea580c] hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <FileDown size={14} /> Download PDF
              </button>
              <button
                onClick={() => setViewReport(null)}
                className={`text-xs px-4 py-2 rounded-lg border font-medium transition-colors ${modalCloseBtn}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl ${modalBg}`}>
            <h3 className={`text-base font-bold ${isDark ? 'text-slate-900' : 'text-white'}`}>Delete Report?</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
              Are you sure you want to permanently delete report{' '}
              <strong className={`font-mono ${isDark ? 'text-slate-900' : 'text-white'}`}>{deleteTarget.id}</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className={`text-xs font-medium px-4 py-2 rounded-lg border transition-colors ${modalCloseBtn}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                {deleting ? 'Deleting...' : 'Delete Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL REPORTS CONFIRMATION MODAL */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl ${modalBg}`}>
            <h3 className={`text-base font-bold ${isDark ? 'text-slate-900' : 'text-white'}`}>Clear All Past Reports?</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
              This will permanently delete all saved inspection reports, audit logs, and past test records to start fresh. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearAllModal(false)}
                disabled={clearingAll}
                className={`text-xs font-medium px-4 py-2 rounded-lg border transition-colors ${modalCloseBtn}`}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={clearingAll}
                className="bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                {clearingAll ? 'Clearing...' : 'Clear All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Stagger3D>
  );
}
