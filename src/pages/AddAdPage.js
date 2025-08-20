import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { isLoggedIn, onAuth } from "../services/authService";

export default function AddAdPage() {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]); // масив URLів (imgbb)
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsub = onAuth((u) => {
            if (!u) navigate("/login");
        });
        return () => unsub();
    }, [navigate]);

    const handleAddAd = async () => {
        if (!title || !price) {
            alert("Заповни всі обов'язкові поля");
            return;
        }
        setLoading(true);
        try {
            await api.post("/ads", {
                title,
                description,
                price: parseFloat(price),
                images,
            });
            alert("Оголошення додано!");
            navigate("/");
        } catch (e) {
            console.error(e);
            alert("Помилка при додаванні");
        } finally {
            setLoading(false);
        }
    };

    // приклад: приймаємо вже готові URL з imgbb та пушимо у state
    const handleImageUrlsPaste = (e) => {
        const urls = e.target.value
            .split("\n")
            .map(s => s.trim())
            .filter(Boolean);
        setImages(urls);
    };

    if (!isLoggedIn()) return null;

    return (
        <div className="max-w-xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-4">Нове оголошення</h1>

            <input type="text" placeholder="Назва" value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   className="w-full border p-2 mb-3 rounded" />

            <textarea placeholder="Опис" value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border p-2 mb-3 rounded" />

            <input type="number" placeholder="Ціна" value={price}
                   onChange={(e) => setPrice(e.target.value)}
                   className="w-full border p-2 mb-3 rounded" />

            <textarea
                placeholder="Встав кілька URL фото (imgbb), по одному в рядок)"
                className="w-full border p-2 mb-3 rounded"
                onChange={handleImageUrlsPaste}
            />

            {loading && <p>Завантаження…</p>}

            <div className="flex flex-wrap gap-2">
                {images.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-24 h-24 object-cover rounded" />
                ))}
            </div>

            <button onClick={handleAddAd}
                    className="bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700">
                Створити оголошення
            </button>
        </div>
    );
}