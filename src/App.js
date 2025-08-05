import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdListPage from "./pages/AdListPage";
import CreateAdPage from "./pages/CreateAdPage";
import AdDetailsPage from "./pages/AdDetailsPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<AdListPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/create" element={<CreateAdPage />} />
                <Route path="/ads/:id" element={<AdDetailsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </Router>
    );
}
