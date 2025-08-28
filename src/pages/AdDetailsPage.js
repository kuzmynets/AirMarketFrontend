import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { onAuth } from "../services/authService";
import { auth } from "../firebase";
import Notification from "../components/Notification";


const noAvatar = "https://placehold.co/100x100?text=👤";
const noImage = "https://placehold.co/800x600?text=No+Image";

export default function AdDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [notification, setNotification] = useState(null);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [currentPreview, setCurrentPreview] = useState(0);

    const isAuth = !!user;

    useEffect(() => {
        const unsub = onAuth(setUser);
        return () => unsub();
    }, []);

    useEffect(() => {
        let mounted = true;
        api.get(`/ads/${id}`)
            .then(res => mounted && setAd(res.data))
            .catch(() => mounted && setAd(null))
            .finally(() => mounted && setLoading(false));
        return () => (mounted = false);
    }, [id]);

    const showNotification = (text, type = "success") => {
        setNotification({ text, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const toggleFavorite = async () => {
        if (!isAuth) return navigate("/login");
        try {
            const res = await api.post(`/ads/${id}/favorite`);
            setAd(prev => ({ ...prev, is_favorite: res.data.is_favorite }));
            showNotification(res.data.is_favorite ? "Додано у вибране" : "Видалено з вибраного", "success");
        } catch {
            showNotification("Не вдалося змінити стан вибраного", "error");
        }
    };

    const startChat = async () => {
        if (!isAuth) return navigate("/login");
        if (!ad?.seller?.uid) {
            showNotification("Неможливо визначити продавця для чату", "error");
            return;
        }
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await api.post(`/chat/${ad.seller.uid}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/chat/${res.data.chat_id}`);
        } catch {
            showNotification("Помилка при створенні чату", "error");
        }
    };

    if (loading) return <p className="text-center mt-10 text-lg">Завантаження…</p>;
    if (!ad) return <p className="text-center mt-10 text-lg">Оголошення не знайдено</p>;

    const images = ad.images?.length ? ad.images : [noImage];
    const seller = ad.seller || {};
    const avatar = seller.avatar || noAvatar;
    const sellerName = seller.name || "Невідомий продавець";

    return (
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-20 md:pt-16 md:pb-32 relative">

            {/* Notification */}
            {notification && (
                <Notification text={notification.text} type={notification.type} />
            )}

            {/* Fullscreen перегляд фото */}
            {previewOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
                    onClick={() => setPreviewOpen(false)}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setPreviewOpen(false); }}
                        className="absolute top-4 right-4 text-white text-3xl"
                    >
                        ✕
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentPreview((currentPreview - 1 + images.length) % images.length); }}
                        className="absolute left-4 text-white text-4xl"
                    >
                        ‹
                    </button>
                    <img
                        src={images[currentPreview]}
                        alt={`preview ${currentPreview + 1}`}
                        className="max-h-full max-w-full object-contain rounded"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentPreview((currentPreview + 1) % images.length); }}
                        className="absolute right-4 text-white text-4xl"
                    >
                        ›
                    </button>
                </div>
            )}

            {/* Прев’ю каруселі */}
            <div className="flex gap-2 overflow-x-auto rounded-lg mb-6">
                {images.map((img, i) => (
                    <div
                        key={i}
                        className={`flex-shrink-0 w-64 md:w-72 cursor-pointer rounded overflow-hidden border ${currentPreview === i ? "border-blue-500" : "border-gray-200"}`}
                        onClick={() => { setCurrentPreview(i); setPreviewOpen(true); }}
                    >
                        <img src={img} alt={`Image ${i + 1}`} className="w-full h-48 md:h-60 object-cover" />
                    </div>
                ))}
            </div>

            <h1 className="text-3xl font-bold mb-4">{ad.title}</h1>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-2 mb-4">
                <p className="text-2xl text-green-600 font-semibold">{ad.price} грн</p>
                {isAuth && (
                    <button
                        onClick={toggleFavorite}
                        className={`px-4 py-2 rounded ${ad.is_favorite ? "bg-red-500 text-white" : "bg-gray-200"}`}
                    >
                        {ad.is_favorite ? "Прибрати з вибраного" : "Додати у вибране"}
                    </button>
                )}
            </div>

            <p className="mt-4 mb-6">{ad.description}</p>

            <div className="p-4 border rounded flex items-center gap-4">
                <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                <div>
                    <p className="font-bold">{sellerName}</p>
                    {isAuth ? (
                        <button onClick={startChat} className="text-blue-600 underline hover:text-blue-800">
                            Написати продавцю
                        </button>
                    ) : (
                        <button onClick={() => navigate("/login")} className="text-blue-600 hover:underline">
                            Увійдіть, щоб написати продавцю
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}