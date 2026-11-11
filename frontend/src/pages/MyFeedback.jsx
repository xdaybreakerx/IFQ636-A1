import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Alert from '../components/Alert';

const formatDate = (date) =>
    new Date(date).toLocaleString('en-AU', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

// closed early has no date, so it gets its own message
const closedMessage = (status, closesAt) =>
    status === 'closed'
        ? 'Feedback was closed by the organiser'
        : `Feedback closed on ${formatDate(closesAt)}`;

const MyFeedback = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState(
        location.state?.message || '',
    );

    // remove the message from history so it doesn't come back on refresh
    useEffect(() => {
        if (location.state?.message) {
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await axiosInstance.get('/api/feedback/mine', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setFeedbackList(response.data);
            } catch (error) {
                setErrorMessage('Could not load your feedback.');
            }
            setLoading(false);
        };
        fetchFeedback();
    }, [user.token]);

    const handleDelete = async (feedback) => {
        if (
            !window.confirm(
                `Delete your feedback for ${feedback.event.title}? This can't be undone.`,
            )
        ) {
            return;
        }
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await axiosInstance.delete(`/api/feedback/${feedback._id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setFeedbackList(
                feedbackList.filter((item) => item._id !== feedback._id),
            );
            setSuccessMessage('Feedback deleted');
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message ||
                    'Could not delete your feedback.',
            );
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-6 px-4">
            <h1 className="text-2xl font-bold mb-4">My Feedback</h1>

            <Alert type="success" message={successMessage} />
            <Alert type="error" message={errorMessage} />

            {loading && <p className="text-gray-600">Loading...</p>}

            {!loading && !errorMessage && feedbackList.length === 0 && (
                <div className="bg-white p-6 shadow-md rounded text-center">
                    <p className="text-gray-600 mb-4">
                        You haven't left any feedback yet
                    </p>
                    <Link
                        to="/events/open"
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        See open events
                    </Link>
                </div>
            )}

            {feedbackList.map((feedback) => (
                <div
                    key={feedback._id}
                    className="bg-white p-4 shadow-md rounded mb-3"
                >
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">
                            {feedback.event.title}
                        </h2>
                        {feedback.anonymous && (
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                Anonymous
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600">
                        {formatDate(feedback.event.startDate)}
                    </p>

                    <p className="text-yellow-500 text-xl mt-2">
                        {'★'.repeat(feedback.rating)}
                        {'☆'.repeat(5 - feedback.rating)}
                    </p>
                    <p className="text-sm">
                        Met expectations: {feedback.metExpectations}
                    </p>
                    {feedback.workedWell && (
                        <p className="text-sm text-gray-700 mt-1">
                            Worked well: {feedback.workedWell}
                        </p>
                    )}
                    {feedback.improve && (
                        <p className="text-sm text-gray-700 mt-1">
                            Could improve: {feedback.improve}
                        </p>
                    )}

                    <div className="mt-3">
                        {feedback.feedbackOpen ? (
                            <>
                                <Link
                                    to={`/feedback/${feedback._id}/edit`}
                                    className="inline-block bg-blue-600 text-white px-3 py-1 rounded mr-2"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(feedback)}
                                    className="bg-red-600 text-white px-3 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    disabled
                                    className="bg-blue-600 text-white px-3 py-1 rounded mr-2 opacity-50 cursor-not-allowed"
                                >
                                    Edit
                                </button>
                                <button
                                    disabled
                                    className="bg-red-600 text-white px-3 py-1 rounded opacity-50 cursor-not-allowed"
                                >
                                    Delete
                                </button>
                                <p className="text-sm text-gray-600 mt-2">
                                    {closedMessage(
                                        feedback.event.status,
                                        feedback.closesAt,
                                    )}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyFeedback;
