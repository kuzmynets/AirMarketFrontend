import { useEffect, useState } from "react";
import api from "../api/api";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminAdsPage() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // ✅ Відстежуємо користувача
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const fetchPendingAds = async (currentUser) => {
        if (!currentUser) return;
        try {
            const token = await currentUser.getIdToken();
            const res = await api.get("/admin/pending_ads", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAds(res.data);
        } catch (err) {
            console.error("Помилка при завантаженні оголошень:", err);
            alert("Помилка при завантаженні оголошень");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPendingAds(user);
        }
    }, [user]);

    // 🔹 Підтвердження або відхилення оголошення
    const reviewAd = async (adId, action) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            await api.post(`/admin/ads/${adId}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAds((prev) => prev.filter((ad) => ad.id !== adId));
        } catch (err) {
            console.error(`Помилка при ${action} оголошення:`, err);
            alert(`Помилка при ${action} оголошення`);
        }
    };

    if (loading) return <p className="text-center mt-10">Завантаження…</p>;

    if (ads.length === 0)
        return <p className="text-center mt-10">Немає оголошень для підтвердження</p>;

    return (
        <div className="max-w-5xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Очікують підтвердження</h1>
            <div className="flex flex-col gap-4">
                {ads.map((ad) => (
                    <div key={ad.id} className="border p-4 rounded flex justify-between items-center">
                        <div>
                            <h2 className="font-semibold">{ad.title}</h2>
                            <p>{ad.description}</p>
                            <p className="text-green-600 font-bold">{ad.price} грн</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="px-3 py-1 bg-green-600 text-white rounded"
                                onClick={() => reviewAd(ad.id, "approve")}
                            >
                                Підтвердити
                            </button>
                            <button
                                className="px-3 py-1 bg-red-600 text-white rounded"
                                onClick={() => reviewAd(ad.id, "reject")}
                            >
                                Відхилити
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}