import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { documentAPI } from '../../services/api';

const SharedDocument = () => {
  const { token } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSharedDocument();
  }, [token]);

  const fetchSharedDocument = async () => {
    try {
      const response = await documentAPI.getShared(token);
      setDocument(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = () => {
    const byteCharacters = atob(document.fileData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: document.fileType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = document.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('Document downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shared document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            This link may have expired or been revoked.
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-primary-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Shared Document</h1>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-4">📄</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{document.title}</h2>
                  <p className="text-sm text-gray-600">
                    Shared by: {document.sharedBy}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded p-4">
                <div>
                  <p className="text-xs text-gray-600">Category</p>
                  <p className="font-semibold capitalize">{document.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">File Type</p>
                  <p className="font-semibold">{document.fileType.split('/')[1].toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">File Size</p>
                  <p className="font-semibold">{(document.fileSize / 1024).toFixed(2)} KB</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">File Name</p>
                  <p className="font-semibold truncate">{document.fileName}</p>
                </div>
              </div>

              {document.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-800">{document.description}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <button
                onClick={downloadDocument}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Document
              </button>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-xs text-yellow-800">
                <strong>⚠️ Security Notice:</strong> This document has been shared with you temporarily. 
                Please download it if you need to keep a copy, as the link may expire.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Want your own digital locker?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedDocument;