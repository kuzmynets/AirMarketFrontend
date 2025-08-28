export default function Notification({ message }) {
    if (!message) return null;

    const bgColor = message.type === "success" ? "bg-green-500" : "bg-red-500";

    return (
        <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white z-50 ${bgColor}`}
        >
            {message.text}
        </div>
    );
}
