import { useState } from "react";
import api from "../api/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const res = await api.post("/auth/login", new URLSearchParams({
                username: email,
                password,
            }));
            localStorage.setItem("token", res.data.access_token);
            window.location.href = "/";
        } catch (err) {
            alert("Помилка авторизації");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 space-y-6">
                <h2 className="text-4xl font-extrabold text-center text-gray-800 tracking-tight">
                    Вхід в AirMarket
                </h2>
                <p className="text-center text-gray-500">
                    Ласкаво просимо назад! Будь ласка, увійдіть, щоб продовжити.
                </p>
                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold tracking-wide hover:bg-indigo-700 active:scale-95 transition-transform"
                >
                    {loading ? "Завантаження..." : "Увійти"}
                </button>
                <p className="text-center text-gray-400 text-sm">
                    Немає акаунту?{" "}
                    <a href="/register" className="text-indigo-600 font-semibold hover:underline">
                        Зареєструватися
                    </a>
                </p>
            </div>
        </div>
    );
}