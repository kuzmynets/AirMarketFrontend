import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken(); // <-- Firebase ID Token
            localStorage.setItem("token", token);
            window.location.href = "/";
        } catch (error) {
            console.error(error);
            alert("Помилка входу: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-10 space-y-6">
                <h2 className="text-3xl font-bold text-center text-gray-800">Вхід</h2>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-3 rounded" />
                <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-3 rounded" />
                <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
                    {loading ? "Завантаження..." : "Увійти"}
                </button>
                <p className="text-sm text-center text-gray-600">
                    Ще не маєш акаунту? <a href="/signup" className="text-blue-600 font-medium">Зареєструватися</a>
                </p>
            </div>
        </div>
    );
}