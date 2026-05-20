import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DownloadCloud, FileText, HardDrive, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://192.168.1.6:5000';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (mimeType) => {
  if (!mimeType) return '📄';
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📕';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '🗜️';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
  return '📄';
};

const DownloadPage = ({ fileId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [roomFiles, setRoomFiles] = useState([]);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/files/info/${fileId}`);
        setFileInfo(res.data.file);
        setRoomFiles(res.data.roomFiles || []);
      } catch (err) {
        console.error('Failed to fetch file info:', err);
        if (err.response?.status === 404) {
          setError('File not found or has expired.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFileInfo();
  }, [fileId]);

  const triggerDownload = (id, name) => {
    const link = document.createElement('a');
    link.href = `${BACKEND_URL}/api/files/download/${id}`;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = (id, name) => {
    triggerDownload(id, name);
    toast.success(`Downloading ${name}`);
  };

  const handleDownloadAll = async () => {
    const files = roomFiles.length > 0 ? roomFiles : (fileInfo ? [fileInfo] : []);
    if (files.length === 0) return;

    setDownloadingAll(true);
    toast.success(`Starting download of ${files.length} file(s)...`);

    for (let i = 0; i < files.length; i++) {
      triggerDownload(files[i]._id, files[i].originalName);
      // Small delay between downloads to prevent browser blocking
      if (i < files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    setDownloadingAll(false);
  };

  // Determine the display list: room files if present, otherwise just the single file
  const displayFiles = roomFiles.length > 0 ? roomFiles : (fileInfo ? [fileInfo] : []);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading file info...</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to DropFlow
          </button>
        </div>
      </div>
    );
  }

  // --- Main Landing Page ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm">
              <DownloadCloud className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">DropFlow</h1>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-50 rounded-2xl mb-5 border border-brand-100">
            <FileText className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Someone shared {displayFiles.length === 1 ? 'a file' : `${displayFiles.length} files`} with you
          </h2>
          <p className="mt-3 text-gray-500 text-lg">
            Review the {displayFiles.length === 1 ? 'file' : 'files'} below and download when you're ready.
          </p>
          {fileInfo?.roomId && (
            <p className="mt-2 text-sm text-brand-600 font-medium">
              Room: {fileInfo.roomId}
            </p>
          )}
        </div>

        {/* File List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {displayFiles.map((file) => (
              <li
                key={file._id}
                className="px-5 py-4 sm:px-6 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
              >
                {/* File Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-2xl flex-shrink-0">{getFileIcon(file.mimeType)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{file.originalName}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <HardDrive className="w-3 h-3" />
                        {formatFileSize(file.size)}
                      </span>
                      {file.createdAt && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={() => handleDownload(file._id, file.originalName)}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Download All Footer */}
          {displayFiles.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 sm:px-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {displayFiles.length} {displayFiles.length === 1 ? 'file' : 'files'} &middot;{' '}
                {formatFileSize(displayFiles.reduce((acc, f) => acc + f.size, 0))} total
              </p>
              <button
                onClick={handleDownloadAll}
                disabled={downloadingAll}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                {downloadingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-4 h-4" />
                    Download All
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-3xl mx-auto px-4 text-center text-gray-500 text-sm">
          Built with React, Node.js, and Socket.io. Files expire after 24 hours.
        </div>
      </footer>
    </div>
  );
};

export default DownloadPage;
