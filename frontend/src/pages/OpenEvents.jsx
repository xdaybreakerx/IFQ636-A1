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

const OpenEvents = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [submittedIds, setSubmittedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage] = useState(location.state?.message || '');

    // remove the message from history so it doesn't come back on refresh
    useEffect(() => {
        if (location.state?.message) {
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    useEffect(() => {
        const fetchEvents = async () => {
            const headers = { Authorization: `Bearer ${user.token}` };
            try {
                const eventsResponse = await axiosInstance.get(
                    '/api/events/open',
                    { headers },
                );
                const feedbackResponse = await axiosInstance.get(
                    '/api/feedback/mine',
                    { headers },
                );
                setEvents(eventsResponse.data);
                // ids of events this attendee has already reviewed
                setSubmittedIds(
                    feedbackResponse.data.map((feedback) => feedback.event._id),
                );
            } catch (error) {
                setErrorMessage('Could not load open events.');
            }
            setLoading(false);
        };
        fetchEvents();
    }, [user.token]);

    return (
        <div className="max-w-xl mx-auto mt-6 px-4">
            <h1 className="text-2xl font-bold mb-4">Open Events</h1>

            <Alert type="success" message={successMessage} />
            <Alert type="error" message={errorMessage} />

            {loading && <p className="text-gray-600">Loading...</p>}

            {!loading && !errorMessage && events.length === 0 && (
                <div className="bg-white p-6 shadow-md rounded text-center">
                    <p className="text-gray-600">
                        No events are open for feedback right now
                    </p>
                </div>
            )}

            {events.map((event) => (
                <div
                    key={event._id}
                    className="bg-white p-4 shadow-md rounded mb-3"
                >
                    <h2 className="text-lg font-semibold">{event.title}</h2>
                    <p className="text-sm text-gray-600">
                        {formatDate(event.startDate)}
                    </p>
                    {event.location && (
                        <p className="text-sm text-gray-600">
                            {event.location}
                        </p>
                    )}
                    <p className="text-sm text-gray-600 mt-2">
                        Feedback closes {formatDate(event.closesAt)}
                    </p>
                    <div className="text-right mt-2">
                        {submittedIds.includes(event._id) ? (
                            <span className="inline-block bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full">
                                Already submitted
                            </span>
                        ) : (
                            <Link
                                to={`/events/${event._id}/feedback`}
                                className="inline-block bg-green-600 text-white text-sm px-4 py-2 rounded"
                            >
                                Give feedback
                            </Link>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OpenEvents;
