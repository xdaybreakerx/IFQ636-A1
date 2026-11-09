import { useState, useEffect } from 'react';
import { useAuth, getHomePath } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import Alert from '../components/Alert';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState(
        location.state?.message || '',
    );

    // remove the message from history so it doesn't come back on refresh
    useEffect(() => {
        if (location.state?.message) {
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');
        try {
            const response = await axiosInstance.post(
                '/api/auth/login',
                formData,
            );
            login(response.data);
            navigate(getHomePath(response.data));
        } catch (error) {
            if (error.response && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
            setFormDate({ ...formData, password: '' });
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 shadow-md rounded"
            >
                <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
                <Alert type="success" message={successMessage} />
                <Alert type="error" message={errorMessage} />
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full mb-4 p-2 border rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full mb-4 p-2 border rounded"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded"
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;
