import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { onAuth } from "../services/authService";
import Notification from "../components/Notification";

const placeholder = "https://placehold.co/600x400?text=No+Image";

export default function AdListPage() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [notification, setNotification] = useState(null);

    // Фільтри
    const [priceFilter, setPriceFilter] = useState("all"); // all, free, paid
    const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest, priceAsc, priceDesc
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    useEffect(() => {
        const unsub = onAuth(setUser);
        return () => unsub();
    }, []);

    useEffect(() => {
        let mounted = true;
        api.get("/ads")
            .then((res) => {
                if (mounted) setAds(res.data || []);
            })
            .catch((err) => {
                console.error(err);
                if (mounted) showNotification("Не вдалося завантажити оголошення", "error");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => (mounted = false);
    }, []);

    const showNotification = (text, type = "success") => {
        setNotification({ text, type });
        setTimeout(() => setNotification(null), 3000);
    };

    if (loading) return <p className="text-center mt-10 text-lg font-medium">Завантаження…</p>;

    // Фільтрування і сортування
    let filteredAds = [...ads];
    if (priceFilter === "free") filteredAds = filteredAds.filter(ad => ad.price === 0);
    if (priceFilter === "paid") filteredAds = filteredAds.filter(ad => ad.price > 0);

    filteredAds.sort((a, b) => {
        switch (sortOrder) {
            case "newest": return new Date(b.created_at) - new Date(a.created_at);
            case "oldest": return new Date(a.created_at) - new Date(b.created_at);
            case "priceAsc": return a.price - b.price;
            case "priceDesc": return b.price - a.price;
            default: return 0;
        }
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 flex flex-col md:flex-row gap-6">

            {/* Фільтри зліва (sticky) */}
            <aside className="hidden md:flex flex-col w-64 shrink-0 p-4 border rounded gap-4 sticky top-20 h-fit bg-white">
                <h2 className="font-bold text-lg mb-2">Фільтри</h2>
                <div>
                    <label className="font-medium mb-1 block">Тип оголошення</label>
                    <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="all">Усі</option>
                        <option value="free">Безкоштовно</option>
                        <option value="paid">Платно</option>
                    </select>
                </div>
                <div>
                    <label className="font-medium mb-1 block">Сортування</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="newest">Новіші</option>
                        <option value="oldest">Старіші</option>
                        <option value="priceAsc">Ціна ↑</option>
                        <option value="priceDesc">Ціна ↓</option>
                    </select>
                </div>
            </aside>

            {/* Мобільне бургер-меню для фільтрів */}
            <div className="md:hidden mb-4 w-full relative">
                <button
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    className="px-4 py-2 bg-blue-600 text-white rounded w-full"
                >
                    {mobileFiltersOpen ? "Закрити фільтри" : "Фільтри"}
                </button>

                {mobileFiltersOpen && (
                    <div className="absolute top-12 left-0 w-full z-50 p-4 border rounded bg-white shadow-md">
                        <div className="mb-4">
                            <label className="font-medium mb-1 block">Тип оголошення</label>
                            <select
                                value={priceFilter}
                                onChange={(e) => setPriceFilter(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="all">Усі</option>
                                <option value="free">Безкоштовно</option>
                                <option value="paid">Платно</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="font-medium mb-1 block">Сортування</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="newest">Новіші</option>
                                <option value="oldest">Старіші</option>
                                <option value="priceAsc">Ціна ↑</option>
                                <option value="priceDesc">Ціна ↓</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Основний блок оголошень */}
            <main className="flex-1">
                {notification && <Notification text={notification.text} type={notification.type} />}

                {filteredAds.length === 0 ? (
                    <p className="text-center mt-10 text-gray-500">Поки що немає активних оголошень</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAds.map((ad) => {
                            const displayPrice = ad.price === 0 ? "Безкоштовно" : `${ad.price} грн`;
                            return (
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
                                            <span className="absolute top-2 right-2 text-red-500 text-2xl drop-shadow">♥</span>
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                        <h3 className="font-bold text-lg mb-1 line-clamp-1 text-gray-900">{ad.title}</h3>
                                        <p className="text-gray-600 flex-grow line-clamp-2">{ad.description}</p>
                                        <p className="mt-2 font-semibold text-green-600 text-lg">{displayPrice}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
