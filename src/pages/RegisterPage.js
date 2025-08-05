import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            localStorage.setItem("token", token);
            window.location.href = "/";
            alert("Реєстрація успішна!");
        } catch (error) {
            console.error(error);
            alert("Помилка при реєстрації: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-10 space-y-6">
                <h2 className="text-3xl font-bold text-center text-gray-800">Реєстрація</h2>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-3 rounded" />
                <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-3 rounded" />
                <input type="password" placeholder="Підтвердження пароля" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full border p-3 rounded" />
                <button onClick={handleSignup} disabled={loading} className="w-full bg-pink-600 text-white p-3 rounded hover:bg-pink-700">
                    {loading ? "Завантаження..." : "Зареєструватись"}
                </button>
                <p className="text-sm text-center text-gray-600">
                    Вже маєш акаунт? <a href="/login" className="text-pink-600 font-medium">Увійти</a>
                </p>
            </div>
        </div>
    );
}