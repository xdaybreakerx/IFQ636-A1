import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Alert from '../components/Alert';

const CreateEvent = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
    });
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState('');

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.trim().length > 100) {
            newErrors.title = 'Title must be 100 characters or less';
        }
        if (!formData.startDate) {
            newErrors.startDate = 'Start date and time is required';
        }
        if (!formData.endDate) {
            newErrors.endDate = 'End date and time is required';
        } else if (
            formData.startDate &&
            new Date(formData.endDate) <= new Date(formData.startDate)
        ) {
            newErrors.endDate = 'End must be after start';
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
            await axiosInstance.post(
                '/api/events',
                {
                    ...formData,
                    // datetime-local is local time, send it as UTC
                    startDate: new Date(formData.startDate).toISOString(),
                    endDate: new Date(formData.endDate).toISOString(),
                },
                { headers: { Authorization: `Bearer ${user.token}` } },
            );
            navigate('/events/mine', { state: { message: 'Event created' } });
        } catch (error) {
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Could not create event. Please try again.');
            }
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10">
            <Link to="/events/mine" className="text-sm text-gray-600">
                ‹ Back
            </Link>
            <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-white p-6 shadow-md rounded mt-2"
            >
                <h1 className="text-2xl font-bold mb-4">Create Event</h1>
                <Alert type="error" message={errorMessage} />
                <div className="mb-4">
                    <label className="block text-sm mb-1">Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                    />
                    {errors.title && (
                        <p className="text-red-600 text-sm mt-1">
                            {errors.title}
                        </p>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-sm mb-1">Description</label>
                    <textarea
                        rows="3"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                description: e.target.value,
                            })
                        }
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                        <label className="block text-sm mb-1">Start *</label>
                        <input
                            type="datetime-local"
                            value={formData.startDate}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    startDate: e.target.value,
                                })
                            }
                            className="w-full p-2 border rounded"
                        />
                        {errors.startDate && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.startDate}
                            </p>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <label className="block text-sm mb-1">End *</label>
                        <input
                            type="datetime-local"
                            value={formData.endDate}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    endDate: e.target.value,
                                })
                            }
                            className="w-full p-2 border rounded"
                        />
                        {errors.endDate && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.endDate}
                            </p>
                        )}
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm mb-1">Location</label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                location: e.target.value,
                            })
                        }
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Link
                        to="/events/mine"
                        className="px-4 py-2 border rounded"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEvent;
