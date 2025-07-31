import { useState } from "react";
import api from "../api/api";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (password !== confirm) {
            alert("Паролі не співпадають");
            return;
        }
        setLoading(true);
        try {
            const res = await api.post("/auth/register", { email, password });
            localStorage.setItem("token", res.data.access_token);
            window.location.href = "/";
            alert("Реєстрація успішна!");
        } catch {
            alert("Помилка при реєстрації");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 space-y-6">
                <h2 className="text-4xl font-extrabold text-center text-gray-800 tracking-tight">
                    Реєстрація в AirMarket
                </h2>
                <p className="text-center text-gray-500">
                    Створи акаунт, щоб почати продавати й купувати
                </p>
                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-pink-400 transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-pink-400 transition"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Підтвердження пароля"
                        className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-pink-400 transition"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleSignup}
                    disabled={loading}
                    className="w-full bg-pink-600 text-white py-3 rounded-xl font-semibold tracking-wide hover:bg-pink-700 active:scale-95 transition-transform"
                >
                    {loading ? "Завантаження..." : "Зареєструватись"}
                </button>
                <p className="text-center text-gray-400 text-sm">
                    Вже маєш акаунт?{" "}
                    <a href="/login" className="text-pink-600 font-semibold hover:underline">
                        Увійти
                    </a>
                </p>
            </div>
        </div>
    );
}
