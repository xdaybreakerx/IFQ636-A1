import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import Alert from '../components/Alert';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = 'Enter a valid email address';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const newErrors = validate();
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
            await axiosInstance.post('/api/auth/register', formData);
            navigate('/login', {
                state: { message: 'Account created. Please log in.' },
            });
        } catch (error) {
            if (error.response && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20">
            <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-white p-6 shadow-md rounded"
            >
                <h1 className="text-2xl font-bold mb-4 text-center">
                    Register
                </h1>
                <Alert type="error" message={errorMessage} />

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                    />
                    {errors.name && (
                        <p className="text-red-600 text-sm mt-1">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full mb-4 p-2 border rounded"
                    />
                    {errors.email && (
                        <p className="text-red-600 text-sm mt-1">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                password: e.target.value,
                            })
                        }
                        className="w-full mb-4 p-2 border rounded"
                    />
                    {errors.password && (
                        <p className="text-red-600 text-sm mt-1">
                            {errors.password}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white p-2 rounded"
                >
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;
