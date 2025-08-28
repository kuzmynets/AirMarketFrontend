import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { isLoggedIn, onAuth } from "../services/authService";
import Notification from "../components/Notification";

export default function AddAdPage() {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // Для Notification
    const [previewOpen, setPreviewOpen] = useState(false);
    const [currentPreview, setCurrentPreview] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        const unsub = onAuth((u) => {
            if (!u) navigate("/login");
        });
        return () => unsub();
    }, [navigate]);

    const showMessage = (text, type = "success") => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000); // зникає через 3 секунди
    };

    const uploadToImgBB = async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch(
            `https://api.imgbb.com/1/upload?key=${process.env.REACT_APP_IMGBB_API_KEY}`,
            { method: "POST", body: formData }
        );
        const data = await res.json();
        if (!data.success) throw new Error("Upload failed");
        return data.data.url;
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setLoading(true);
        try {
            const uploaded = await Promise.all(files.map(uploadToImgBB));
            setImages((prev) => [...prev, ...uploaded]);
        } catch (err) {
            console.error(err);
            showMessage("Помилка при завантаженні зображень", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUrlsPaste = (e) => {
        const urls = e.target.value
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        setImages(urls);
    };

    const handleAddAd = async () => {
        if (!title || !price) {
            showMessage("Заповніть всі обов'язкові поля", "error");
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
            showMessage("Оголошення скоро буде додано!", "success");
            setTimeout(() => navigate("/"), 1000);
        } catch (e) {
            console.error(e);
            showMessage("Помилка при додаванні оголошення", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn()) return null;

    return (
        <div className="max-w-xl mx-auto px-4 py-10 md:py-16 relative">

            {/* Notification зверху */}
            <Notification message={message} />

            <h1 className="text-2xl font-bold mb-4 text-center md:text-left">Нове оголошення</h1>

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

            <h3 className="font-semibold mt-4 mb-1">Фото</h3>
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-3 w-full"
            />
            <textarea
                placeholder="Або встав кілька URL фото (imgbb), по одному в рядок"
                className="w-full border p-2 mb-3 rounded"
                onChange={handleImageUrlsPaste}
            />

            {/* Прев’ю зображень */}
            <div className="flex flex-wrap gap-2 mb-3">
                {images.map((url, i) => (
                    <img
                        key={i}
                        src={url}
                        alt={`Preview ${i + 1}`}
                        className="w-24 h-24 object-cover rounded cursor-pointer"
                        onClick={() => {
                            setCurrentPreview(i);
                            setPreviewOpen(true);
                        }}
                    />
                ))}
            </div>

            {/* Модаль для перегляду фото full screen */}
            {previewOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
                    onClick={() => setPreviewOpen(false)}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setPreviewOpen(false); }}
                        className="absolute top-4 right-4 text-white text-2xl"
                    >
                        ✕
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentPreview((currentPreview - 1 + images.length) % images.length); }}
                        className="absolute left-4 text-white text-3xl"
                    >
                        ‹
                    </button>
                    <img
                        src={images[currentPreview]}
                        alt="preview"
                        className="max-h-full max-w-full object-contain rounded"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentPreview((currentPreview + 1) % images.length); }}
                        className="absolute right-4 text-white text-3xl"
                    >
                        ›
                    </button>
                </div>
            )}

            {loading && <p className="text-center my-2">Завантаження…</p>}

            <button
                onClick={handleAddAd}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded mt-4 w-full hover:bg-blue-700 transition"
            >
                {loading ? "Збереження..." : "Створити оголошення"}
            </button>
        </div>
    );
}