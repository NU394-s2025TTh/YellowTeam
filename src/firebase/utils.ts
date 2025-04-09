import 'firebase/database';

import { initializeApp } from 'firebase/app';
import { DatabaseReference, getDatabase, push, ref, set, update } from 'firebase/database';

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
const getData = async (path: string) => {
  return await get(ref(getDatabase(), path));
};

const updateData = async (path: string, data: object) => {
  await update(ref(getDatabase(), path), data);
};

const pushData = async (path: string, data?: unknown) => {
  await push(ref(getDatabase(), path), data);
};

export { pushData, setData, updateData, getData };


  function get(arg0: DatabaseReference) {
    throw new Error('Function not implemented.');
  }
//testing
