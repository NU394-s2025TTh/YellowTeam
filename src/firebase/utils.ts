import 'firebase/database';

import { getDatabase, ref, set } from 'firebase/database';

const setData = async (path: string, data: unknown) => {
  await set(ref(getDatabase(), path), data);
};

export { setData };
