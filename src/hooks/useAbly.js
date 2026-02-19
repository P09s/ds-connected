// src/hooks/useAbly.js
// Shared real-time channel hook using Ably
import { useEffect, useRef, useCallback } from 'react'
import Ably from 'ably'

// FREE Ably API key — works out of the box, 6M messages/month free
// Get your own at: https://ably.com (free account)
const ABLY_KEY = import.meta.env.VITE_ABLY_KEY || 'PASTE_YOUR_ABLY_KEY_HERE'

let ablyClient = null

function getClient() {
  if (!ablyClient) {
    ablyClient = new Ably.Realtime({
      key: ABLY_KEY,
      clientId: `user-${Math.random().toString(36).slice(2, 8)}`,
    })
  }
  return ablyClient
}

export function useAblyChannel(roomId, onMessage) {
  const channelRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!roomId) return
    const client = getClient()
    const channel = client.channels.get(`ds-room-${roomId}`)
    channelRef.current = channel

    const handler = (msg) => {
      onMessageRef.current?.(msg.name, msg.data)
    }

    channel.subscribe(handler)

    return () => {
      channel.unsubscribe(handler)
    }
  }, [roomId])

  const publish = useCallback((event, data) => {
    channelRef.current?.publish(event, data)
  }, [])

  return { publish }
}
