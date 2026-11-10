import { Navigate } from 'react-router-dom';
import { useAuth, getHomePath } from '../context/AuthContext';

// not logged in -> login page
// wrong role -> home page for that role
const ProtectedRoute = ({ children, role }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        return <Navigate to={getHomePath(user.role)} replace />;
    }

    return children;
};

export default ProtectedRoute;
