import React, { useEffect, useState } from "react"
import { useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { io } from "socket.io-client"
import Peer from "simple-peer"

import Loading from "../components/Loading"
import { useAuth } from "../middleware/authentication"
import MeetGridCard from "../components/MeetGridCard"

//sounds
import joinSoundSrc from "../sounds/join.mp3"
import msgSoundSrc from "../sounds/message.mp3"
import leaveSoundSrc from "../sounds/leave.mp3"

const Room = () => {
  const [loading, setLoading] = useState(true)
  const [localStream, setLocalStream] = useState(null)
  const [micOn, setMicOn] = useState(true)
  const [showChat, setshowChat] = useState(true)
  const [share, setShare] = useState(false)
  const [pin, setPin] = useState(false)
  const [peers, setPeers] = useState([])
  const [msgs, setMsgs] = useState([])
  const [particpentsOpen, setParticpentsOpen] = useState(true)
  const [videoActive, setVideoActive] = useState(true)
  const [msgText, setMsgText] = useState("")
  const { roomID } = useParams()
  const navigate = useNavigate()
  const chatScroll = useRef()
  const socket = useRef()
  const peersRef = useRef([])
  const localVideo = useRef()

  // user
  const { user, login } = useAuth()

  //functions
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
              //user from firebase
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
      stream
    })
    peer.on("signal", (signal) => {
      socket.current.emit("returning signal", { signal, callerID })
    })
    const joinSound = new Audio(joinSoundSrc)
    joinSound.play()
    peer.signal(incomingSignal)
    return peer
  }

  // video stream
  useEffect(() => {
    const video = () => {
      socket.current = io.connect(
        process.env.BACKENDURL || "http://localhost:5000"
      )
      socket.current.on("message", (data) => {
        const msgAudio = new Audio(msgSoundSrc)
        if (user?.uid !== data.user.id) {
          console.log("send")
          msgAudio.play()
        }
        const msg = {
          send: user?.uid === data.user.id,
          ...data
        }
        setMsgs([...msgs, msg])
        console.log(msgs)
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
    return video()
  }, [peer, roomID])

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
                className="flex flex-row bg-darkBlue2 text-white w-full"
              >
                <motion.div
                  layout
                  className="flex flex-col bg-darkBlue2 justify-between w-full"
                >
                  <div
                    className="flex-shrink-0 overflow-y-scroll p-3"
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
                          className="h-full w-full object-cover rounded-lg"
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

                        <div className="absolute bottom-4 right-4"></div>
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-slate-800/70 backdrop-blur border-gray border-2  py-1 px-3 cursor-pointer rounded-md text-white text-xs">
                            {user?.displayName}
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
                  <div className="w-full h-16 bg-darkBlue1 border-t-2 border-lightGray p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <div>
                          <button
                            className={`${
                              micOn
                                ? "bg-blue border-transparent"
                                : "bg-slate-800/70 backdrop-blur border-gray"
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
                        </div>
                        <div>
                          <button
                            className={`${
                              videoActive
                                ? "bg-blue border-transparent"
                                : "bg-slate-800/70 backdrop-blur border-gray"
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
                        </div>
                      </div>
                      <div className="flex-grow flex justify-center">
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
                      <div className="flex gap-2">
                        <div>
                          <button
                            className={`bg-slate-800/70 backdrop-blur border-gray
          border-2  p-2 cursor-pointer rounded-xl text-white text-xl`}
                            onClick={() => setShare(true)}
                          >
                            <ShareIcon size={22} />
                          </button>
                        </div>
                        <div>
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
                        </div>
                      </div>
                    </div>
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
                        height: "calc(100vh - 128px)"
                      }}
                    >
                      <div className="flex flex-col bg-darkBlue1 w-full border-b-2 border-gray">
                        <div
                          className="flex items-center w-full p-3 cursor-pointer"
                          onClick={() => setParticpentsOpen(!particpentsOpen)}
                        >
                          <div className="text-xl text-slate-400">
                            <UsersIcon />
                          </div>
                          <div className="ml-2 text-sm font">Particpents</div>
                          <div
                            className={`${
                              particpentsOpen && "rotate-180"
                            } transition-all  ml-auto text-lg`}
                          >
                            <DownIcon />
                          </div>
                        </div>
                        <motion.div
                          layout
                          className={`${
                            particpentsOpen ? "block" : "hidden"
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
                            className="ml-auto text-lg"
                            onClick={() => setParticpentsOpen(!particpentsOpen)}
                          >
                            <DownIcon />
                          </div>
                        </div>
                        <motion.div
                          layout
                          ref={chatScroll}
                          className="p-3 h-full overflow-y-scroll flex flex-col gap-4"
                        >
                          {msgs.map((msg, index) => (
                            <motion.div
                              layout
                              initial={{ x: msg.send ? 100 : -100, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
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
            )
          )}
          {share && (
            <div className="fixed flex items-center justify-center top-0 left-0 h-full w-full z-30 bg-slate-800/60 backdrop-blur">
              <div className="bg-white  p-3 rounded shadow shadow-white w-full mx-auto max-w-[500px] relative">
                <div className="flex items-center justify-between">
                  <div className="text-slate-800">
                    Share the link with someone to join the room
                  </div>
                  <div>
                    <ClearIcon
                      size={30}
                      color="#121212"
                      onClick={() => setShare(false)}
                    />
                  </div>
                </div>
                <div className="my-5 rounded flex items-center justify-between gap-2 text-sm text-slate-500 bg-slate-200 p-2 ">
                  <LinkIcon />
                  <div className="flex-grow">
                    {window.location.href.length > 40
                      ? `${window.location.href.slice(0, 37)}...`
                      : window.location.href}
                  </div>
                  <CopyToClipboardIcon
                    className="cursor-pointer"
                    onClick={() =>
                      navigator.clipboard.writeText(window.location.href)
                    }
                  />
                </div>
                <div className="flex w-full aspect-square h-full justify-center items-center">
                  <QRCode
                    // className="hidden"
                    size={200}
                    value={window.location.href}
                    logoImage="/images/logo.png"
                    qrStyle="dots"
                    style={{ width: "100%" }}
                    eyeRadius={10}
                  />
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      ) : (
        <div className="h-full bg-darkBlue2 flex items-center justify-center">
          <button
            className="flex items-center gap-2 p-1 pr-3 rounded text-white font-bold bg-blue transition-all"
            onClick={login}
          >
            <div className="p-2 bg-white rounded">
              <GoogleIcon size={24} />
            </div>
            Login with Google
          </button>
        </div>
      )}
    </>
  )
}

export default Room
