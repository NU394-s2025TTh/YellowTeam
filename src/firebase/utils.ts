import 'firebase/database';

import { initializeApp } from 'firebase/app';
import { getDatabase, push, ref, set, update } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyB33D08gA80Fp7ZoW6d-BvS3wpasaGC1HM',
  authDomain: 'powderprep-dev.firebaseapp.com',
  databaseURL: 'https://powderprep-dev-default-rtdb.firebaseio.com',
  projectId: 'powderprep-dev',
  storageBucket: 'powderprep-dev.firebasestorage.app',
  messagingSenderId: '266068817759',
  appId: '1:266068817759:web:8225bd63e9e121dff568ea',
};

initializeApp(firebaseConfig);

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
