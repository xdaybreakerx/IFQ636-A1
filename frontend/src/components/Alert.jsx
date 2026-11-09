const Alert = ({ type, message }) => {
    if (!message) return null;

    let colours = 'bg-green-100 text-green-800 border-green-300';
    if (type === 'error') {
        colours = 'bg-red-100 text-red-800 border-red-300';
    } else if (type === 'warning') {
        colours = 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }

    return (
        <div className={`mb-4 p-3 border rounded ${colours}`} role="alert">
            {message}
        </div>
    );
};

export default Alert;
