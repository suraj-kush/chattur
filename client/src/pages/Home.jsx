import React, { useEffect, useState } from "react"
import HomeCard from "../components/HomeCard"
import { JoinMeetingPopCard } from "../components"
import { v4 as uuid } from "uuid"
// icons
import { NewCallIcon, JoinCallIcon } from "../Icons"

import { Link } from "react-router-dom"

const Home = () => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
  const [date, setDate] = useState(new Date())
  const [modal, setModal] = useState(false)
  const [roomID, setRoomID] = useState(uuid())
  function refreshClock() {
    setDate(new Date())
  }
  function roomIDGenerate() {
    setRoomID(uuid())
  }

  useEffect(() => {
    const timerId = setInterval(refreshClock, 1000)
    return function cleanup() {
      clearInterval(timerId)
    }
  }, [])

  function toggleModal() {
    setModal(false)
  }

  function showPrompt() {
    setModal(true)
  }

  return (
    <div className="flex flex-col justify-center bg-darkBlue1 min-h-screen text-slate-400 content-center ">
      <div className="flex flex-row justify-center md:border-l-2 border-lightGray p-3 md:p-4">
        <div className="text-center flex flex-col justify-center md:h-52 w-[28rem] bg-slate-500 rounded md:rounded-2xl p-3">
          <div>
            <p className="md:text-7xl text-4xl text-white">
              {`${
                date.getHours() < 10 ? `0${date.getHours()}&nbsp;` : date.getHours()
              }:${
                date.getMinutes() < 10
                  ? `0${date.getMinutes()}`
                  : date.getMinutes()
              }`}
            </p>
            <p className="text-slate-300 my-1">
              {`${days[date.getDay()]},${date.getDate()} ${
                months[date.getMonth()]
              } ${date.getFullYear()}`}
            </p>
          </div>
        </div>
      </div>
      <div className="md:gap-2 flex-col md:flex-row">
        <div className="p-10">
          <div className="flex flex-row gap-2 md:gap-6 mb-3 md:mb-6 justify-center">
            <Link to={`/room/${roomID}`} className="block">
              <HomeCard
                title="New Meeting"
                desc="Create a new meeting"
                icon={<NewCallIcon />}
                iconBgColor="lightYellows"
                bgColor="bg-yellow"
                route={`/room/`}
                onClick={roomIDGenerate}
              />
            </Link>
            <button onClick={showPrompt}>
              <HomeCard
                title="Join Meeting"
                desc="via invitation link"
                icon={<JoinCallIcon />}
                bgColor="bg-blue"
              />
            </button>
            {modal ? <JoinMeetingPopCard closeModal={toggleModal} /> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
