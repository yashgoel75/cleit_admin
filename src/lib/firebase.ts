"use client"

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyAGeH0HPqWe6b3tzMvxBmvKcSJSbpzC6Yw',
    authDomain: 'cleit-admin.firebaseapp.com',
    projectId: 'cleit-admin',
    storageBucket: 'cleit-admin.appspot.com', 
    messagingSenderId: '439434086704',
    appId: '1:439434086704:web:3da03bbd17d8116052a0f5',
    measurementId: 'G-PRDJ3SN3ZK'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app); 

export { auth, storage }; 
