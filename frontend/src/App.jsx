import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import DownloadPage from './components/DownloadPage';
import { useSocket } from './context/SocketContext';
import { Activity, Share2, DownloadCloud } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function App() {
  const { socket } = useSocket();
  const [roomId, setRoomId] = useState('');
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [roomFiles, setRoomFiles] = useState([]);
  const [downloadFileId, setDownloadFileId] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('file-uploaded', (data) => {
      // Add newly uploaded file to the room list
      setRoomFiles((prev) => [data, ...prev]);
    });

    return () => {
      socket.off('file-uploaded');
    };
  }, [socket]);

  // Check if the URL is a shareable download link
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/download/')) {
      const id = path.split('/').pop();
      if (id) {
        setDownloadFileId(id);
      }
    }
  }, []);

  const handleBackFromDownload = () => {
    setDownloadFileId(null);
    window.history.pushState({}, '', '/');
  };

  // If we're on a download page, render the DownloadPage component
  if (downloadFileId) {
    return (
      <>
        <Toaster position="bottom-right" reverseOrder={false} />
        <DownloadPage fileId={downloadFileId} onBack={handleBackFromDownload} />
      </>
    );
  }

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim() && socket) {
      socket.emit('join-room', roomId);
      setJoinedRoom(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Toaster position="bottom-right" reverseOrder={false} />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm">
              <DownloadCloud className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">DropFlow</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {!joinedRoom ? (
              <form onSubmit={handleJoinRoom} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter Room ID" 
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 w-32 sm:w-48 transition-all"
                />
                <button 
                  type="submit"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Join
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg border border-brand-200">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Room: {roomId}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
            Secure, fast file sharing.
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Upload any file up to 50MB and share it instantly with a secure link. 
            Join a room to share multiple files with others in real-time.
          </p>
        </div>

        <FileUpload roomId={joinedRoom ? roomId : null} />

        {/* Room Activity */}
        {joinedRoom && (
          <div className="mt-16 max-w-xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-500" />
              Room Activity
            </h3>
            
            {roomFiles.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {roomFiles.map((file, idx) => (
                    <li key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                          <Share2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <a 
                        href={`${import.meta.env.VITE_BACKEND_URL || 'http://192.168.1.6:5000'}/api/files/download/${file.fileId}`}
                        download
                        className="text-sm font-medium text-brand-600 hover:text-brand-800"
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-8 text-center">
                <p className="text-gray-500">Waiting for files in room {roomId}...</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 text-sm">
          Built with React, Node.js, and Socket.io. Files expire after 24 hours.
        </div>
      </footer>
    </div>
  );
}

export default App;
