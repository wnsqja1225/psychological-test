'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Link2, MessageCircle } from 'lucide-react'
import { useToast, Toast } from '@/components/ui/toast'

interface ShareButtonsProps {
    title: string
    description: string
    imageUrl?: string
}

declare global {
    interface Window {
        Kakao: any
    }
}

export function ShareButtons({ title, description, imageUrl }: ShareButtonsProps) {
    const { toast, showToast, closeToast } = useToast()
    const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Kakao) {
            if (!window.Kakao.isInitialized()) {
                // Replace with your actual Kakao JavaScript Key
                // You can find it in Kakao Developers Console
                window.Kakao.init('YOUR_KAKAO_JAVASCRIPT_KEY')
            }
        }
    }, [])

    const handleKakaoShare = () => {
        if (typeof window !== 'undefined' && window.Kakao) {
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: title,
                    description: description,
                    imageUrl: imageUrl || 'https://via.placeholder.com/800x400?text=Psychological+Test',
                    link: {
                        mobileWebUrl: currentUrl,
                        webUrl: currentUrl,
                    },
                },
                buttons: [
                    {
                        title: '테스트 하러가기',
                        link: {
                            mobileWebUrl: currentUrl,
                            webUrl: currentUrl,
                        },
                    },
                ],
            })
        } else {
            alert('카카오톡 공유 기능을 불러오지 못했습니다.')
        }
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl)
            showToast("링크가 복사되었습니다!")
        } catch (err) {
            console.error('Failed to copy: ', err)
            showToast("링크 복사에 실패했습니다.")
        }
    }

    return (
        <>
            <div className="flex gap-3 justify-center my-6">
                <Button
                    onClick={handleKakaoShare}
                    className="bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#000000] font-bold shadow-md"
                    size="lg"
                >
                    <MessageCircle className="mr-2 h-5 w-5 fill-black" />
                    카카오톡 공유
                </Button>
                <Button
                    onClick={handleCopyLink}
                    variant="secondary"
                    size="lg"
                    className="shadow-md"
                >
                    <Link2 className="mr-2 h-5 w-5" />
                    링크 복사
                </Button>
            </div>
            <Toast message={toast.message} isVisible={toast.isVisible} onClose={closeToast} />
        </>
    )
}
