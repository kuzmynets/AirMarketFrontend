import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { getUserData } from "../services/authService";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
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

    useEffect(() => {
        const init = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            const data = await getUserData(currentUser.uid);
            setUser(data);
            setFirstName(data.first_name);
            setLastName(data.last_name);
            setMiddleName(data.middle_name || "");
            setAvatar(data.avatar);

            // завантажуємо свої оголошення
            const token = await currentUser.getIdToken();
            const res = await axios.get("http://localhost:8000/ads/my_ads", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAds(res.data);
        };
        init();
    }, []);

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
            alert("Профіль оновлено!");
        } catch (err) {
            console.error(err);
            alert("Помилка при оновленні профілю");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!auth.currentUser) return;
        try {
            const user = auth.currentUser;
            if (!user.email) throw new Error("У користувача немає email");

            // спочатку підтвердження старого пароля
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // тепер змінюємо пароль
            await updatePassword(user, newPassword);
            alert("Пароль змінено!");
            setCurrentPassword("");
            setNewPassword("");
        } catch (err) {
            console.error(err);
            alert("Помилка при зміні пароля");
        }
    };

    const uploadToImgBB = async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(
            `https://api.imgbb.com/1/upload?key=${process.env.REACT_APP_IMGBB_API_KEY}`,
            {
                method: "POST",
                body: formData,
            }
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
            alert("Не вдалося завантажити аватар");
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Мій профіль</h2>

            {user && (
                <>
                    {/* Аватар */}
                    <div className="flex items-center gap-4 mb-4">
                        <img src={avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} />
                    </div>

                    {/* Основні поля */}
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ім’я" className="border p-2 rounded w-full mb-2" />
                    <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Прізвище" className="border p-2 rounded w-full mb-2" />
                    <input value={middleName} onChange={e => setMiddleName(e.target.value)} placeholder="По батькові" className="border p-2 rounded w-full mb-2" />

                    <button onClick={handleUpdateProfile} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
                        {loading ? "Збереження..." : "Зберегти профіль"}
                    </button>

                    {/* Зміна пароля */}
                    <h3 className="text-xl font-bold mt-6">Змінити пароль</h3>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Старий пароль" className="border p-2 rounded w-full mb-2" />
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Новий пароль" className="border p-2 rounded w-full mb-2" />
                    <button onClick={handleChangePassword} className="bg-green-600 text-white px-4 py-2 rounded">Змінити пароль</button>

                    {/* Мої оголошення */}
                    <h3 className="text-xl font-bold mt-6 mb-2">Мої оголошення</h3>
                    {ads.length === 0 ? (
                        <p>Немає створених оголошень</p>
                    ) : (
                        <div className="grid gap-4">
                            {ads.map(ad => (
                                <div key={ad.id} className="border p-4 rounded shadow">
                                    <h4 className="font-bold">{ad.title}</h4>
                                    <p>{ad.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
