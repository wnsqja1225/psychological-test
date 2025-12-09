'use client'

import { useEffect } from 'react'

declare global {
    interface Window {
        adsbygoogle: any[]
    }
}

export function GoogleAd({ slotId, format = 'auto', responsive = true }: { slotId: string, format?: string, responsive?: boolean }) {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch (err) {
            console.error(err)
        }
    }, [])

    return (
        <div className="my-4 text-center overflow-hidden">
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
            />
        </div>
    )
}
