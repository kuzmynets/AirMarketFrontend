import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { onAuth, isLoggedIn } from "../services/authService";

const placeholder = "https://placehold.co/600x400?text=No+Image";

export default function FavoritesPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => onAuth(setUser), []);

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate("/login");
            return;
        }
        let mounted = true;
        api.get("/ads/user/favorites")
            .then(res => mounted && setAds(res.data || []))
            .catch(console.error)
            .finally(() => mounted && setLoading(false));
        return () => (mounted = false);
    }, [navigate, user]);

    if (loading) return <p className="text-center mt-10">Завантаження…</p>;
    if (!ads.length) return <p className="text-center mt-10">Немає вибраних оголошень.</p>;

    return (
        <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {ads.map((ad) => (
                <Link key={ad.id} to={`/ads/${ad.id}`} className="border rounded-lg overflow-hidden hover:shadow transition">
                    <img
                        src={(ad.images && ad.images[0]) || placeholder}
                        alt={ad.title}
                        className="h-48 w-full object-cover"
                    />
                    <div className="p-4">
                        <h3 className="font-semibold line-clamp-1">{ad.title}</h3>
                        <div className="mt-2 text-green-600 font-bold">{ad.price} грн</div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
