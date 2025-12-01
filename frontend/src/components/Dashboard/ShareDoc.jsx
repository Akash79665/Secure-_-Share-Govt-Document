import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { documentAPI } from '../../services/api';

const ShareDoc = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [email, setEmail] = useState('');
  const [expiryHours, setExpiryHours] = useState('24');
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await documentAPI.getOne(id);
      setDocument(response.data.data);
      if (response.data.data.isShared && response.data.data.shareToken) {
        const link = `${window.location.origin}/shared/${response.data.data.shareToken}`;
        setShareLink(link);
      }
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setSharing(true);

    try {
      const response = await documentAPI.share(id, {
        email: email || undefined,
        expiryHours: parseInt(expiryHours),
      });

      setShareLink(response.data.data.shareLink);
      toast.success(email ? 'Document shared via email!' : 'Share link generated!');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to share document');
    } finally {
      setSharing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard!');
  };

  const handleRevokeShare = async () => {
    if (!window.confirm('Are you sure you want to revoke share access?')) {
      return;
    }

    try {
      await documentAPI.revokeShare(id);
      setShareLink('');
      toast.success('Share access revoked');
      fetchDocument();
    } catch (error) {
      toast.error('Failed to revoke share');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Share Document</h1>
        <p className="mt-1 text-sm text-gray-600">
          Generate a secure link to share: {document?.title}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Details</h3>
          <div className="bg-gray-50 rounded p-4">
            <p className="text-sm"><strong>Title:</strong> {document?.title}</p>
            <p className="text-sm"><strong>Category:</strong> {document?.category}</p>
            <p className="text-sm"><strong>File:</strong> {document?.fileName}</p>
          </div>
        </div>

        <form onSubmit={handleShare} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter email to send notification"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to just generate a shareable link
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link Expiry
            </label>
            <select
              value={expiryHours}
              onChange={(e) => setExpiryHours(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="1">1 Hour</option>
              <option value="6">6 Hours</option>
              <option value="24">24 Hours (1 Day)</option>
              <option value="72">72 Hours (3 Days)</option>
              <option value="168">168 Hours (1 Week)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={sharing}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sharing ? 'Generating...' : 'Generate Share Link'}
          </button>
        </form>
      </div>

      {shareLink && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            ✓ Share Link Generated
          </h3>
          <div className="bg-white border border-green-300 rounded p-3 mb-4">
            <p className="text-sm text-gray-700 break-all">{shareLink}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              📋 Copy Link
            </button>
            <button
              onClick={handleRevokeShare}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              🚫 Revoke Access
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-600">
            This link will expire in {expiryHours} hour(s)
          </p>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate('/documents')}
          className="text-primary-600 hover:text-primary-700"
        >
          ← Back to Documents
        </button>
      </div>
    </div>
  );
};

export default ShareDoc;