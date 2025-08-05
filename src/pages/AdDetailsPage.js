import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function AdDetailsPage() {
    const { id } = useParams();
    const [ad, setAd] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8000/ads/${id}`)
            .then((res) => res.json())
            .then((data) => setAd(data))
            .catch((err) => console.error("Помилка при завантаженні:", err));
    }, [id]);

    if (!ad) {
        return <div className="text-center mt-10 text-gray-500">Завантаження...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto mt-10 bg-white p-6 shadow rounded">
            {ad.image_url && (
                <img src={ad.image_url} alt={ad.title} className="w-full h-96 object-cover rounded mb-6" />
            )}
            <h1 className="text-3xl font-bold mb-2">{ad.title}</h1>
            <p className="text-gray-600 text-lg mb-4">{ad.description}</p>
            <p className="text-xl font-semibold text-indigo-600 mb-4">Ціна: {ad.price} грн</p>
        </div>
    );
}
