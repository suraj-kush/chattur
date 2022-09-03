import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  // apiKey: process.env.API_KEY,
  // authDomain: process.env.AUTH_DOMAIN,
  // projectId: process.env.PROJECT_ID,
  // storageBucket: process.env.STORAGE_BUCKET,
  // messagingSenderId: process.env.MESSAGING_SENDER_ID,
  // appId: process.env.APP_ID
  apiKey: "AIzaSyDswk1FvB2pCZeAEE7XAZDJ5Rvk7GHz6qM",
  authDomain: "video-call-c40b5.firebaseapp.com",
  projectId: "video-call-c40b5",
  storageBucket: "video-call-c40b5.appspot.com",
  messagingSenderId: "162995448850",
  appId: "1:162995448850:web:4f6e8795dba4726b92bccb",
  measurementId: "G-CZTFCB25G3"
}

const app = initializeApp(firebaseConfig)

const firestore = getFirestore(app)
const auth = getAuth(app)

export { auth, firestore }
