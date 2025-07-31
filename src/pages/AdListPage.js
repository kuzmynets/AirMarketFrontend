import { useEffect, useState } from "react";
import api from "../api/api";

export default function AdListPage() {
    const [ads, setAds] = useState([]);

    useEffect(() => {
        api.get("/ads")
            .then(res => setAds(res.data))
            .catch(err => console.error(err));
    }, []);

    const showAd = () =>
    {
        
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Оголошення</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {ads.map((ad) => (
                    <div key={ad.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
                        <h2 className="text-xl font-semibold">{ad.title}</h2>
                        <p className="text-gray-600 mt-2">{ad.description}</p>
                        <p className="mt-4 font-bold text-indigo-600">${ad.price}</p>
                        <button
                            onClick={showAd}
                            className="mt-3 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition">
                            Деталі
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}