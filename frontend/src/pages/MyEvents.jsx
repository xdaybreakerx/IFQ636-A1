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

const MyEvents = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [events, setEvents] = useState([]);
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
            try {
                const response = await axiosInstance.get('/api/events/mine', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setEvents(response.data);
            } catch (error) {
                setErrorMessage('Could not load your events.');
            }
            setLoading(false);
        };
        fetchEvents();
    }, [user.token]);

    return (
        <div className="max-w-4xl mx-auto mt-10 px-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">My Events</h1>
                {events.length > 0 && (
                    <Link
                        to="/events/new"
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Create event
                    </Link>
                )}
            </div>

            <Alert type="success" message={successMessage} />
            <Alert type="error" message={errorMessage} />

            {loading && <p className="text-gray-600">Loading...</p>}

            {!loading && !errorMessage && events.length === 0 && (
                <div className="bg-white p-6 shadow-md rounded text-center">
                    <p className="text-gray-600 mb-4">
                        You haven't created any events yet.
                    </p>
                    <Link
                        to="/events/new"
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Create event
                    </Link>
                </div>
            )}

            {events.map((event) => (
                <div
                    key={event._id}
                    className="bg-white p-4 shadow-md rounded mb-3"
                >
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">{event.title}</h2>
                        <span className="text-sm bg-gray-200 px-2 py-1 rounded capitalize">
                            {event.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">
                        {formatDate(event.startDate)} –{' '}
                        {formatDate(event.endDate)}
                    </p>
                    {event.location && (
                        <p className="text-sm text-gray-600">
                            {event.location}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MyEvents;
