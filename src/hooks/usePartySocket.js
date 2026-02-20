import { useEffect, useRef, useCallback, useState } from 'react'
import PartySocket from 'partysocket'

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST || '127.0.0.1:1999'

export function usePartySocket(roomId, onMessage) {
  const socketRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  const clientId = useRef(`client-${Math.random().toString(36).slice(2, 10)}`)
  const [connState, setConnState] = useState('disconnected')

  onMessageRef.current = onMessage

  useEffect(() => {
    if (!roomId) return

    let cancelled = false

    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: `ds-room-${roomId}`,
      id: clientId.current,
    })

    socketRef.current = socket
    setConnState('connecting')

    socket.addEventListener('open', () => {
      if (!cancelled) setConnState('connected')
    })

    socket.addEventListener('close', () => {
      if (!cancelled) setConnState('disconnected')
    })

    socket.addEventListener('error', () => {
      if (!cancelled) setConnState('error')
    })

    socket.addEventListener('message', (evt) => {
      if (cancelled) return
      try {
        const { event, data, from } = JSON.parse(evt.data)
        if (from === clientId.current) return
        onMessageRef.current?.(event, data)
      } catch (_) {}
    })

    return () => {
      cancelled = true
      socket.close()
      socketRef.current = null
    }
  }, [roomId])

  const publish = useCallback((event, data) => {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    socket.send(JSON.stringify({ event, data, from: clientId.current }))
  }, [])

  return { publish, connState }
}