import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';

import { app, setData } from '../firebase/utils'; // make sure this is the correct path

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);

    const user = result.user;
    if (!user) throw new Error('No user returned');

    return {
      uid: user.uid,
      name: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
    };
  } catch (error) {
    console.error('Google sign-in error', error);
    throw error;
  }
};

/**
 * Sign out
 */
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error', error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

export const createUser = async (user: User) => {
  const userFields = {
    name: user.displayName,
    profilePhoto: user.photoURL,
    uid: user.uid,
  };

  await setData(`/users/${user.uid}`, userFields);
};
