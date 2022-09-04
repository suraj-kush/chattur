import React from "react"

import { Routes, Route } from "react-router-dom"

// components
import { Header, SignIn, SignUp } from "./components"

// pages
import Home from "./pages/Home"
import Room from "./pages/Room"
import NotFound from "./pages/NotFound"

import { useAuth } from "./middleware/Authentication"

const App = () => {
  const {user} = useAuth();
  return (
    <div className="flex">
      <div className="max-h-screen overflow-auto w-full">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomID" element={user?<Room />:<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
