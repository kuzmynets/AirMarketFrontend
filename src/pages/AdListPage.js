// src/pages/AdListPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { onAuth } from "../services/authService";

const placeholder = "https://placehold.co/600x400?text=No+Image";

export default function AdListPage() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsub = onAuth(setUser);
        return () => unsub();
    }, []);

    useEffect(() => {
        let mounted = true;
        api.get("/ads")
            .then(res => mounted && setAds(res.data || []))
            .catch(console.error)
            .finally(() => mounted && setLoading(false));
        return () => (mounted = false);
    }, []);

    if (loading) return <p className="text-center mt-10">Завантаження…</p>;

    return (
        <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-20">
            {ads.map(ad => (
                <Link
                    key={ad.id}
                    to={`/ads/${ad.id}`}
                    className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition relative flex flex-col"
                >
                    <img
                        src={(ad.images && ad.images[0]) || placeholder}
                        alt={ad.title}
                        className="w-full h-48 object-contain bg-gray-100"
                    />
                    <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-bold text-lg mb-1 line-clamp-1">{ad.title}</h3>
                        <p className="text-gray-700 flex-grow line-clamp-3">{ad.description}</p>
                        <p className="mt-1 font-semibold">{ad.price} грн</p>
                    </div>
                    {user && ad.is_favorite && (
                        <span className="absolute top-2 right-2 text-red-500 text-xl">♥</span>
                    )}
                </Link>
            ))}
        </div>
    );
}