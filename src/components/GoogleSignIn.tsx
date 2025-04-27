import { GoogleAuthProvider, signInWithPopup } from '@firebase/auth';
import { auth } from 'src/firebase/utils';
import { useUserContext } from 'src/providers/UserProvider';

const GoogleSignIn = () => {
  const provider = new GoogleAuthProvider();
  const { isLoggedIn } = useUserContext();

  const handleSignIn = async () => {
    await signInWithPopup(auth, provider)
      .then(() => {})
      .catch();

    console.log(isLoggedIn);
  };

  const handleSignOut = async () => {
    await auth.signOut();
  };

  return (
    <div>
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};

export { GoogleSignIn };
