import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import { useAuth, getHomePath } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import MyEvents from './pages/MyEvents';
import OpenEvents from './pages/OpenEvents';
import CreateEvent from './pages/CreateEvent';
import FeedbackForm from './pages/FeedbackForm';

function App() {
    const { user } = useAuth();

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to={getHomePath(user)} replace />}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/events/mine"
                    element={
                        <ProtectedRoute role="organiser">
                            <MyEvents />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/events/new"
                    element={
                        <ProtectedRoute role="organiser">
                            <CreateEvent />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/events/open"
                    element={
                        <ProtectedRoute role="attendee">
                            <OpenEvents />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/events/:id/feedback"
                    element={
                        <ProtectedRoute role="attendee">
                            <FeedbackForm />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
