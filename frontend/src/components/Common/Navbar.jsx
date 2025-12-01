import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-primary-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-white text-xl font-bold">
                🔐 Digital Locker
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
              >
                Dashboard
              </Link>
              <Link
                to="/documents"
                className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
              >
                My Documents
              </Link>
              <Link
                to="/upload"
                className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
              >
                Upload
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link
                to="/profile"
                className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium mr-2"
              >
                👤 {user?.name}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;