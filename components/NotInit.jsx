const NotInit = () => {
    return (
        <div className="h-screen -mt-20">
            <div className="loader bg-lightgray">
                {loadingIcon()}
                <p className="mt-5 text-gray font-medium">The election has not started, please wait<span className="animate-pulse">...</span></p>
            </div>
        </div>
    );
};
export default NotInit;

const loadingIcon = () => (
    <svg
        className="animate-spin -mt-1 h-6 w-6 text-dark inline-block"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle className="opacity-15" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path
            className="opacity-50"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
    </svg>
);