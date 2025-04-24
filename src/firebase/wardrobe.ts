import { useWardrobeContext } from 'src/providers/WardrobeProvider';
import { WardrobeItem } from 'src/types/WardrobeItem';

const retrieveWardrobeItems = (wardrobe: WardrobeItem[]) => {
  const { setItems } = useWardrobeContext();

  setItems(wardrobe as WardrobeItem[]);
};

export { retrieveWardrobeItems };
