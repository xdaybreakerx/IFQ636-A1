import { useState, useEffect } from 'react';
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
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axiosInstance.get('/api/events/open', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setEvents(response.data);
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
                </div>
            ))}
        </div>
    );
};

export default OpenEvents;
