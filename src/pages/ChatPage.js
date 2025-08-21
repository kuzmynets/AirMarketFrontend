import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { auth } from "../firebase";

export default function ChatPage() {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const fetchMessages = async () => {
        if (!chatId) return;
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await api.get(`/chat/${chatId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            const token = await auth.currentUser.getIdToken();
            await api.post(`/chat/${chatId}/send`, { text: newMessage }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewMessage("");
            fetchMessages();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // оновлюємо кожні 3 секунди
        return () => clearInterval(interval);
    }, [chatId]);

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="h-96 border p-2 overflow-y-auto mb-4">
                {messages.map(msg => (
                    <div key={msg.id} className="mb-2">
                        <b>{msg.senderId}</b>: {msg.text}
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="flex-1 border p-2"
                    placeholder="Напишіть повідомлення..."
                />
                <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Відправити
                </button>
            </div>
        </div>
    );
}
