import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">
                Event Feedback
            </Link>
            <div>
                {user ? (
                    <>
                        {user.role === 'organiser' ? (
                            <Link to="/events/mine" className="mr-4">
                                My events
                            </Link>
                        ) : (
                            <>
                                <Link to="/events/open" className="mr-4">
                                    Events
                                </Link>
                                <Link to="/feedback/mine" className="mr-4">
                                    My feedback
                                </Link>
                            </>
                        )}
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="mr-4">
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="bg-green-500 px-4 py-2 rounded hover:bg-green-700"
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
