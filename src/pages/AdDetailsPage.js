import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { onAuth } from "../services/authService";
import { auth } from "../firebase";
import Modal from "../components/Modal";

const noAvatar = "https://placehold.co/100x100?text=👤";
const noImage = "https://placehold.co/800x600?text=No+Image";

export default function AdDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [modal, setModal] = useState({ open: false, title: "", message: "" });
    const [currentImage, setCurrentImage] = useState(0);

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

    const toggleFavorite = async () => {
        if (!isAuth) {
            navigate("/login");
            return;
        }
        try {
            const res = await api.post(`/ads/${id}/favorite`);
            setAd(prev => ({ ...prev, is_favorite: res.data.is_favorite }));
        } catch (e) {
            console.error(e);
            setModal({ open: true, title: "Помилка", message: "Не вдалося змінити стан вибраного" });
        }
    };

    const startChat = async () => {
        if (!isAuth) {
            navigate("/login");
            return;
        }
        if (!ad?.seller?.uid) {
            setModal({ open: true, title: "Помилка", message: "Неможливо визначити продавця для чату" });
            return;
        }
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await api.post(`/chat/${ad.seller.uid}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/chat/${res.data.chat_id}`);
        } catch (err) {
            console.error(err);
            setModal({ open: true, title: "Помилка", message: "Помилка при створенні чату" });
        }
    };

    if (loading) return <p className="text-center mt-10 text-lg">Завантаження…</p>;
    if (!ad) return <p className="text-center mt-10 text-lg">Оголошення не знайдено</p>;

    const images = ad.images?.length ? ad.images : [noImage];
    const seller = ad.seller || {};
    const avatar = seller.avatar || noAvatar;
    const sellerName = seller.name || "Невідомий продавець";

    return (
        <div className="max-w-5xl mx-auto p-4">
            {/* Модальне вікно для помилок */}
            <Modal open={modal.open} onClose={() => setModal({ ...modal, open: false })} title={modal.title}>
                <p>{modal.message}</p>
            </Modal>

            {/* Карусель картинок */}
            <div className="relative w-full overflow-hidden rounded-lg">
                <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${currentImage * 100}%)` }}>
                    {images.map((img, i) => (
                        <div key={i} className="w-full flex-shrink-0 h-64 md:h-96 cursor-pointer">
                            <img
                                src={img}
                                alt={`Image ${i + 1}`}
                                className="w-full h-full object-contain"
                                onClick={() => setModal({ open: true, title: `Фото ${i + 1}`, message: <img src={img} className="w-full h-auto" /> })}
                            />
                        </div>
                    ))}
                </div>
                {/* Кнопки для перемикання */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)}
                            className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2"
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => setCurrentImage((currentImage + 1) % images.length)}
                            className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2"
                        >
                            ›
                        </button>
                    </>
                )}
            </div>

            <h1 className="text-3xl font-bold mt-4">{ad.title}</h1>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-2">
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

            <p className="mt-4">{ad.description}</p>

            <div className="mt-6 p-4 border rounded flex items-center gap-4">
                <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                <div>
                    <p className="font-bold">{sellerName}</p>
                    {isAuth ? (
                        <button
                            onClick={startChat}
                            className="text-blue-600 underline hover:text-blue-800"
                        >
                            Написати продавцю
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="text-blue-600 hover:underline"
                        >
                            Увійдіть, щоб написати продавцю
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}