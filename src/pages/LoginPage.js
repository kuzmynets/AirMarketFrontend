import { useState } from "react";
import { loginWithEmail, loginWithGoogle } from "../services/authService";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);
            await loginWithEmail({ email, password });
            alert("Успішний вхід!");
            window.location.href = "/";
        } catch (err) {
            alert("Неправильний email або пароль");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            alert("Успішний вхід через Google!");
            window.location.href = "/";
        } catch (err) {
            alert("Помилка при вході через Google");
            console.error(err);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Вхід</h2>
            <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full mb-2 p-2 border rounded"
            />
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Пароль"
                className="w-full mb-4 p-2 border rounded"
            />

            <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-blue-600 text-white p-2 rounded mb-2"
            >
                {loading ? "Вхід..." : "Увійти"}
            </button>

            <button
                onClick={handleGoogleLogin}
                className="w-full bg-red-500 text-white p-2 rounded"
            >
                Увійти через Google
            </button>
        </div>
    );
}