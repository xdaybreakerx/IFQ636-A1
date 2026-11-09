import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import { useAuth, getHomePath } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import MyEvents from './pages/MyEvents';
import OpenEvents from './pages/OpenEvents';

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
                <Route path="/my-events" element={<MyEvents />} />
                <Route path="/open-events" element={<OpenEvents />} />
            </Routes>
        </Router>
    );
}

export default App;
