import { auth, db } from "../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export { auth };

// Реєстрація
export const registerWithEmail = async ({ email, password, firstName, lastName, middleName }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
    });

    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName || "",
        created_at: new Date(),
    });

    return user;
};

// Логін з email
export const loginWithEmail = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

// Логін через Google
export const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Якщо новий користувач — додамо в Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            first_name: user.displayName?.split(" ")[0] || "",
            last_name: user.displayName?.split(" ")[1] || "",
            created_at: new Date(),
        });
    }

    return user;
};

// Логаут
export const logout = async () => {
    await signOut(auth);
};

// Поточний користувач
export const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        }, reject);
    });
};

// Слухач авторизації
export const onAuth = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// Чи залогінений
export const isLoggedIn = () => {
    return auth.currentUser != null;
};

// Дані користувача
export const getUserData = async (uid) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
};