import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import { isLoggedIn, onAuth } from "../services/authService";

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

export default function EditAdPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsub = onAuth((u) => {
            if (!u) navigate("/login");
        });
        return () => unsub();
    }, [navigate]);

    // підвантаження існуючого оголошення
    useEffect(() => {
        const fetchAd = async () => {
            try {
                const res = await api.get(`/ads/${id}`);
                setTitle(res.data.title);
                setPrice(res.data.price);
                setDescription(res.data.description || "");
                setImages(res.data.images || []);
            } catch (err) {
                console.error(err);
                alert("Не вдалося завантажити оголошення");
            }
        };
        fetchAd();
    }, [id]);

    const handleUpdateAd = async () => {
        if (!title || !price) {
            alert("Заповни всі обов'язкові поля");
            return;
        }
        setLoading(true);
        try {
            await api.put(`/ads/${id}`, {
                title,
                description,
                price: parseFloat(price),
                images,
            });
            alert("Оголошення оновлено!");
            navigate("/profile"); // повертаємо на профіль
        } catch (e) {
            console.error(e);
            alert("Помилка при оновленні");
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

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        for (let file of files) {
            try {
                const url = await uploadToImgBB(file);
                setImages((prev) => [...prev, url]);
            } catch (err) {
                console.error(err);
                alert("Не вдалося завантажити фото");
            }
        }
    };

    if (!isLoggedIn()) return null;

    return (
        <div className="max-w-xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-4">Редагувати оголошення</h1>

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

            <textarea
                placeholder="Встав кілька URL фото (imgbb), по одному в рядок)"
                className="w-full border p-2 mb-3 rounded"
                value={images.join("\n")}
                onChange={handleImageUrlsPaste}
            />

            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="mb-3"
            />

            {loading && <p>Збереження…</p>}

            <div className="flex flex-wrap gap-2">
                {images.map((url, i) => (
                    <img
                        key={i}
                        src={url}
                        alt=""
                        className="w-24 h-24 object-cover rounded"
                    />
                ))}
            </div>

            <button
                onClick={handleUpdateAd}
                className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700"
            >
                Оновити оголошення
            </button>
        </div>
    );
}