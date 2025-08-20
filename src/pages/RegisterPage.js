import { useState } from "react";
import { registerWithEmail, loginWithGoogle } from "../services/authService";

export default function Registration() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (password !== confirm) {
            alert("Паролі не співпадають");
            return;
        }

        try {
            setLoading(true);
            await registerWithEmail({ email, password, firstName, lastName, middleName });
            alert("Успішна реєстрація!");
            window.location.href = "/";
        } catch (err) {
            alert("Помилка при реєстрації");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            window.location.href = "/";
        } catch (err) {
            alert("Помилка входу через Google");
            console.error(err);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Реєстрація</h2>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ім’я" className="w-full mb-2 p-2 border rounded" />
            <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Прізвище" className="w-full mb-2 p-2 border rounded" />
            <input value={middleName} onChange={e => setMiddleName(e.target.value)} placeholder="По батькові" className="w-full mb-2 p-2 border rounded" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full mb-2 p-2 border rounded" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" className="w-full mb-2 p-2 border rounded" />
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Підтвердження пароля" className="w-full mb-4 p-2 border rounded" />

            <button onClick={handleRegister} disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded mb-2">
                {loading ? "Реєстрація..." : "Зареєструватися"}
            </button>

            <button onClick={handleGoogleLogin} className="w-full bg-red-500 text-white p-2 rounded">
                Увійти через Google
            </button>
        </div>
    );
}