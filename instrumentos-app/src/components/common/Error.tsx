interface ErrorProps {
    message: string;
}

const Error: React.FC<ErrorProps> = ({ message }) => {
    return (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Error</h3>
            <p className="error-message">{message}</p>
        </div>
    );
};

export default Error;