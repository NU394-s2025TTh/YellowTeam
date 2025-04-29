import { getDatabase, onValue, ref } from 'firebase/database';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { WardrobeItem } from 'src/types/WardrobeItem';

import { useUserContext } from './UserProvider';

type WardrobeContextValue = {
  items: WardrobeItem[];
  setItems: React.Dispatch<React.SetStateAction<WardrobeItem[]>>;
};

const WardrobeContext = createContext<WardrobeContextValue>({} as WardrobeContextValue);

const useWardrobeContext = () => {
  const value = useContext(WardrobeContext);
  if (!value) {
    throw new Error(
      'WardrobeContext must be wrapped within a <WardrobeContextProvider/>',
    );
  }
  return value;
};

const WardrobeContextProvider = (props: PropsWithChildren) => {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const { user } = useUserContext();

  useEffect(() => {
    const unsubscribe = onValue(
      ref(getDatabase(), `/wardrobes/${user?.uid}`),
      (snapshot) => {
        const databaseItems: WardrobeItem[] = snapshot.val();
        setItems(databaseItems ?? []);
      },
    );

    return () => unsubscribe();
  }, [setItems, user?.uid]);

  return (
    <WardrobeContext.Provider value={{ items, setItems }}>
      {props.children}
    </WardrobeContext.Provider>
  );
};

export { useWardrobeContext, WardrobeContextProvider };
