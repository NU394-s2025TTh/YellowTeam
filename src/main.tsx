import './index.css';

import { initializeApp } from 'firebase/app';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

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

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
