import { useState } from "react";
import api from "../api/api";

export default function AddAdPage() {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAddAd = async () => {
        if (!title || !price) {
            alert("Заповни всі обов'язкові поля");
            return;
        }
        setLoading(true);
        try {
            await api.post("/ads", { title, description, price: parseFloat(price) });
            window.location.href = "/";
            alert("Оголошення додано!");
            setTitle("");
            setPrice("");
            setDescription("");
        } catch {
            alert("Помилка при додаванні");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow mt-10">
            <h1 className="text-2xl font-bold mb-4">Додати оголошення</h1>
            <input
                type="text"
                placeholder="Назва оголошення"
                className="w-full mb-3 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <input
                type="number"
                placeholder="Ціна"
                className="w-full mb-3 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />
            <textarea
                placeholder="Опис"
                className="w-full mb-3 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
            />
            <button
                onClick={handleAddAd}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition"
            >
                {loading ? "Завантаження..." : "Додати оголошення"}
            </button>
        </div>
    );
}
