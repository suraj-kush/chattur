import React, { useState } from "react"
import { GoogleIcon } from "../Icons"
import { useAuth } from "../middleware/Authentication"

import { useNavigate } from "react-router-dom"

import { auth } from "../firebase/config"

import { createUserWithEmailAndPassword } from "firebase/auth"

import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const SignUp = () => {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [username, setUsername] = useState("")
  const { signUp, user, loginGoogle } = useAuth()

  const notify = () => toast.warn("Passwords did not match")
  const notify1 = () => toast.error("Invalid email or weak password")

  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden bg-darkBlue1">
      <div className="w-96 p-6 m-auto bg-white rounded-md shadow-xl lg:max-w-xl">
        <h1 className="text-3xl font-semibold text-center text-purple-700 uppercase">
          Sign Up
        </h1>
        <form className="mt-6">
          <div className="mb-2">
            <label
              for="email"
              className="block text-sm font-semibold text-gray-800"
            >
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
            />
          </div>
          {/* <div className="mb-2">
            <label
              for="username"
              className="block text-sm font-semibold text-gray-800"
            >
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
            />
          </div> */}
          <div className="mb-2">
            <label
              for="password"
              className="block text-sm font-semibold text-gray-800"
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
            />
          </div>
          <div className="mb-2">
            <label
              for="password"
              className="block text-sm font-semibold text-gray-800"
            >
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
            />
          </div>

          <div className="mt-6">
            <button
              onClick={(e) => {
                if (password !== confirm) {
                  notify()
                } else {
                  createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                      const user = userCredential.user
                      console.log("signed Up")
                      navigate("/")
                    })
                    .catch((error) => {
                      const errorCode = error.code
                      const errorMessage = error.message
                      console.log(errorMessage)
                      notify1()
                    })
                }
                e.preventDefault()
              }}
              className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600"
            >
              Sign Up
            </button>
            <ToastContainer
              position="bottom-left"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover={false}
            />
          </div>
        </form>
        <div className="relative flex items-center justify-center w-full mt-6 border border-t">
          <div className="absolute px-5 bg-white">Or</div>
        </div>
        <div className="flex mt-4 gap-x-2">
          <button
            type="button"
            onClick={() => {
              loginGoogle()
              setTimeout(() => {
                navigate("/")
              }, 7500)
            }}
            className="flex focus:outline-none bg-blue items-center justify-center w-full p-2 rounded-md focus:ring-2 focus:ring-offset-1 focus:ring-violet-600"
          >
            <div className="bg-white">
              {" "}
              <GoogleIcon />{" "}
            </div>
            <div className="px-12 mx-5 font-semibold">Continue with Google</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignUp
