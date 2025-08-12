import { useEffect, useState } from "react";
import api from "../api/api";
import { Link } from "react-router-dom";

export default function FavoritesPage() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await api.get("/favorites");
                setAds(res.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchFavorites();
    }, []);

    if (loading) return <p className="text-center">Завантаження...</p>;

    if (ads.length === 0) {
        return <p className="text-center mt-10">У вас поки немає вибраних оголошень</p>;
    }

    return (
        <div className="max-w-6xl mx-auto py-6 px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {ads.map(ad => (
                <Link to={`/ads/${ad.id}`} key={ad.id} className="border rounded shadow hover:shadow-lg transition">
                    {ad.images.length > 0 && (
                        <img src={ad.images[0]} alt={ad.title} className="h-48 w-full object-cover rounded-t" />
                    )}
                    <div className="p-4">
                        <h2 className="font-bold text-lg">{ad.title}</h2>
                        <p className="text-green-600 font-semibold">{ad.price} грн</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}