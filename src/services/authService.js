import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export const registerUser = async ({ email, password, firstName, lastName, middleName }) => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const displayName = `${firstName} ${lastName || ""}`.trim();
    await updateProfile(userCred.user, { displayName });

    await setDoc(doc(db, "users", userCred.user.uid), {
        first_name: firstName,
        last_name: lastName || "",
        middle_name: middleName || "",
        email,
        avatar: "",
        created_at: new Date().toISOString()
    });

    const token = await userCred.user.getIdToken();
    localStorage.setItem("token", token);
};

export const loginUser = async ({ email, password }) => {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCred.user.getIdToken();
    localStorage.setItem("token", token);
};

export const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
        const [firstName = "", lastName = ""] = (user.displayName || "").split(" ");
        await setDoc(userRef, {
            first_name: firstName,
            last_name: lastName,
            middle_name: "",
            email: user.email,
            avatar: user.photoURL || "",
            created_at: new Date().toISOString()
        });
    }

    const token = await user.getIdToken();
    localStorage.setItem("token", token);
};