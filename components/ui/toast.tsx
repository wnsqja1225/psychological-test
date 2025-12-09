"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
    message: string
    isVisible: boolean
    onClose: () => void
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
    if (!isVisible) return null

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="bg-foreground text-background px-6 py-3 rounded-full shadow-lg flex items-center gap-4 min-w-[300px] justify-between">
                <span className="font-medium">{message}</span>
                <button onClick={onClose} className="hover:opacity-70">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}

export function useToast() {
    const [toast, setToast] = React.useState<{ message: string; isVisible: boolean }>({
        message: "",
        isVisible: false,
    })

    const showToast = (message: string) => {
        setToast({ message, isVisible: true })
        setTimeout(() => {
            setToast((prev) => ({ ...prev, isVisible: false }))
        }, 3000)
    }

    const closeToast = () => {
        setToast((prev) => ({ ...prev, isVisible: false }))
    }

    return { toast, showToast, closeToast }
}
