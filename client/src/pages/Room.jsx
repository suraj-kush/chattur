import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import Peer from 'simple-peer'

import Loading from '../components/Loading'
import { useAuth } from '../middleware/authentication'

//sounds
import joinSoundSrc from "../sounds/join.mp3"
import msgSoundSrc from "../sounds/message.mp3"

const Room = () => {
  const [loading, setLoading] = useState(true)
  const [msgText, setMsgText] = useState('')
  const [msgs, setMsgs] = useState([])
  const [localStream, setLocalStream] = useState(null)
  const { roomID } = useParams()
  const socket = useRef()

  const { user, login } = useAuth();

  //functions
  const sendMessage = (e) => {
    e.preventDefault()
    if (msgText) {
      socket.current.emit('send message', {
        roomID,
        from: socket.current.id,
        user: {
            id: user.uid,
            name: user?.displayName,
            profilePic: user.photoURL,
        },
        message: msgText.trim(),
      })
    }
    setMsgText('')
  }
  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    })

    peer.on('signal', (signal) => {
      socket.current.emit('sending signal', {
        userToSignal,
        callerID,
        signal,
        user: user
          ? {
              //user from firebase
              uid: user?.uid,
              email: user?.email,
              name: user?.displayName,
              photoURL: user?.photoURL,
            }
          : null,
      })
    })

    return peer
  }

  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    })
    peer.on('signal', (signal) => {
      socket.current.emit('returning signal', { signal, callerID })
    })
    const joinSound = new Audio(joinSoundSrc)
    joinSound.play()
    peer.signal(incomingSignal)
    return peer
  }

  // video stream
  useEffect(() => {
    const video = () =>{
        socket.current = io.connect(
            process.env.BACKENDURL || "http://localhost:5000"
        )
        socket.current.on("message", (data)=>{
            const msgAudio = new Audio(msgSoundSrc)
            if(user?.uid !== data.user.id){
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
        if(user){
            navigator.mediaDevices.getUserMedia({
                video: true, 
                audio: true
            })
            .then((stream)){
                setLoading(false);
                setLocalStream(stream);
                localVideo.current.srcObject = stream;
                socket.current.emit("join room", {
                  roomID,
                  user: user
                    ? {
                        uid: user?.uid,
                        email: user?.email,
                        name: user?.displayName,
                        photoURL: user?.photoURL,
                      }
                    : null,
                });
                socket.current.on("all users", (users) => {
                    const peers = [];
                    users.forEach((user) => {
                      const peer = createPeer(user.userId, socket.current.id, stream);
                      peersRef.current.push({
                        peerID: user.userId,
                        peer,
                        user: user.user,
                      });
                      peers.push({
                        peerID: user.userId,
                        peer,
                        user: user.user,
                      });
                    });
                    setPeers(peers);
                  });
    
                socket.current.on("user joined", (payload) => {
                  // console.log(payload);
                  const peer = addPeer(payload.signal, payload.callerID, stream);
                  peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                    user: payload.user,
                  });
    
                  const peerObj = {
                    peerID: payload.callerID,
                    peer,
                    user: payload.user,
                  };
    
                  setPeers((users) => [...users, peerObj]);
                });
    
                socket.current.on("receiving returned signal", (payload) => {
                  const item = peersRef.current.find(
                    (p) => p.peerID === payload.id
                  );
                  item.peer.signal(payload.signal);
                });
    
                socket.current.on("user left", (id) => {
                  const audio = new Audio(leaveSFX);
                  audio.play();
                  const peerObj = peersRef.current.find((p) => p.peerID === id);
                  if (peerObj) peerObj.peer.destroy();
                  const peers = peersRef.current.filter((p) => p.peerID !== id);
                  peersRef.current = peers;
                  setPeers((users) => users.filter((p) => p.peerID !== id));
                });
            }
        }
    }
    return video();
  },[roomID])

  return (
    <>
      <Loading />
    </>
  )
}

export default Room
