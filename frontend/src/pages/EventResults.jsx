import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Alert from '../components/Alert';

const formatDate = (date) =>
    new Date(date).toLocaleString('en-AU', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

// open events past end + 240h count as closed
const displayStatus = (event) => {
    if (event.status === 'open' && new Date() >= new Date(event.closesAt)) {
        return 'closed';
    }
    return event.status;
};

const EventResults = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axiosInstance.get(
                    `/api/events/${id}/results`,
                    { headers: { Authorization: `Bearer ${user.token}` } },
                );
                setResults(response.data);
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message ||
                        'Could not load results for this event.',
                );
            }
            setLoading(false);
        };
        fetchResults();
    }, [id, user.token]);

    const event = results?.event;

    return (
        <div className="max-w-4xl mx-auto mt-10 px-4">
            <Link to="/events/mine" className="text-blue-600">
                ‹ Back to My Events
            </Link>

            <div className="mt-4">
                <Alert type="error" message={errorMessage} />
            </div>

            {loading && <p className="text-gray-600">Loading...</p>}

            {results && (
                <>
                    <div className="bg-white p-4 shadow-md rounded mb-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold">
                                {event.title}
                            </h1>
                            <span className="text-sm bg-gray-200 px-2 py-1 rounded capitalize">
                                {displayStatus(event)}
                            </span>
                        </div>
                        {displayStatus(event) === 'open' && (
                            <p className="text-sm text-gray-600">
                                Closes {formatDate(event.closesAt)}
                            </p>
                        )}
                        {/* no close date is stored for an early close */}
                        {event.status === 'closed' && (
                            <p className="text-sm text-gray-600">
                                Closed early
                            </p>
                        )}
                        {event.status === 'open' &&
                            displayStatus(event) === 'closed' && (
                                <p className="text-sm text-gray-600">
                                    Closed {formatDate(event.closesAt)}
                                </p>
                            )}
                    </div>

                    {results.count === 0 ? (
                        <div className="bg-white p-6 shadow-md rounded text-center">
                            <p className="text-gray-600">No feedback yet</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                <div className="bg-white p-4 shadow-md rounded">
                                    <p className="text-sm text-gray-600">
                                        Responses
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {results.count}
                                    </p>
                                </div>
                                <div className="bg-white p-4 shadow-md rounded">
                                    <p className="text-sm text-gray-600">
                                        Average rating
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {results.average.toFixed(1)}
                                    </p>
                                </div>
                                <div className="bg-white p-4 shadow-md rounded">
                                    <p className="text-sm text-gray-600">
                                        Met expectations
                                    </p>
                                    <p className="font-semibold">
                                        Yes {results.breakdown.Yes} · Partly{' '}
                                        {results.breakdown.Partly} · No{' '}
                                        {results.breakdown.No}
                                    </p>
                                </div>
                            </div>

                            {/* scrolls sideways on small screens instead of squashing */}
                            <div className="bg-white shadow-md rounded overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2">Name</th>
                                            <th className="p-2">Rating</th>
                                            <th className="p-2">
                                                Expectations
                                            </th>
                                            <th className="p-2">Worked well</th>
                                            <th className="p-2">
                                                Could improve
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.responses.map((response) => (
                                            <tr
                                                key={response._id}
                                                className="border-t align-top"
                                            >
                                                <td className="p-2">
                                                    {response.name}
                                                </td>
                                                <td className="p-2">
                                                    {response.rating}
                                                </td>
                                                <td className="p-2">
                                                    {response.metExpectations}
                                                </td>
                                                <td className="p-2">
                                                    {response.workedWell || '—'}
                                                </td>
                                                <td className="p-2">
                                                    {response.improve || '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default EventResults;
