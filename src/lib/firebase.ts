import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyAGeH0HPqWe6b3tzMvxBmvKcSJSbpzC6Yw',
    authDomain: 'cleit-admin.firebaseapp.com',
    projectId: 'cleit-admin',
    storageBucket: 'cleit-admin.firebasestorage.app',
    messagingSenderId: '439434086704',
    appId: '1:439434086704:web:3da03bbd17d8116052a0f5',
    measurementId: 'G-PRDJ3SN3ZK'
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
export { auth };
