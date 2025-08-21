import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdListPage from "./pages/AdListPage";
import AdDetailPage from "./pages/AdDetailsPage";
import AddAdPage from "./pages/AddAdPage";
import FavoritesPage from "./pages/FavoritesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import EditAdPage from "./pages/EditAdPage";

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<AdListPage />} />
                <Route path="/ads/:id" element={<AdDetailPage />} />
                <Route path="/create" element={<AddAdPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/ads/:id/edit" element={<EditAdPage />} />
            </Routes>
        </BrowserRouter>
    );
}