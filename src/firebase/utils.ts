import 'firebase/database';

import { getDatabase, push, ref, set, update } from 'firebase/database';

const setData = async (path: string, data: unknown) => {
  await set(ref(getDatabase(), path), data);
};

const updateData = async (path: string, data: object) => {
  await update(ref(getDatabase(), path), data);
};

const pushData = async (path: string, data?: unknown) => {
  await push(ref(getDatabase(), path), data);
};

export { pushData, setData, updateData };
