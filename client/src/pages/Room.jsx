import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import Peer from 'simple-peer'

import Loading from '../components/Loading'

//sounds
import joinSoundSrc from "../sounds/join.mp3"

const Room = () => {
  const [loading, setLoading] = useState(true)
  const [msgText, setMsgText] = useState('')
  const { roomID } = useParams()
  const socket = useRef()

  //functions
  const sendMessage = (e) => {
    e.preventDefault()
    if (msgText) {
      socket.current.emit('send message', {
        roomID,
        from: socket.current.id,
        user: {
          // send user from fribase
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
  

  return (
    <>
      <Loading />
    </>
  )
}

export default Room
