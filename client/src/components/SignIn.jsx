import React, {useState, useEffect} from 'react'

import { GoogleIcon } from '../Icons';

import { auth } from "../firebase/config"

import {signInWithEmailAndPassword} from "firebase/auth"

import { useAuth } from '../middleware/Authentication';
import {useNavigate} from "react-router-dom";

const SignIn = ({goTo}) => {
    const navigate = useNavigate();
    const {login, user, loginGoogle} = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // function wrongPassword(){

    // }
    // useEffect(()=>{
    //     if(user==null)  alert("wrong password!");
    //     else{
    //        navigate(goTo);
    //     }
    // },[user]);  

    

  return (
    <div className="relative flex flex-col justify-center min-h-screen overflow-hidden bg-darkBlue1">
            <div className="w-96 p-6 m-auto bg-white rounded-md shadow-xl lg:max-w-xl">
                <h1 className="text-3xl font-semibold text-center text-purple-700 uppercase">
                    Sign in
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
                            type="email"
                            value={email}
                            onChange={e=>setEmail(e.target.value)}
                            className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                        />
                    </div>
                    <div className="mb-2">
                        <label
                            for="password"
                            className="block text-sm font-semibold text-gray-800"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e=>setPassword(e.target.value)}
                            className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                        />
                    </div>
                   
                    <div className="mt-6">
                        <button 
                        onClick={(e)=>{
                           
                           signInWithEmailAndPassword(auth, email, password)
                           .then((userCredential) => {
                            const user = userCredential.user
                            console.log("logged in")
                            navigate(goTo);
                            })
                            .catch((error) => {
                            const errorCode = error.code
                            const errorMessage = error.message
                            console.log(errorMessage)
                            alert("wrong password");
                            })
                            
                            e.preventDefault();
                        }}
                        className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
                            Sign In
                        </button>
                    </div>
                </form>
                <div className="relative flex items-center justify-center w-full mt-6 border border-t">
                    <div className="absolute px-5 bg-white">Or</div>
                </div>
                <div className="flex mt-4 gap-x-2">
                    <button
                        type="button"
                        className="flex focus:outline-none bg-blue items-center justify-center w-full p-2 rounded-md focus:ring-2 focus:ring-offset-1 focus:ring-violet-600"
                        onClick={()=>{
                            loginGoogle();
                            setTimeout(()=>{
                                navigate(goTo);
                            }, 7500);
                            
                        }}
                    >
                       <div className='bg-white'> <GoogleIcon /> </div>
                        <div className='px-12 mx-5 font-semibold'>Sign in with Google</div> 
                    </button>
                </div>

                <p className="mt-8 text-xs font-light text-center text-gray-700">
                    {" "}
                    Don't have an account?{" "}
                    <a
                        href="/signup"
                        className="font-medium text-purple-600 hover:underline"
                    >
                        Sign up
                    </a>
                </p>
            </div>
        </div>
  );
}

export default SignIn