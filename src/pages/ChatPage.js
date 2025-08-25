import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { auth } from "../firebase";

export default function ChatPage() {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [user, setUser] = useState(null);

    const containerRef = useRef(null);
    const bottomRef = useRef(null);
    const prevCountRef = useRef(0);

    useEffect(() => {
        setUser(auth.currentUser);
    }, []);

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

            // миттєво скролимо вниз
            requestAnimationFrame(() => {
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            });

            fetchMessages();
        } catch (err) {
            console.error(err);
        }
    };

    // Підтягувати повідомлення періодично
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [chatId]);

    // Автопрокрутка завжди до останнього повідомлення
    useEffect(() => {
        if (messages.length > prevCountRef.current) {
            requestAnimationFrame(() => {
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            });
        }
        prevCountRef.current = messages.length;
    }, [messages]);

    const formatTime = (dateLike) => {
        if (!dateLike) return "";
        const date = new Date(
            dateLike._seconds ? dateLike._seconds * 1000 : dateLike
        );
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div
                ref={containerRef}
                className="h-96 border p-2 overflow-y-auto mb-4 bg-gray-50 rounded scroll-smooth"
            >
                {messages.map((msg) => {
                    const isOwn = msg.senderId === user?.uid;
                    const readByOthers = (msg.readBy?.length || 0) > 1;
                    return (
                        <div
                            key={msg.id}
                            className={`flex items-start gap-2 mb-3 ${
                                isOwn ? "justify-end" : "justify-start"
                            }`}
                        >
                            {!isOwn && (
                                <img
                                    src={msg.senderAvatar || "https://via.placeholder.com/40"}
                                    alt="avatar"
                                    className="w-8 h-8 rounded-full"
                                />
                            )}
                            <div
                                className={`p-2 rounded-lg max-w-xs ${
                                    isOwn ? "bg-blue-500 text-white" : "bg-white border"
                                }`}
                            >
                                {!isOwn && (
                                    <p className="text-sm font-semibold">{msg.senderName}</p>
                                )}
                                <p>{msg.text}</p>
                                <div className="flex justify-end items-center gap-1 mt-1 text-xs opacity-70">
                                    <span>{formatTime(msg.createdAt)}</span>
                                    {isOwn && <span>{readByOthers ? "✔✔" : "✔"}</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border p-2 rounded"
                    placeholder="Напишіть повідомлення..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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