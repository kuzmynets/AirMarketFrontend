import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

export default function AdDetailPage() {
    const { id } = useParams();
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const res = await api.get(`/ads/${id}`);
                setAd(res.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchAd();
    }, [id]);

    const toggleFavorite = async () => {
        try {
            await api.post(`/ads/${id}/favorite`);
            setAd(prev => ({ ...prev, is_favorite: !prev.is_favorite }));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <p>Завантаження...</p>;
    if (!ad) return <p>Оголошення не знайдено</p>;

    return (
        <div className="max-w-4xl mx-auto py-6 px-4">
            {/* Фото */}
            <div className="flex gap-2 overflow-x-auto mb-4">
                {ad.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="h-64 rounded object-cover" />
                ))}
            </div>

            {/* Інформація */}
            <h1 className="text-3xl font-bold">{ad.title}</h1>
            <p className="text-xl text-green-600 font-semibold">{ad.price} грн</p>
            <p className="mt-3">{ad.description}</p>

            {/* Продавець */}
            <div className="mt-6 p-4 border rounded flex items-center gap-4">
                <img src={ad.seller.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                <div>
                    <p className="font-bold">{ad.seller.name}</p>
                    <button className="text-blue-600 hover:underline">
                        Написати продавцю
                    </button>
                </div>
            </div>

            {/* Кнопки */}
            <div className="mt-6 flex gap-3">
                <button
                    onClick={toggleFavorite}
                    className={`px-4 py-2 rounded ${ad.is_favorite ? "bg-red-500 text-white" : "bg-gray-200"}`}
                >
                    {ad.is_favorite ? "Прибрати з вибраного" : "Додати у вибране"}
                </button>
            </div>
        </div>
    );
}
