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

const DEFAULT_AVATAR = "https://i.pinimg.com/736x/c0/02/82/c002826ebc873be910f0fb44bc62f219.jpg";

export { auth };

export const registerWithEmail = async ({ email, password, firstName, lastName, middleName }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
        photoURL: DEFAULT_AVATAR, // встановлюємо аватарку
    });

    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName || "",
        avatar: DEFAULT_AVATAR,
        role: "user",
        created_at: new Date(),
    });

    return user;
};

export const loginWithEmail = async ({email, password}) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            first_name: user.displayName?.split(" ")[0] || "",
            last_name: user.displayName?.split(" ")[1] || "",
            avatar: user.photoURL || DEFAULT_AVATAR,
            role: "user",
            created_at: new Date(),
        });
    }

    return user;
};

export const logout = async () => {
    await signOut(auth);
};

export const getCurrentUser = () =>
    new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            unsubscribe();
            resolve(user);
        }, reject);
    });

export const onAuth = callback => onAuthStateChanged(auth, callback);

export const isLoggedIn = () => auth.currentUser != null;

export const getUserData = async uid => {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
};
