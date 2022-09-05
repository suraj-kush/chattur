import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { LogOutIcon } from "../Icons"

import { useAuth } from "../auth/Authentication"

import { LogoutConfirmation } from "./"
//logo
import Logo from "../images/logo512.png"

const Header = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [confirmation, setConfirmation] = useState(false)

  function logoutPrompt() {
    setConfirmation(true)
  }
  function goHome() {
    navigate("/")
    window.location.reload()
  }
  function yesLogout() {
    setConfirmation(false)
    logout()
    goHome()
  }
  function cancel() {
    setConfirmation(false)
  }

  return (
    <div className="h-16 px-5 bg-darkBlue1 text-slate-300 w-full flex items-center">
      <div className="flex-grow font-semibold">
        <div className="flex hover:cursor-pointer hover:text-yellow" onClick={goHome}>
          <img className="h-9 pr-3 aspect-sqaure" src={Logo} alt="logo" />
          <button onClick={goHome}>Chattur</button>
        </div>
      </div>
      <div>
        {user ? (
          <div className="relative group h-9 w-9 rounded-full overflow-hidden aspect-square">
            <img
              className="h-full w-full rounded-full aspect-square object-cover"
              src={user?.photoURL}
              alt={user?.displayname}
            />
            <button
              className="absolute flex opacity-0 transition-all pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100  items-center justify-center top-0 left-0 h-full w-full bg-black/70"
              onClick={logoutPrompt}
              title="Logout"
            >
              <LogOutIcon />
            </button>
            {confirmation && (
              <LogoutConfirmation yesLogout={yesLogout} cancel={cancel} />
            )}
          </div>
        ) : (
          <>
            <Link to="/signup">
              <button className="bg-transparent border-inherit py-1 px-5 text-white  font-semibold text-xs cursor-pointer rounded border-2 border-transparent hover:border-yellow hover:bg-transparent hover:text-yellow duration-200">
                Sign up
              </button>
            </Link>
            <Link to="/signin" className="px-4">
              <button className="bg-yellow py-1 px-5 text-black font-semibold text-xs cursor-pointer rounded border-2 border-transparent hover:border-yellow hover:bg-transparent hover:text-yellow duration-200">
                Sign in
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default Header
