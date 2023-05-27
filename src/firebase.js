import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, addDoc } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';



// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBtmjjMhxCm5IizGjlOTCN1WoIdHBFe6v8",
    authDomain: "devgames-4bd3c.firebaseapp.com",
    databaseURL: "https://devgames-4bd3c-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "devgames-4bd3c",
    storageBucket: "devgames-4bd3c.appspot.com",
    messagingSenderId: "424020134379",
    appId: "1:424020134379:web:7e34914ad49595c0aff1ae",
    measurementId: "G-H3TLHDG8YV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

