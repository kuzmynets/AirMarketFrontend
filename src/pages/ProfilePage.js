import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { getUserData, logout } from "../services/authService";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile, EmailAuthProvider, reauthenticateWithCredential, updatePassword, onAuthStateChanged } from "firebase/auth";
import axios from "axios";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [avatar, setAvatar] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [message, setMessage] = useState(null); // Модальне повідомлення

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                setUser(null);
                setAds([]);
                setFirstName("");
                setLastName("");
                setMiddleName("");
                setAvatar("");
                return;
            }

            const data = await getUserData(currentUser.uid);
            setUser(data);
            setFirstName(data.first_name);
            setLastName(data.last_name);
            setMiddleName(data.middle_name || "");
            setAvatar(data.avatar);

            const token = await currentUser.getIdToken();
            const res = await axios.get("http://localhost:8000/ads/my_ads", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAds(res.data);
        });

        return () => unsubscribe();
    }, []);

    const showMessage = (text, type = "success") => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000); // зникає через 3 секунди
    };

    const handleUpdateProfile = async () => {
        if (!auth.currentUser) return;
        setLoading(true);

        try {
            await updateProfile(auth.currentUser, { displayName: `${firstName} ${lastName}`, photoURL: avatar });
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                first_name: firstName,
                last_name: lastName,
                middle_name: middleName,
                avatar: avatar
            });
            showMessage("Профіль оновлено!", "success");
        } catch (err) {
            console.error(err);
            showMessage("Помилка при оновленні профілю", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!auth.currentUser) return;
        try {
            const user = auth.currentUser;
            if (!user.email) throw new Error("У користувача немає email");

            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            showMessage("Пароль змінено!", "success");
            setCurrentPassword("");
            setNewPassword("");
        } catch (err) {
            console.error(err);
            showMessage("Помилка при зміні пароля", "error");
        }
    };

    const uploadToImgBB = async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(
            `https://api.imgbb.com/1/upload?key=${process.env.REACT_APP_IMGBB_API_KEY}`,
            { method: "POST", body: formData }
        );

        const data = await res.json();
        if (!data.success) throw new Error("Upload failed");
        return data.data.url;
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const url = await uploadToImgBB(file);
            setAvatar(url);
        } catch (err) {
            console.error(err);
            showMessage("Не вдалося завантажити аватар", "error");
        }
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = "/";
    };

    return (
        <div className="max-w-3xl mx-auto p-6 relative pb-20 md:pt-6 md:pb-6">
            {/* Модальне повідомлення */}
            {message && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white z-50 
                                ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
                    {message.text}
                </div>
            )}

            <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Мій профіль</h2>

            {!user ? (
                <p className="text-center">Завантаження...</p>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                        <img src={avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="md:w-auto w-full" />
                    </div>

                    <div className="flex flex-col gap-2 mb-4">
                        <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ім’я" className="border p-2 rounded w-full" />
                        <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Прізвище" className="border p-2 rounded w-full" />
                        <input value={middleName} onChange={e => setMiddleName(e.target.value)} placeholder="По батькові" className="border p-2 rounded w-full" />
                    </div>

                    <button onClick={handleUpdateProfile} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded w-full md:w-auto block mx-auto mb-4 hover:bg-blue-700 transition">
                        {loading ? "Збереження..." : "Зберегти профіль"}
                    </button>

                    <h3 className="text-xl font-bold mt-6 mb-2 text-center md:text-left">Змінити пароль</h3>
                    <div className="flex flex-col gap-2 mb-4">
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Старий пароль" className="border p-2 rounded w-full" />
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Новий пароль" className="border p-2 rounded w-full" />
                    </div>
                    <button onClick={handleChangePassword} className="bg-green-600 text-white px-4 py-2 rounded w-full md:w-auto block mx-auto mb-4 hover:bg-green-700 transition">Змінити пароль</button>

                    <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded w-full md:w-auto block mx-auto mb-6 hover:bg-red-700 transition">Вийти</button>

                    <h3 className="text-xl font-bold mt-6 mb-4 text-center md:text-left">Мої оголошення</h3>
                    {ads.length === 0 ? (
                        <p className="text-center">Немає створених оголошень</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ads.map(ad => (
                                <div key={ad.id} className="border p-4 rounded-lg shadow flex flex-col">
                                    <img
                                        src={ad.images?.[0] || "https://via.placeholder.com/200"}
                                        alt={ad.title}
                                        className="w-full h-40 object-cover rounded mb-2"
                                    />
                                    <h4 className="font-bold text-lg mb-1">{ad.title}</h4>
                                    <p className="text-gray-700 flex-grow">{ad.description}</p>
                                    <p className="mt-1 font-semibold">{ad.price} ₴</p>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <button onClick={() => window.location.href = `/ads/${ad.id}`} className="flex-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-center">
                                            Переглянути
                                        </button>
                                        <button onClick={() => window.location.href = `/ads/${ad.id}/edit`} className="flex-1 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition text-center">
                                            Редагувати
                                        </button>
                                        <button onClick={async () => {
                                            if (!window.confirm("Видалити це оголошення?")) return;
                                            try {
                                                const token = await auth.currentUser.getIdToken();
                                                await axios.delete(`http://localhost:8000/ads/${ad.id}`, { headers: { Authorization: `Bearer ${token}` } });
                                                setAds(prev => prev.filter(item => item.id !== ad.id));
                                                showMessage("Оголошення видалено!", "success");
                                            } catch (err) {
                                                console.error(err);
                                                showMessage("Помилка при видаленні", "error");
                                            }
                                        }} className="flex-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-center">
                                            Видалити
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
