import { onAuthStateChanged, User } from '@firebase/auth';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { createUser } from 'src/firebase/user';
import { auth, getData } from 'src/firebase/utils';

type UserContextValue = {
  user: User | null;
  isLoggedIn: boolean;
};

const UserContext = createContext<UserContextValue>({} as UserContextValue);

const useUserContext = () => {
  const value = useContext(UserContext);
  if (!value) {
    throw new Error('useUserContext must be wrapped in a UserContext');
  }
  return value;
};

const UserContextProvider = (props: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    onAuthStateChanged(auth, (userData) => {
      (async (): Promise<User | null> => {
        if (!userData) {
          setIsLoggedIn(false);
          return null;
        }

        const userSnapshot = await getData(`/users/${userData.uid}`);
        if (!userSnapshot.exists()) {
          await createUser(userData);
        }

        return user;
      })().then((userData) => {
        setIsLoggedIn(true);
        setUser(userData);
      });
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoggedIn }}>
      {props.children}
    </UserContext.Provider>
  );
};

export { UserContextProvider, useUserContext };
