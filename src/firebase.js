import { initializeApp } from 'firebase/app'

import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth'


const firebaseConfig = {
  apiKey: "AIzaSyCRIM5cVJYWfvOC91RCEHeIttj34Jvp1Zc",
  authDomain: "vku-interview-survey.firebaseapp.com",
  projectId: "vku-interview-survey",
  storageBucket: "vku-interview-survey.firebasestorage.app",
  messagingSenderId: "999440472286",
  appId: "1:999440472286:web:c48e77cd19a91548568a4f"
};


const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)