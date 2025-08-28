export default function Modal({ open, onClose, title, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 relative">
                <h2 className="text-lg font-bold mb-4">{title}</h2>
                <div>{children}</div>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}