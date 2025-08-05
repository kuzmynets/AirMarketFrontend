import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ProfilePage() {
    const [user, setUser] = useState({});
    const [ads, setAds] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        // Отримати профіль
        api.get("/user/profile", {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setUser(res.data))
            .catch(err => {
                console.error(err);
                navigate("/login"); // токен недійсний
            });

        // Отримати оголошення користувача
        api.get("/user/ads", {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setAds(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleEdit = () => {
        navigate("/profile/edit");
    };

    const handleDelete = (adId) => {
        const token = localStorage.getItem("token");
        api.delete(`/ads/${adId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(() => {
            setAds(prev => prev.filter(ad => ad.id !== adId));
        }).catch(err => console.error(err));
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="mb-8 p-6 bg-white border rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-2">Профіль</h2>
                <p><strong>Ім’я:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <button
                    onClick={handleEdit}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Редагувати профіль
                </button>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4">Мої оголошення</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {ads.map(ad => (
                        <div key={ad.id} className="border rounded-lg p-4 shadow hover:shadow-md transition">
                            <h4 className="text-lg font-bold">{ad.title}</h4>
                            <p className="text-gray-600">{ad.description}</p>
                            <p className="mt-2 font-semibold text-indigo-600">{ad.price} грн</p>
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => navigate(`/ads/edit/${ad.id}`)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                >
                                    Редагувати
                                </button>
                                <button
                                    onClick={() => handleDelete(ad.id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                >
                                    Видалити
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}