import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { auth } from "../firebase";

export default function ChatsPage() {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchChats = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await api.get("/chat/my_chats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
        const interval = setInterval(fetchChats, 5000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString._seconds ? dateString._seconds * 1000 : dateString);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    if (loading) return <p className="text-center mt-10">Завантаження чатів…</p>;
    if (!chats.length) return <p className="text-center mt-10">Чатів немає</p>;

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Мої чати</h1>
            <ul className="flex flex-col gap-2">
                {chats.map(chat => (
                    <li key={chat.chat_id}>
                        <Link
                            to={`/chat/${chat.chat_id}`}
                            className="flex items-center gap-3 p-3 border rounded hover:bg-gray-100"
                        >
                            <img
                                src={chat.other_user_avatar || "https://via.placeholder.com/40"}
                                alt="avatar"
                                className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                                <p className="font-semibold">{chat.other_user_name}</p>
                                <p className="text-sm text-gray-500 truncate">
                                    {chat.last_message || "Без повідомлень"}
                                </p>
                            </div>
                            <span className="text-xs text-gray-400">
                                {formatTime(chat.last_time)}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}