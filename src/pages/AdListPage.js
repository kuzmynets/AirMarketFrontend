import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { onAuth } from "../services/authService";
import Modal from "../components/Modal";

const placeholder = "https://placehold.co/600x400?text=No+Image";

export default function AdListPage() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsub = onAuth(setUser);
        return () => unsub();
    }, []);

    useEffect(() => {
        let mounted = true;
        api
            .get("/ads")
            .then((res) => mounted && setAds(res.data || []))
            .catch((err) => {
                console.error(err);
                setError("Не вдалося завантажити оголошення");
            })
            .finally(() => mounted && setLoading(false));
        return () => (mounted = false);
    }, []);

    if (loading)
        return <p className="text-center mt-10 text-lg font-medium">Завантаження…</p>;

    return (
        <div className="max-w-7xl mx-auto p-4">
            <Modal open={!!error} onClose={() => setError(null)} title="Помилка">
                <p>{error}</p>
            </Modal>

            {ads.length === 0 ? (
                <p className="text-center mt-10 text-gray-500">
                    Поки що немає активних оголошень
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {ads.map((ad) => (
                        <Link
                            key={ad.id}
                            to={`/ads/${ad.id}`}
                            className="group border rounded-xl overflow-hidden shadow hover:shadow-xl transition flex flex-col bg-white"
                        >
                            <div className="relative w-full h-52 bg-gray-100 flex items-center justify-center overflow-hidden">
                                <img
                                    src={(ad.images && ad.images[0]) || placeholder}
                                    alt={ad.title}
                                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                />
                                {user && ad.is_favorite && (
                                    <span className="absolute top-2 right-2 text-red-500 text-2xl drop-shadow">
                        ♥
                    </span>
                                )}
                            </div>

                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-bold text-lg mb-1 line-clamp-1 text-gray-900">
                                    {ad.title}
                                </h3>
                                <p className="text-gray-600 flex-grow line-clamp-2">
                                    {ad.description}
                                </p>
                                <p className="mt-2 font-semibold text-green-600 text-lg">
                                    {ad.price} грн
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}