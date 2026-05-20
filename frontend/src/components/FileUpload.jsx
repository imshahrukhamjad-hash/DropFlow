import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, File, CheckCircle } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';

const FileUpload = ({ roomId }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success, error
  const [downloadLink, setDownloadLink] = useState('');
  const fileInputRef = useRef(null);
  const { socket } = useSocket();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadState('idle');
      setUploadProgress(0);
      setDownloadLink('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setUploadState('idle');
      setUploadProgress(0);
      setDownloadLink('');
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploadState('uploading');
    const formData = new FormData();
    formData.append('file', file);
    if (roomId) formData.append('roomId', roomId);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || 'http://192.168.1.6:5000'}/api/files/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
            
            // Optional: emit to socket for room wide progress
            if (socket && roomId) {
              socket.emit('upload-progress', { roomId, progress: percentCompleted, fileName: file.name });
            }
          },
        }
      );

      setUploadState('success');
      toast.success('File uploaded successfully!');
      
      // Ensure the download link uses the current window host (which would be the laptop's IP when accessed from mobile)
      let link = response.data.downloadLink;
      if (link) {
        try {
          const url = new URL(link);
          if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
            url.host = window.location.host;
          }
          link = url.toString();
        } catch (e) {
          console.error('Error parsing download link:', e);
        }
      }
      setDownloadLink(link);
      setFile(null); // Clear selected file after success
    } catch (error) {
      console.error('Upload Error:', error);
      setUploadState('error');
      toast.error('An error occurred during upload. Please try again.');
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(downloadLink)
        .then(() => {
          toast.success('Link copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy via navigator.clipboard: ', err);
          fallbackCopyText(downloadLink);
        });
    } else {
      fallbackCopyText(downloadLink);
    }
  };

  const fallbackCopyText = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success('Link copied to clipboard!');
      } else {
        toast.error('Failed to copy link. Please select and copy it manually.');
      }
    } catch (err) {
      console.error('Fallback copy failed', err);
      toast.error('Failed to copy link. Please select and copy it manually.');
    }

    document.body.removeChild(textArea);
  };

  return (
    <div className="max-w-xl mx-auto w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
          ${file ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400 bg-gray-50'}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange} 
        />
        
        {file ? (
          <div className="flex flex-col items-center">
            <File className="w-12 h-12 text-brand-500 mb-3" />
            <p className="font-medium text-gray-800">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
            <p className="font-medium text-gray-700">Drag & drop your file here</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse from device</p>
            <p className="text-xs text-gray-400 mt-4">Maximum file size: 50MB</p>
          </div>
        )}
      </div>

      {file && uploadState === 'idle' && (
        <button 
          onClick={uploadFile}
          className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-sm"
        >
          Upload File
        </button>
      )}

      {uploadState === 'uploading' && (
        <ProgressBar progress={uploadProgress} label="Uploading..." />
      )}

      {uploadState === 'success' && downloadLink && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center text-green-700 mb-2">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">File uploaded successfully!</span>
          </div>
          <div className="flex items-center mt-3 gap-2">
            <input 
              type="text" 
              readOnly 
              value={downloadLink} 
              className="flex-1 bg-white border border-green-200 rounded-lg py-2 px-3 text-sm text-gray-700 focus:outline-none"
            />
            <button 
              onClick={copyToClipboard}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {uploadState === 'error' && (
        <p className="mt-4 text-sm text-red-500 text-center font-medium">An error occurred during upload. Please try again.</p>
      )}
    </div>
  );
};

export default FileUpload;
