import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("token"));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/");
    };

    return (
        <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
            <Link to="/" className="text-xl font-bold hover:text-indigo-300">
                AirMarket
            </Link>

            <div className="space-x-6 flex items-center">
                <Link
                    to="/"
                    className="hover:text-indigo-300 transition"
                    aria-label="Головна"
                >
                    Головна
                </Link>

                {isLoggedIn ? (
                    <>
                        <Link
                            to="/create"
                            className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded transition"
                        >
                            Додати оголошення
                        </Link>
                        <Link
                            to="/favorites"
                            className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded transition"
                        >
                            Вибране
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-400 px-4 py-2 rounded transition"
                        >
                            Вийти
                        </button>
                        <Link
                            to="/profile"
                            className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded transition"
                        >
                            Профіль
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="hover:text-indigo-300 transition"
                        >
                            Увійти
                        </Link>
                        <Link
                            to="/register"
                            className="hover:text-indigo-300 transition"
                        >
                            Реєстрація
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}