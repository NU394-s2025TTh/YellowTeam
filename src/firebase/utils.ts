import 'firebase/database';

/* eslint-disable @typescript-eslint/no-unused-vars */
import { initializeApp } from 'firebase/app';
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

export { getData, pushData, setData, updateData };

// API Config
const API_KEY = '27b5e10d34msh17b13f004c5bc97p1bdf52jsn8da550d4df82';
const API_HOST = 'ski-resort-forecast.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}`;

const headers = {
  'X-RapidAPI-Key': API_KEY,
  'X-RapidAPI-Host': API_HOST,
};

export async function getSnowConditions(resortName: string) {
  const encoded = encodeURIComponent(resortName.toLowerCase());
  const url = `https://ski-resort-forecast.p.rapidapi.com/${encoded}/snowConditions?units=i`;

  try {
    const res = await fetch(url, { headers });

    if (!res.ok) throw new Error(`API failed: ${res.status}`);
    const json = await res.json();
    console.log('[SnowCondition]', json);
    return json;
  } catch (err) {
    console.error('[Snow API Error]', err);
    return null;
  }
}

export async function getHourlyForecast(resortName: string) {
  const encoded = encodeURIComponent(resortName.toLowerCase());
  const url = `https://${API_HOST}/${encoded}/hourly?units=i&el=top&c=false`;

  try {
    const res = await fetch(url, { headers });

    if (!res.ok) throw new Error(`Hourly forecast API failed: ${res.status}`);
    const json = await res.json();
    console.log('[Hourly Forecast]', json);
    return json.forecast || [];
  } catch (err) {
    console.error('[Hourly Forecast Error]', err);
    return [];
  }
}

export async function getFiveDayForecast(resortName: string) {
  const encoded = encodeURIComponent(resortName.toLowerCase());
  const url = `https://ski-resort-forecast.p.rapidapi.com/${encoded}/forecast?units=i&el=top`;

  try {
    const res = await fetch(url, { headers });

    if (!res.ok) throw new Error(`5-Day forecast API failed: ${res.status}`);
    const json = await res.json();
    console.log('[5-Day Forecast]', json);
    return json.forecast5Day || [];
  } catch (err) {
    console.error('[5-Day Forecast Error]', err);
    return [];
  }
}
