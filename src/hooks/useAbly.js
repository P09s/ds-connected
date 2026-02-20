// src/hooks/useAbly.js  — FIXED VERSION
import { useEffect, useRef, useCallback, useState } from 'react'
import Ably from 'ably'

const ABLY_KEY = import.meta.env.VITE_ABLY_KEY || 'PASTE_YOUR_ABLY_KEY_HERE'

// FIX: No module-level singleton. Create one client per hook instance.
// This prevents StrictMode double-mount issues and cross-page client reuse.
function createClient() {
  return new Ably.Realtime({
    key: ABLY_KEY,
    clientId: `user-${Math.random().toString(36).slice(2, 10)}`,
  })
}

export function useAblyChannel(roomId, onMessage) {
  const channelRef = useRef(null)
  const clientRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  const queueRef = useRef([])
  const readyRef = useRef(false)
  const [connState, setConnState] = useState('disconnected')
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!roomId) return

    let cancelled = false

    // FIX: Always create a fresh client per effect run
    const client = createClient()
    clientRef.current = client

    const onStateChange = (change) => {
      if (!cancelled) setConnState(change.current)
    }
    client.connection.on(onStateChange)
    setConnState(client.connection.state)

    const channel = client.channels.get(`ds-room-${roomId}`)
    channelRef.current = channel
    readyRef.current = false

    const handler = (msg) => {
      if (!cancelled) onMessageRef.current?.(msg.name, msg.data)
    }

    channel.subscribe(handler)

    channel.on('attached', () => {
      if (cancelled) return
      readyRef.current = true
      const q = queueRef.current.splice(0)
      q.forEach(({ event, data }) => channel.publish(event, data))
    })

    if (channel.state === 'attached') {
      readyRef.current = true
    }

    return () => {
      cancelled = true
      channel.unsubscribe(handler)
      // FIX: Close and destroy the client on cleanup so we don't leak connections
      try { client.close() } catch (_) {}
      clientRef.current = null
    }
  }, [roomId])

  const publish = useCallback((event, data) => {
    const channel = channelRef.current
    if (!channel) return
    if (readyRef.current) {
      channel.publish(event, data).catch(console.error)
    } else {
      queueRef.current.push({ event, data })
      channel.publish(event, data).catch(() => {})
    }
  }, [])

  return { publish, connState }
}