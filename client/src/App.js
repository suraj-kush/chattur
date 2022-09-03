import React from "react"

import { Routes, Route } from "react-router-dom"

// components
import { Header } from "./components"

// pages
import Home from "./pages/Home";
import Room from "./pages/Room"
import NotFound from "./pages/NotFound"

const App = () => {
  return (
    <div className="flex">
      <div className="max-h-screen overflow-auto w-full">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/" element={<Room />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
