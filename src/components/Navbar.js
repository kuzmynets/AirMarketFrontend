import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { onAuth } from "../services/authService";
import { Home, PlusSquare, Heart, User, MessageSquare } from "lucide-react"; // додали MessageSquare

export default function Navbar({ children }) {
    const [user, setUser] = useState(null);
    const location = useLocation();

    const topBarHeight = 64;
    const bottomBarHeight = 56;

    useEffect(() => {
        const unsub = onAuth(setUser);
        return () => unsub();
    }, []);

    return (
        <>
            {/* Верхня навігація для десктопів */}
            <nav className="hidden md:flex px-4 py-3 border-b bg-white items-center justify-between">
                <Link to="/" className="font-bold text-xl">AirMarket</Link>
                <div className="flex items-center gap-4">
                    <Link to="/">Головна</Link>
                    {user && <Link to="/create">Додати оголошення</Link>}
                    {user && <Link to="/favorites">Вибране</Link>}
                    {user && <Link to="/chats">Чати</Link>} {/* Нова вкладка */}
                    {user && <Link to="/profile">Профіль</Link>}
                    {!user ? (
                        <>
                            <Link to="/login">Увійти</Link>
                            <Link to="/register" className="px-3 py-1 rounded bg-indigo-600 text-white">
                                Реєстрація
                            </Link>
                        </>
                    ) : null}
                </div>
            </nav>

            {/* Верхня шапка для мобілки */}
            <div
                className="md:hidden fixed top-0 left-0 w-full bg-white border-b shadow-sm flex justify-center items-center z-40"
                style={{ height: `${topBarHeight}px` }}
            >
                <Link to="/" className="font-bold text-lg">AirMarket</Link>
            </div>

            {/* Контент з відступами під мобілку */}
            <div
                className="md:hidden w-full"
                style={{
                    paddingTop: `20px`,
                    paddingBottom: `${user ? bottomBarHeight : 0}px`,
                }}
            >
                {children}
            </div>

            {/* Нижня панель для мобільних */}
            {user && (
                <nav
                    className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t flex justify-around items-center shadow-lg z-50"
                    style={{ height: `${bottomBarHeight}px` }}
                >
                    <Link to="/" className={`flex flex-col items-center ${location.pathname === "/" ? "text-indigo-600" : "text-gray-600"}`}>
                        <Home size={22} />
                        <span className="text-xs">Головна</span>
                    </Link>
                    <Link to="/create" className={`flex flex-col items-center ${location.pathname === "/create" ? "text-indigo-600" : "text-gray-600"}`}>
                        <PlusSquare size={22} />
                        <span className="text-xs">Додати</span>
                    </Link>
                    <Link to="/favorites" className={`flex flex-col items-center ${location.pathname === "/favorites" ? "text-indigo-600" : "text-gray-600"}`}>
                        <Heart size={22} />
                        <span className="text-xs">Вибране</span>
                    </Link>
                    <Link to="/chats" className={`flex flex-col items-center ${location.pathname === "/chats" ? "text-indigo-600" : "text-gray-600"}`}>
                        <MessageSquare size={22} />
                        <span className="text-xs">Чати</span>
                    </Link>
                    <Link to="/profile" className={`flex flex-col items-center ${location.pathname === "/profile" ? "text-indigo-600" : "text-gray-600"}`}>
                        <User size={22} />
                        <span className="text-xs">Профіль</span>
                    </Link>
                </nav>
            )}
        </>
    );
}