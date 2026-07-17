import React from 'react'
import { io, Socket } from 'socket.io-client'
import type { TimelineEntry } from '~/components/tracking/ParcelTimelineView'

declare global {
    interface Window {
        ENV?: { API_BASE_URL?: string }
    }
}

export type LiveRider = {
    name?: string | null
    phone?: string | null
    latitude?: number | null
    longitude?: number | null
    updatedAt?: string | null
}

type Args = {
    parcelNumber: string | null | undefined
    initialTimeline: TimelineEntry[]
    initialStatus?: string | null
    initialRider?: LiveRider | null
}

function realtimeUrl() {
    if (typeof window === 'undefined') return null
    const base = (window.ENV?.API_BASE_URL || '').replace(/\/$/, '')
    if (!base) return null
    return `${base}/realtime`
}

export function useParcelRealtime({
    parcelNumber,
    initialTimeline,
    initialStatus = null,
    initialRider = null,
}: Args) {
    const [connected, setConnected] = React.useState(false)
    const [timelineItems, setTimelineItems] =
        React.useState<TimelineEntry[]>(initialTimeline)
    const [statusName, setStatusName] = React.useState<string | null>(
        initialStatus,
    )
    const [rider, setRider] = React.useState<LiveRider | null>(initialRider)

    React.useEffect(() => {
        setTimelineItems(initialTimeline)
    }, [initialTimeline])

    React.useEffect(() => {
        setStatusName(initialStatus)
    }, [initialStatus])

    React.useEffect(() => {
        setRider(initialRider)
    }, [initialRider])

    React.useEffect(() => {
        if (!parcelNumber) return
        const url = realtimeUrl()
        if (!url) return

        let socket: Socket | null = null
        try {
            socket = io(url, {
                transports: ['websocket', 'polling'],
                autoConnect: true,
            })
        } catch {
            return
        }

        const onConnect = () => {
            setConnected(true)
            socket?.emit('parcel:subscribe', { parcelNumber })
        }
        const onDisconnect = () => setConnected(false)

        const onStatus = (payload: {
            parcelNumber?: string
            status?: string
            message?: string
            createdAt?: string
            timelineId?: number | string
        }) => {
            if (payload.parcelNumber && payload.parcelNumber !== parcelNumber) {
                return
            }
            if (payload.status) setStatusName(payload.status)
            if (payload.message) {
                const entry: TimelineEntry = {
                    id:
                        payload.timelineId ||
                        `${Date.now()}-${payload.message.slice(0, 12)}`,
                    message: payload.message,
                    createdAt: payload.createdAt || new Date().toISOString(),
                }
                setTimelineItems((prev) => {
                    if (
                        prev.some(
                            (p) =>
                                p.message === entry.message &&
                                p.createdAt === entry.createdAt,
                        )
                    ) {
                        return prev
                    }
                    return [entry, ...prev]
                })
            }
        }

        const onRider = (payload: {
            parcelNumber?: string
            latitude?: number
            longitude?: number
            updatedAt?: string
        }) => {
            if (payload.parcelNumber && payload.parcelNumber !== parcelNumber) {
                return
            }
            setRider((prev) => ({
                ...(prev || {}),
                latitude: payload.latitude ?? prev?.latitude,
                longitude: payload.longitude ?? prev?.longitude,
                updatedAt: payload.updatedAt || new Date().toISOString(),
            }))
        }

        socket.on('connect', onConnect)
        socket.on('disconnect', onDisconnect)
        socket.on('parcel:status:update', onStatus)
        socket.on('parcel:rider:location', onRider)
        if (socket.connected) onConnect()

        return () => {
            socket?.emit('parcel:unsubscribe', { parcelNumber })
            socket?.off('connect', onConnect)
            socket?.off('disconnect', onDisconnect)
            socket?.off('parcel:status:update', onStatus)
            socket?.off('parcel:rider:location', onRider)
            socket?.disconnect()
        }
    }, [parcelNumber])

    return { connected, timelineItems, statusName, rider, setRider }
}
