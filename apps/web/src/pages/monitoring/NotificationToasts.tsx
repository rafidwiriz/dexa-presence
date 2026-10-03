import { useEffect, useState } from 'react'
import { subscribeToNotifications } from '../../lib/api'

interface Toast { id: number; text: string }

export default function NotificationToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((ev) => {
      const fields = Object.keys(ev.fields)
      const id = Date.now()
      setToasts((prev) => [...prev, { id, text: `Profil karyawan diubah: ${fields.join(', ')}` }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 6000)
    })
    return unsubscribe
  }, [])

  return (
    <div className="fixed top-4 right-4 z-20 space-y-2 max-w-xs">
      {toasts.map((t) => (
        <div key={t.id} className="bg-slate-800 text-white text-sm rounded-xl shadow-lg px-4 py-3">
          {t.text}
        </div>
      ))}
    </div>
  )
}
