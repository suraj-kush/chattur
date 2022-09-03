import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  databaseURL: "https://chattur-2c770-default-rtdb.firebaseio.com/"
}

const app = initializeApp(firebaseConfig)

const firestore = getFirestore(app)
const auth = getAuth(app)

export { auth, firestore }
