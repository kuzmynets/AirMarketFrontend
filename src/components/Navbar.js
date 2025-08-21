import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuth, logout } from "../services/authService";

export default function Navbar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsub = onAuth(setUser);
        return () => unsub();
    }, []);

    return (
        <nav className="px-4 py-3 border-b bg-white flex items-center justify-between">
            <Link to="/" className="font-bold text-xl">AirMarket</Link>
            <div className="flex items-center gap-4">
                <Link to="/">Головна</Link>
                {user && <Link to="/create">Додати оголошення</Link>}
                {user && <Link to="/favorites">Вибране</Link>}
                {user && <Link to="/profile">Профіль</Link>}
                {!user ? (
                    <>
                        <Link to="/login">Увійти</Link>
                        <Link to="/register" className="px-3 py-1 rounded bg-indigo-600 text-white">Реєстрація</Link>
                    </>
                ) : (
                    <button onClick={logout} className="px-3 py-1 rounded bg-gray-200">Вийти</button>
                )}
            </div>
        </nav>
    );
}