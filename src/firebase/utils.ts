import 'firebase/database';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { get, getDatabase, push, ref, set, update } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyB33D08gA80Fp7ZoW6d-BvS3wpasaGC1HM',
  authDomain: 'powderprep-dev.firebaseapp.com',
  databaseURL: 'https://powderprep-dev-default-rtdb.firebaseio.com',
  projectId: 'powderprep-dev',
  storageBucket: 'powderprep-dev.firebasestorage.app',
  messagingSenderId: '266068817759',
  appId: '1:266068817759:web:8225bd63e9e121dff568ea',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
const saveViewedLocation = async (userId: string, location: string) => {
  const path = `viewedLocations/${userId}`;
  const snapshot = await getData(path);
  if (snapshot.exists()) {
    const locationsObj = snapshot.val();
    const locations = Object.values(locationsObj) as string[];

    const alreadyViewed = locations.some(
      (loc) => loc.trim().toLowerCase() === location.trim().toLowerCase(),
    );

    if (alreadyViewed) {
      console.log('Location already viewed, skipping save.');
      return;
    }
  }

  await pushData(path, location);
};
const fetchViewedLocations = async (userId: string): Promise<string[]> => {
  const path = `viewedLocations/${userId}`;
  const snapshot = await getData(path);
  if (snapshot.exists()) {
    const locationsObj = snapshot.val();
    const locations = Object.values(locationsObj) as string[];
    return locations;
  }
  return [];
};

export {
  app,
  auth,
  fetchViewedLocations,
  getData,
  pushData,
  saveViewedLocation,
  setData,
  updateData,
};
