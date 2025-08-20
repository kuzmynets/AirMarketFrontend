import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { onAuth } from "../services/authService";

const noAvatar = "https://placehold.co/100x100?text=👤";
const noImage = "https://placehold.co/800x600?text=No+Image";

export default function AdDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

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
            alert("Не вдалося змінити стан вибраного");
        }
    };

    if (loading) return <p className="text-center mt-10">Завантаження…</p>;
    if (!ad) return <p className="text-center mt-10">Оголошення не знайдено</p>;

    const images = ad.images?.length ? ad.images : [noImage];
    const seller = ad.seller || {};
    const avatar = seller.avatar || noAvatar;
    const sellerName = seller.name || "Невідомий продавець";

    return (
        <div className="max-w-5xl mx-auto p-4">
            <div className="flex gap-3 overflow-x-auto rounded">
                {images.map((img, i) => (
                    <img key={i} src={img} alt="" className="h-72 rounded object-cover" />
                ))}
            </div>

            <h1 className="text-3xl font-bold mt-4">{ad.title}</h1>
            <div className="flex items-center justify-between mt-2">
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
                        <button className="text-blue-600 hover:underline">Написати продавцю</button>
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