import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { userAPI } from '../../services/api';

const MyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    aadhaarNumber: '',
    phone: '',
  });
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data.data);
      setEditData({
        name: response.data.data.name,
        phone: response.data.data.phone,
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditData({
      name: profile.name,
      phone: profile.phone,
    });
    setEditing(false);
  };

  const handleSave = async () => {
    if (!editData.name || !editData.phone) {
      toast.error('Please fill all fields');
      return;
    }

    if (!/^\d{10}$/.test(editData.phone)) {
      toast.error('Phone must be 10 digits');
      return;
    }

    setSaving(true);

    try {
      const response = await userAPI.updateProfile(editData);
      setProfile(response.data.data);
      
      const user = JSON.parse(localStorage.getItem('user'));
      user.name = response.data.data.name;
      user.phone = response.data.data.phone;
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account information
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-12 text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-4xl font-bold text-primary-600">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">{profile.name}</h2>
          <p className="text-primary-100">{profile.email}</p>
        </div>

        <div className="px-6 py-6">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  maxLength="10"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
              </div>

              <div className="border-b pb-4">
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="text-lg font-semibold text-gray-900">{profile.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="border-b pb-4">
                <p className="text-sm text-gray-600">Aadhaar Number</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile.aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                </p>
                <p className="text-xs text-gray-500 mt-1">Aadhaar cannot be changed</p>
              </div>

              <div className="border-b pb-4">
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="text-lg font-semibold text-gray-900">{profile.phone}</p>
              </div>

              <div className="border-b pb-4">
                <p className="text-sm text-gray-600">Account Created</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <button
                onClick={handleEdit}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 font-medium mt-4"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📱 Account Security</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Your account is verified</li>
          <li>✓ Two-factor authentication enabled (OTP)</li>
          <li>✓ Aadhaar linked and secured</li>
        </ul>
      </div>
    </div>
  );
};

export default MyProfile;