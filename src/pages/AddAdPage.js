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

    const uploadToImgBB = async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(
            `https://api.imgbb.com/1/upload?key=${process.env.REACT_APP_IMGBB_API_KEY}`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await res.json();
        if (!data.success) throw new Error("Upload failed");
        return data.data.url;
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setLoading(true);
        try {
            const uploaded = await Promise.all(files.map(uploadToImgBB));
            setImages((prev) => [...prev, ...uploaded]);
        } catch (err) {
            console.error(err);
            alert("Помилка при завантаженні зображення");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUrlsPaste = (e) => {
        const urls = e.target.value
            .split("\n")
            .map(s => s.trim())
            .filter(Boolean);
        setImages(urls);
    };

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

            <h3 className="font-semibold mt-4">Фото</h3>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="mb-3" />

            <textarea
                placeholder="Або встав кілька URL фото (imgbb), по одному в рядок"
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
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700">
                {loading ? "Збереження..." : "Створити оголошення"}
            </button>
        </div>
    );
}