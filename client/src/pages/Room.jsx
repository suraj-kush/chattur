import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import Peer from 'simple-peer'

import Loading from '../components/Loading'

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

  return (
    <>
      <Loading />
    </>
  )
}

export default Room
