import { useState } from "react";
import api from "../api/api";

export default function AddAdPage() {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const imgbbApiKey = process.env.REACT_APP_IMGBB_API_KEY;

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        setLoading(true);

        try {
            const uploadedUrls = [];
            for (let file of files) {
                const formData = new FormData();
                formData.append("image", file);

                const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
                    method: "POST",
                    body: formData
                });

                const data = await res.json();
                if (data.success) {
                    uploadedUrls.push(data.data.url);
                }
            }

            setImages(prev => [...prev, ...uploadedUrls]);
        } catch (err) {
            console.error("Помилка завантаження зображення:", err);
            alert("Не вдалося завантажити зображення");
        }

        setLoading(false);
    };

    const handleAddAd = async () => {
        if (!title || !price) {
            alert("Заповни всі обов'язкові поля");
            return;
        }

        if (images.length === 0) {
            alert("Додай хоча б одне фото");
            return;
        }

        setLoading(true);
        try {
            await api.post("/ads/", {
                title,
                description,
                price: parseFloat(price),
                images
            });

            alert("Оголошення додано!");
            window.location.href = "/";
        } catch (err) {
            console.error(err);
            alert("Помилка при додаванні");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-4">Нове оголошення</h1>

            <input
                type="text"
                placeholder="Назва"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-2 mb-3 rounded"
            />

            <textarea
                placeholder="Опис"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-2 mb-3 rounded"
            />

            <input
                type="number"
                placeholder="Ціна"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border p-2 mb-3 rounded"
            />

            <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-3"
            />

            {loading && <p>Завантаження...</p>}

            <div className="flex flex-wrap gap-2 mb-4">
                {images.map((url, i) => (
                    <img key={i} src={url} alt="preview" className="w-24 h-24 object-cover rounded" />
                ))}
            </div>

            <button
                onClick={handleAddAd}
                className="bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700"
                disabled={loading}
            >
                Створити оголошення
            </button>
        </div>
    );
}