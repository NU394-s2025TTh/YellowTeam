import { getDatabase, onValue, ref } from 'firebase/database';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { WardrobeItem } from 'src/types/WardrobeItem';

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

  useEffect(() => {
    const unsubscribe = onValue(
      ref(getDatabase(), `/users/testingUser123/wardrobe`),
      (snapshot) => {
        const databaseItems: WardrobeItem[] = snapshot.val();
        setItems(databaseItems);
      },
    );

    return () => unsubscribe();
  }, [setItems]);

  return (
    <WardrobeContext.Provider value={{ items, setItems }}>
      {props.children}
    </WardrobeContext.Provider>
  );
};

export { useWardrobeContext, WardrobeContextProvider };
