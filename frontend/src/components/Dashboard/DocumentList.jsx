import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [filter, search]);

  const fetchDocuments = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.category = filter;
      if (search) params.search = search;

      const response = await documentAPI.getAll(params);
      setDocuments(response.data.data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentAPI.delete(id);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const downloadDocument = async (docId, fileName) => {
    setDownloadingId(docId);
    
    try {
      // Fetch the full document with fileData
      const response = await documentAPI.getOne(docId);
      const doc = response.data.data;

      if (!doc.fileData) {
        toast.error('File data not found');
        return;
      }

      // Convert base64 to blob
      const byteCharacters = atob(doc.fileData);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: doc.fileType });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || doc.fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    } finally {
      setDownloadingId(null);
    }
  };

  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'education', label: 'Education' },
    { value: 'identity', label: 'Identity' },
    { value: 'health', label: 'Health' },
    { value: 'railway', label: 'Railway' },
    { value: 'others', label: 'Others' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
        <Link
          to="/upload"
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Upload New
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Documents
            </label>
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600 mb-6">
            {search || filter !== 'all' ? 'Try adjusting your filters' : 'Start by uploading your first document'}
          </p>
          <Link
            to="/upload"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Upload Document
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate" title={doc.title}>
                      {doc.title}
                    </h3>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                      doc.category === 'education' ? 'bg-blue-100 text-blue-800' :
                      doc.category === 'identity' ? 'bg-green-100 text-green-800' :
                      doc.category === 'health' ? 'bg-red-100 text-red-800' :
                      doc.category === 'railway' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {doc.category}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2 truncate" title={doc.fileName}>
                  📎 {doc.fileName}
                </p>
                
                <p className="text-xs text-gray-500 mb-4">
                  📅 {new Date(doc.createdAt).toLocaleDateString()} • 
                  💾 {(doc.fileSize / 1024).toFixed(2)} KB
                </p>
                
                {doc.description && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2" title={doc.description}>
                    {doc.description}
                  </p>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadDocument(doc._id, doc.fileName)}
                    disabled={downloadingId === doc._id}
                    className="flex-1 bg-primary-600 text-white px-3 py-2 rounded text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {downloadingId === doc._id ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      <>
                        📥 Download
                      </>
                    )}
                  </button>
                  
                  <Link
                    to={`/share/${doc._id}`}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors text-center flex items-center justify-center"
                  >
                    🔗 Share
                  </Link>
                  
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                    title="Delete document"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;