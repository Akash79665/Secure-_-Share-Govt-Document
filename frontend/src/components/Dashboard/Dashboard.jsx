import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    education: 0,
    identity: 0,
    health: 0,
    railway: 0,
    others: 0,
  });
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await documentAPI.getAll();
      const documents = response.data.data;

      const stats = documents.reduce((acc, doc) => {
        acc.total++;
        acc[doc.category]++;
        return acc;
      }, {
        total: 0,
        education: 0,
        identity: 0,
        health: 0,
        railway: 0,
        others: 0,
      });

      setStats(stats);
      setRecentDocs(documents.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Education', key: 'education', icon: '🎓', color: 'bg-blue-500' },
    { name: 'Identity', key: 'identity', icon: '🆔', color: 'bg-green-500' },
    { name: 'Health', key: 'health', icon: '🏥', color: 'bg-red-500' },
    { name: 'Railway', key: 'railway', icon: '🚂', color: 'bg-yellow-500' },
    { name: 'Others', key: 'others', icon: '📄', color: 'bg-purple-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your documents
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Total Documents</p>
                  <p className="text-4xl font-bold mt-2">{stats.total}</p>
                </div>
                <div className="text-5xl opacity-80">📁</div>
              </div>
            </div>

            {categories.map((category) => (
              <div
                key={category.key}
                className={`${category.color} rounded-lg shadow-lg p-6 text-white`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">{category.name}</p>
                    <p className="text-4xl font-bold mt-2">{stats[category.key]}</p>
                  </div>
                  <div className="text-5xl opacity-80">{category.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Documents</h2>
              <Link
                to="/documents"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All →
              </Link>
            </div>

            {recentDocs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No documents yet</p>
                <Link
                  to="/upload"
                  className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                >
                  Upload Your First Document
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentDocs.map((doc) => (
                  <div
                    key={doc._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)} • {doc.fileName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        to={`/documents`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/upload"
              className="bg-primary-600 text-white p-6 rounded-lg hover:bg-primary-700 text-center"
            >
              <div className="text-4xl mb-2">⬆️</div>
              <h3 className="font-semibold">Upload Document</h3>
              <p className="text-sm mt-1 opacity-80">Add new documents</p>
            </Link>
            <Link
              to="/documents"
              className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 text-center"
            >
              <div className="text-4xl mb-2">📋</div>
              <h3 className="font-semibold">My Documents</h3>
              <p className="text-sm mt-1 opacity-80">View all documents</p>
            </Link>
            <Link
              to="/profile"
              className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 text-center"
            >
              <div className="text-4xl mb-2">👤</div>
              <h3 className="font-semibold">My Profile</h3>
              <p className="text-sm mt-1 opacity-80">Manage account</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;