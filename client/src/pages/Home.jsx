import React, { useEffect, useState } from "react"
import HomeCard from "../components/HomeCard"

import { v4 as uuid } from "uuid"

// icons
import { MdVideoCall as NewCallIcon } from "react-icons/md"
import { MdAddBox as JoinCallIcon } from "react-icons/md"
import { BsCalendarDate as CalenderIcon } from "react-icons/bs"
import { MdScreenShare as ScreenShareIcon } from "react-icons/md"
import { Link } from "react-router-dom"

const roomId = uuid()

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

  function refreshClock() {
    setDate(new Date())
  }
  useEffect(() => {
    const timerId = setInterval(refreshClock, 1000)
    return function cleanup() {
      clearInterval(timerId)
    }
  }, [])

  return (
    <div className="bg-darkBlue1 min-h-screen text-slate-400 content-center ">
      <div className="flex-grow md:border-l-2 border-lightGray p-3 md:p-4">
        <div className="relative md:h-52 w-full bg-slate-500 rounded md:rounded-2xl p-3">
          <div className="md:absolute bottom-2 left-2 md:bottom-6 md:left-6">
            <p className="md:text-7xl text-4xl text-white">
              {`${
                date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
              }:${
                date.getMinutes() < 10
                  ? `0${date.getMinutes()}`
                  : date.getMinutes()
              }`}
            </p>
            <p className="text-slate-300 font-thin my-1">
              {`${days[date.getDay()]},${date.getDate()} ${
                months[date.getMonth()]
              } ${date.getFullYear()}`}
            </p>
          </div>
        </div>
      </div>
      <div className="flex-col md:gap-2 flex-col md:flex-row justify-items-center">
        <div className="p-10">
          <div className="flex gap-2 md:gap-6 mb-3 md:mb-6 justify-items-center">
            <Link to={`/room/${roomId}`} className="block">
              <HomeCard
                title="New Meeting"
                desc="Create a new meeting"
                icon={<NewCallIcon />}
                iconBgColor="lightYellows"
                bgColor="bg-yellow"
                route={`/room/`}
              />
            </Link>
            <HomeCard
              title="Join Meeting"
              desc="via invitation link"
              icon={<JoinCallIcon />}
              bgColor="bg-blue"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
