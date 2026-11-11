import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Alert from '../components/Alert';

const MAX_LENGTH = 500;

const formatDate = (date) =>
    new Date(date).toLocaleString('en-AU', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

const textQuestions = [
    { name: 'workedWell', label: 'What worked well?' },
    { name: 'improve', label: 'What could be improved?' },
];

// closed early has no date, so it gets its own message
const closedMessage = (status, closesAt) =>
    status === 'closed'
        ? 'Feedback for this event was closed by the organiser'
        : `Feedback for this event closed on ${formatDate(closesAt)}`;

const FeedbackForm = () => {
    const { user } = useAuth();
    // :id on /events/:id/feedback, :feedbackId on /feedback/:feedbackId/edit
    const { id, feedbackId } = useParams();
    const isEdit = Boolean(feedbackId);
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        rating: 0,
        metExpectations: '',
        workedWell: '',
        improve: '',
        anonymous: false,
    });
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    // closed (403) or already submitted (409), shown instead of the form
    const [blockedMessage, setBlockedMessage] = useState('');

    useEffect(() => {
        const headers = { Authorization: `Bearer ${user.token}` };

        const fetchEvent = async () => {
            try {
                const response = await axiosInstance.get(`/api/events/${id}`, {
                    headers,
                });
                setEvent(response.data);
            } catch (error) {
                setErrorMessage('Could not load this event.');
            }
            setLoading(false);
        };

        // edit: load the saved answers into the form
        const fetchFeedback = async () => {
            try {
                const response = await axiosInstance.get(
                    `/api/feedback/${feedbackId}`,
                    { headers },
                );
                const feedback = response.data;
                setEvent(feedback.event);
                setFormData({
                    rating: feedback.rating,
                    metExpectations: feedback.metExpectations,
                    workedWell: feedback.workedWell || '',
                    improve: feedback.improve || '',
                    anonymous: feedback.anonymous,
                });
                if (!feedback.feedbackOpen) {
                    setBlockedMessage(
                        closedMessage(feedback.event.status, feedback.closesAt),
                    );
                }
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message ||
                        'Could not load this feedback.',
                );
            }
            setLoading(false);
        };

        if (isEdit) {
            fetchFeedback();
        } else {
            fetchEvent();
        }
    }, [id, feedbackId, isEdit, user.token]);

    const tooLong =
        formData.workedWell.length > MAX_LENGTH ||
        formData.improve.length > MAX_LENGTH;

    const validate = () => {
        const newErrors = {};
        if (formData.rating < 1) {
            newErrors.rating = 'Please choose a rating';
        }
        if (!formData.metExpectations) {
            newErrors.metExpectations = 'Please choose an option';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const newErrors = validate();
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0 || tooLong) {
            return;
        }

        const headers = { Authorization: `Bearer ${user.token}` };

        try {
            if (isEdit) {
                await axiosInstance.put(
                    `/api/feedback/${feedbackId}`,
                    formData,
                    { headers },
                );
                navigate('/feedback/mine', {
                    state: { message: 'Your feedback was updated' },
                });
            } else {
                await axiosInstance.post(
                    '/api/feedback',
                    { eventId: id, ...formData },
                    { headers },
                );
                navigate('/events/open', {
                    state: { message: 'Thanks, your feedback was submitted' },
                });
            }
        } catch (error) {
            const data = error.response ? error.response.data : null;
            const status = error.response ? error.response.status : null;

            // window closed; a "not yours" 403 has no closesAt and falls through
            if (status === 403 && data.closesAt) {
                setBlockedMessage(closedMessage(data.status, data.closesAt));
            } else if (status === 409) {
                setBlockedMessage(data.message);
            } else if (data && data.errors) {
                setErrors(data.errors);
            } else if (data && data.message) {
                setErrorMessage(data.message);
            } else {
                setErrorMessage('Could not submit feedback. Please try again.');
            }
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-6 px-4">
            <Link
                to={isEdit ? '/feedback/mine' : '/events/open'}
                className="text-sm text-gray-600"
            >
                ‹ Back
            </Link>

            <div className="mt-2">
                <Alert type="error" message={errorMessage} />
            </div>

            {loading && <p className="text-gray-600">Loading...</p>}

            {event && (
                <div className="bg-white p-6 shadow-md rounded">
                    <h1 className="text-2xl font-bold">{event.title}</h1>
                    <p className="text-sm text-gray-600 mb-4">
                        {formatDate(event.startDate)}
                        {event.location && ` · ${event.location}`}
                    </p>

                    {blockedMessage ? (
                        <Alert type="warning" message={blockedMessage} />
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="mb-4">
                                <label className="block text-sm mb-1">
                                    Rate the event *
                                </label>
                                <div>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            aria-label={`${star} star`}
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    rating: star,
                                                })
                                            }
                                            className="text-3xl text-yellow-500 mr-1"
                                        >
                                            {star <= formData.rating
                                                ? '★'
                                                : '☆'}
                                        </button>
                                    ))}
                                </div>
                                {errors.rating && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.rating}
                                    </p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm mb-1">
                                    Did it meet your expectations? *
                                </label>
                                <div className="flex">
                                    {['Yes', 'Partly', 'No'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    metExpectations: option,
                                                })
                                            }
                                            className={`flex-1 py-2 border ${
                                                formData.metExpectations ===
                                                option
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                {errors.metExpectations && (
                                    <p className="text-red-600 text-sm mt-1">
                                        {errors.metExpectations}
                                    </p>
                                )}
                            </div>

                            {textQuestions.map((question) => (
                                <div key={question.name} className="mb-4">
                                    <label className="block text-sm mb-1">
                                        {question.label}
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={formData[question.name]}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                [question.name]: e.target.value,
                                            })
                                        }
                                        className="w-full p-2 border rounded"
                                    />
                                    <p
                                        className={`text-right text-xs ${
                                            formData[question.name].length >
                                            MAX_LENGTH
                                                ? 'text-red-600'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        {formData[question.name].length} /{' '}
                                        {MAX_LENGTH}
                                    </p>
                                    {errors[question.name] && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {errors[question.name]}
                                        </p>
                                    )}
                                </div>
                            ))}

                            <label className="flex items-center text-sm mb-4">
                                <input
                                    type="checkbox"
                                    checked={formData.anonymous}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            anonymous: e.target.checked,
                                        })
                                    }
                                    className="mr-2"
                                />
                                Submit anonymously
                            </label>

                            <button
                                type="submit"
                                disabled={tooLong}
                                className="w-full bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                {isEdit ? 'Save changes' : 'Submit'}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default FeedbackForm;
