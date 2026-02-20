// src/hooks/useAbly.js
import { useEffect, useRef, useCallback, useState } from 'react'
import Ably from 'ably'

const ABLY_KEY = import.meta.env.VITE_ABLY_KEY || 'PASTE_YOUR_ABLY_KEY_HERE'

// One client per browser tab (not a module singleton — avoids same-tab echo issues)
let ablyClient = null

function getClient() {
  if (!ablyClient || ablyClient.connection.state === 'failed') {
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
  const queueRef = useRef([])          // messages queued before channel ready
  const readyRef = useRef(false)
  const [connState, setConnState] = useState('disconnected')
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!roomId) return

    let cancelled = false
    const client = getClient()

    // Track connection state visually
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

    // When channel attaches, flush queued messages
    channel.on('attached', () => {
      if (cancelled) return
      readyRef.current = true
      const q = queueRef.current.splice(0)
      q.forEach(({ event, data }) => channel.publish(event, data))
    })

    // If already attached, mark ready immediately
    if (channel.state === 'attached') {
      readyRef.current = true
    }

    return () => {
      cancelled = true
      client.connection.off(onStateChange)
      channel.unsubscribe(handler)
    }
  }, [roomId])

  const publish = useCallback((event, data) => {
    const channel = channelRef.current
    if (!channel) return
    if (readyRef.current) {
      channel.publish(event, data).catch(console.error)
    } else {
      // Queue it — will flush when attached
      queueRef.current.push({ event, data })
      // Also try directly in case state is stale
      channel.publish(event, data).catch(() => {})
    }
  }, [])

  return { publish, connState }
}