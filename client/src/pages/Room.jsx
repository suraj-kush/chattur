/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { io } from "socket.io-client"
import Peer from "simple-peer"

import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { useAuth } from "../auth/Authentication"
import { MeetGridCard, Loading, SignIn } from "../components"

//sounds
import joinSoundSrc from "../sounds/join.mp3"
import msgSoundSrc from "../sounds/message.mp3"
import leaveSoundSrc from "../sounds/leave.mp3"

//icons
import {
  ChatIcon,
  DownIcon,
  UsersIcon,
  SendIcon,
  CallEndIcon,
  ClearIcon,
  ShareIcon,
  VideoOnIcon,
  VideoOffIcon,
  MicOffIcon,
  MicOnIcon,
  PinIcon,
  PinActiveIcon
} from "../Icons"

const Room = () => {
  const [loading, setLoading] = useState(true)
  const [localStream, setLocalStream] = useState(null)
  const [micOn, setMicOn] = useState(true)
  const [showChat, setshowChat] = useState(false)
  const [pin, setPin] = useState(false)
  const [peers, setPeers] = useState([])
  const [msgs, setMsgs] = useState([])
  const [participantsOpen, setparticipantsOpen] = useState(true)
  const [chatBoxOpen, setChatBoxOpen] = useState(true)
  const [videoActive, setVideoActive] = useState(true)
  const [msgText, setMsgText] = useState("")
  const { roomID } = useParams()
  const navigate = useNavigate()
  const chatScroll = useRef()
  const socket = useRef()
  const peersRef = useRef([])
  const localVideo = useRef()
  // user
  const { user } = useAuth()

  //functions
  const notify = () => toast.success("Link has been copied!")

  const sendMessage = (e) => {
    e.preventDefault()
    if (msgText) {
      socket.current.emit("send message", {
        roomID,
        from: socket.current.id,
        user: {
          id: user.uid,
          name: user?.displayName,
          profilePic: user.photoURL
        },
        message: msgText.trim()
      })
    }
    setMsgText("")
  }
  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    })

    peer.on("signal", (signal) => {
      socket.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
        user: user
          ? {
              uid: user?.uid,
              email: user?.email,
              name: user?.displayName,
              photoURL: user?.photoURL
            }
          : null
      })
    })

    return peer
  }

  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    })
    peer.on("signal", (signal) => {
      socket.current.emit("returning signal", { signal, callerID })
    })
    const joinSound = new Audio(joinSoundSrc)
    joinSound.play()
    peer.signal(incomingSignal)
    return peer
  }

  useEffect(() => {
    const unsub = () => {
      socket.current = io.connect(
        process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"
      )
      socket.current.on("message", (data) => {
        const audio = new Audio(msgSoundSrc)
        if (user?.uid !== data.user.id) {
          console.log("send")
          audio.play()
        }
        const msg = {
          send: user?.uid === data.user.id,
          ...data
        }
        setMsgs((msgs) => [...msgs, msg])
        // setMsgs(data);
        // console.log(data);
      })
      if (user) {
        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: true
          })
          .then((stream) => {
            setLoading(false)
            setLocalStream(stream)
            localVideo.current.srcObject = stream
            socket.current.emit("join room", {
              roomID,
              user: user
                ? {
                    uid: user?.uid,
                    email: user?.email,
                    name: user?.displayName,
                    photoURL: user?.photoURL
                  }
                : null
            })
            socket.current.on("all users", (users) => {
              const peers = []
              users.forEach((user) => {
                const peer = createPeer(user.userId, socket.current.id, stream)
                peersRef.current.push({
                  peerID: user.userId,
                  peer,
                  user: user.user
                })
                peers.push({
                  peerID: user.userId,
                  peer,
                  user: user.user
                })
              })
              setPeers(peers)
            })

            socket.current.on("user joined", (payload) => {
              // console.log(payload);
              const peer = addPeer(payload.signal, payload.callerID, stream)
              peersRef.current.push({
                peerID: payload.callerID,
                peer,
                user: payload.user
              })

              const peerObj = {
                peerID: payload.callerID,
                peer,
                user: payload.user
              }

              setPeers((users) => [...users, peerObj])
            })

            socket.current.on("receiving returned signal", (payload) => {
              const item = peersRef.current.find((p) => p.peerID === payload.id)
              item.peer.signal(payload.signal)
            })

            socket.current.on("user left", (id) => {
              const audio = new Audio(leaveSoundSrc)
              audio.play()
              const peerObj = peersRef.current.find((p) => p.peerID === id)
              if (peerObj) peerObj.peer.destroy()
              const peers = peersRef.current.filter((p) => p.peerID !== id)
              peersRef.current = peers
              setPeers((users) => users.filter((p) => p.peerID !== id))
            })
          })
      }
    }
    return unsub()
  }, [user, roomID])

  return (
    <>
      {user ? (
        <AnimatePresence>
          {loading ? (
            <div className="bg-lightGray">
              <Loading />
            </div>
          ) : (
            user && (
              <motion.div
                layout
                className="flex flex-col bg-darkBlue2 text-white w-full"
              >
                <motion.div
                  layout
                  className="flex flex-row bg-darkBlue2 text-white w-full"
                >
                  <motion.div
                    layout
                    className="flex flex-col bg-darkBlue2 justify-between w-full"
                  >
                    <div
                      className="flex-shrink-0 overflow-y-scroll p-1"
                      style={{
                        height: "calc(100vh - 128px)"
                      }}
                    >
                      <motion.div
                        layout
                        className={`grid grid-cols-1 gap-4  ${
                          showChat
                            ? "md:grid-cols-2"
                            : "lg:grid-cols-3 sm:grid-cols-2"
                        } `}
                      >
                        <motion.div
                          layout
                          className={`relative bg-lightGray rounded-lg aspect-video overflow-hidden ${
                            pin &&
                            "md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-1"
                          }`}
                        >
                          <div className="absolute top-4 right-4 z-20">
                            <button
                              className={`${
                                pin
                                  ? "bg-blue border-transparent"
                                  : "bg-slate-800/70 backdrop-blur border-gray"
                              } md:border-2 border-[1px] aspect-square md:p-2.5 p-1.5 cursor-pointer md:rounded-xl rounded-lg text-white md:text-xl text-lg`}
                              onClick={() => setPin(!pin)}
                            >
                              {pin ? <PinActiveIcon /> : <PinIcon />}
                            </button>
                          </div>

                          <video
                            ref={localVideo}
                            muted
                            autoPlay
                            controls={false}
                            className="h-full w-full object-cover rounded-lg scale-x-[-1]"
                          />
                          {!videoActive && (
                            <div className="absolute top-0 left-0 bg-lightGray h-full w-full flex items-center justify-center">
                              <img
                                className="h-[35%] max-h-[150px] w-auto rounded-full aspect-square object-cover"
                                src={user?.photoURL}
                                alt={user?.displayName}
                              />
                            </div>
                          )}
                          <div
                            className={`${
                              !micOn &&
                              "bg-slate-800/70 backdrop-blur border-gray border-2  p-2 cursor-pointer rounded-xl text-white text-sm absolute bottom-4 right-4"
                            }`}
                          >
                            {!micOn && <MicOffIcon size={15} />}
                          </div>
                          <div className="absolute bottom-4 right-4"></div>
                          <div className="absolute bottom-4 left-4">
                            <div className="bg-slate-800/70 backdrop-blur   py-1 px-3 cursor-pointer rounded-md text-white text-xs">
                              You
                            </div>
                          </div>
                        </motion.div>
                        {peers.map((peer) => (
                          // console.log(peer),
                          <MeetGridCard
                            key={peer?.peerID}
                            user={peer.user}
                            peer={peer?.peer}
                          />
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                  {showChat && (
                    <motion.div
                      layout
                      className="flex flex-col w-[30%] flex-shrink-0 border-l-2 border-lightGray"
                    >
                      <div
                        className="flex-shrink-0 overflow-y-scroll"
                        style={{
                          height: "calc(100vh - 192px)"
                        }}
                      >
                        <div className="flex flex-col bg-darkBlue1 w-full border-b-2 border-gray">
                          <div
                            className="flex items-center w-full p-3 cursor-pointer"
                            onClick={() =>
                              setparticipantsOpen(!participantsOpen)
                            }
                          >
                            <div className="text-xl text-slate-400">
                              <UsersIcon />
                            </div>
                            <div className="ml-2 text-sm font">
                              Participants
                            </div>
                            <div
                              className={`${
                                participantsOpen && "rotate-180"
                              } transition-all  ml-auto text-lg`}
                            >
                              <DownIcon />
                            </div>
                          </div>
                          <motion.div
                            layout
                            className={`${
                              participantsOpen ? "block" : "hidden"
                            } flex flex-col w-full mt-2 h-full max-h-[50vh] overflow-y-scroll gap-3 p-2 bg-blue-600`}
                          >
                            <AnimatePresence>
                              <motion.div
                                layout
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.08 }}
                                exit={{ opacity: 0 }}
                                whileHover={{ scale: 1.05 }}
                                className="p-2 flex bg-gray items-center transition-all hover:bg-slate-900 gap-2 rounded-lg"
                              >
                                <img
                                  src={
                                    user.photoURL ||
                                    "https://parkridgevet.com.au/wp-content/uploads/2020/11/Profile-300x300.png"
                                  }
                                  alt={user.displayName || "Anonymous"}
                                  className="block w-8 h-8 aspect-square rounded-full mr-2"
                                />
                                <span className="font-medium text-sm">
                                  {user.displayName || "Anonymous"}
                                </span>
                              </motion.div>
                              {peers.map((user) => (
                                <motion.div
                                  layout
                                  initial={{ x: 100, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ duration: 0.08 }}
                                  exit={{ opacity: 0 }}
                                  key={user.peerID}
                                  whileHover={{ scale: 1.05 }}
                                  className="p-2 flex bg-gray items-center transition-all hover:bg-slate-900 gap-2 rounded-lg"
                                >
                                  <img
                                    src={
                                      user.user.photoURL ||
                                      "https://parkridgevet.com.au/wp-content/uploads/2020/11/Profile-300x300.png"
                                    }
                                    alt={user.user.name || "Anonymous"}
                                    className="block w-8 h-8 aspect-square rounded-full mr-2"
                                  />
                                  <span className="font-medium text-sm">
                                    {user.user.name || "Anonymous"}
                                  </span>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                        <div className="h-full">
                          <div className="flex items-center bg-darkBlue1 p-3 w-full">
                            <div className="text-xl text-slate-400">
                              <ChatIcon />
                            </div>
                            <div className="ml-2 text-sm font">Chat</div>
                            <div
                              className={`${
                                chatBoxOpen && "rotate-180"
                              } transition-all  ml-auto text-lg`}
                              onClick={() => setChatBoxOpen(!chatBoxOpen)}
                            >
                              <DownIcon />
                            </div>
                          </div>
                          <motion.div
                            layout
                            ref={chatScroll}
                            className={`${
                              chatBoxOpen ? "block" : "hidden"
                            } p-3 h-full overflow-y-scroll flex flex-col gap-4`}
                          >
                            {msgs.map((msg, index) => (
                              <motion.div
                                layout
                                initial={{
                                  y: msg.send ? 250 : 250,
                                  opacity: 0
                                }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.08 }}
                                className={`flex gap-2 ${
                                  msg?.user.id === user?.uid
                                    ? "flex-row-reverse"
                                    : ""
                                }`}
                                key={index}
                              >
                                <img
                                  // src="https://avatars.githubusercontent.com/u/83828231"
                                  src={msg?.user.profilePic}
                                  alt={msg?.user.name}
                                  className="h-8 w-8 aspect-square rounded-full object-cover"
                                />
                                <p className="bg-darkBlue1 py-2 px-3 text-xs w-auto max-w-[87%] rounded-lg border-2 border-lightGray">
                                  {msg?.message}
                                </p>
                              </motion.div>
                            ))}
                          </motion.div>
                        </div>
                      </div>
                      <div className="w-full h-16 bg-darkBlue1 border-t-2 border-lightGray p-3">
                        <form onSubmit={sendMessage}>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-grow">
                              <input
                                type="text"
                                value={msgText}
                                onChange={(e) => setMsgText(e.target.value)}
                                className="h-10 p-3 w-full text-sm text-darkBlue1 outline-none  rounded-lg"
                                placeholder="Enter message.. "
                              />
                              {msgText && (
                                <button
                                  type="button"
                                  onClick={() => setMsgText("")}
                                  className="bg-transparent text-darkBlue2 absolute top-0 right-0 text-lg cursor-pointer p-2  h-full"
                                >
                                  <ClearIcon />
                                </button>
                              )}
                            </div>
                            <div>
                              <button className="bg-blue h-10 text-md aspect-square rounded-lg flex items-center justify-center">
                                <SendIcon />
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
                <div className="w-full h-16 bg-darkBlue1  p-3">
                  <div className="flex items-center justify-center">
                    <div className="flex gap-4">
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <button
                          className={`${
                            micOn
                              ? "bg-slate-800/70 border-gray"
                              : "bg-red backdrop-blur border-transparent"
                          } border-2  p-2 cursor-pointer rounded-xl text-white text-xl`}
                          onClick={() => {
                            const audio =
                              localVideo.current.srcObject.getAudioTracks()[0]
                            if (micOn) {
                              audio.enabled = false
                              setMicOn(false)
                            }
                            if (!micOn) {
                              audio.enabled = true
                              setMicOn(true)
                            }
                          }}
                        >
                          {micOn ? <MicOnIcon /> : <MicOffIcon />}
                        </button>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <button
                          className={`${
                            videoActive
                              ? "bg-slate-800/70 border-gray"
                              : "bg-red backdrop-blur border-transparent"
                          } border-2  p-2 cursor-pointer rounded-xl text-white text-xl`}
                          onClick={() => {
                            const videoTrack = localStream
                              .getTracks()
                              .find((track) => track.kind === "video")
                            if (videoActive) {
                              videoTrack.enabled = false
                            } else {
                              videoTrack.enabled = true
                            }
                            setVideoActive(!videoActive)
                          }}
                        >
                          {videoActive ? <VideoOnIcon /> : <VideoOffIcon />}
                        </button>
                      </motion.div>
                    </div>
                    <div className="w-1/6 flex justify-center">
                      <button
                        className="py-2 px-4 flex items-center gap-2 rounded-lg bg-red"
                        onClick={() => {
                          navigate("/")
                          window.location.reload()
                        }}
                      >
                        <CallEndIcon size={20} />
                        <span className="hidden sm:block text-xs">
                          End Call
                        </span>
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <button
                          className={`bg-slate-800/70 backdrop-blur border-gray
          border-2  p-2 cursor-pointer rounded-xl text-white text-xl hover:bg-green-400`}
                          onClick={() => {
                            notify()
                            navigator.clipboard.writeText(window.location.href)
                          }}
                        >
                          <ShareIcon className="cursor-pointer" size={22} />
                        </button>
                        <ToastContainer
                          position="bottom-left"
                          autoClose={1500}
                          hideProgressBar={false}
                          newestOnTop={false}
                          closeOnClick
                          rtl={false}
                          pauseOnFocusLoss={false}
                          draggable
                          pauseOnHover={false}
                        />
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <button
                          className={`${
                            showChat
                              ? "bg-blue border-transparent"
                              : "bg-slate-800/70 backdrop-blur border-gray"
                          } border-2  p-2 cursor-pointer rounded-xl text-white text-xl`}
                          onClick={() => {
                            setshowChat(!showChat)
                          }}
                        >
                          <ChatIcon />
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      ) : (
        <SignIn />
      )}
    </>
  )
}

export default Room
