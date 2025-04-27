import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

import { app } from '../firebase/utils'; // make sure this is the correct path

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
      name: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
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
