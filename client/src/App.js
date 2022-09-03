import React from "react"

import { Routes, Route } from "react-router-dom"

// components
import { Header } from "./components"

// pages
// import Home from "../page/Home";
import Room from "./pages/Room"
import NotFound from "./pages/NotFound"

const App = () => {
  return (
    <div className="max-h-screen h-screen overflow-auto w-full">
      <Header />
      {/* <div className="h-screen bg-red">sd</div> */}
      <Routes>
        <Route path="/" element={<Room />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
