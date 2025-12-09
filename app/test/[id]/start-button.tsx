'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function StartButton({ testId }: { testId: string }) {
    const router = useRouter()

    const startTest = () => {
        // AdSense Interstitial Trigger Placeholder
        // try {
        //     (window.adsbygoogle = window.adsbygoogle || []).push({
        //         google_ad_client: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID,
        //         enable_page_level_ads: true,
        //         interstitials: { google_ad_channel: '...' }
        //     });
        // } catch (e) { console.error(e) }

        console.log('AdSense Interstitial Triggered')
        router.push(`/test/${testId}/play`)
    }

    return (
        <Button className="w-full text-lg py-6" onClick={startTest}>
            테스트 시작하기
        </Button>
    )
}
