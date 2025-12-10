'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { RotateCcw, Home, Download, Loader2 } from 'lucide-react'
import { ShareButtons } from '@/components/share-buttons'
import { CustomAdBanner } from '@/components/custom-ad-banner'
import { ResultImageCard } from '@/components/result-image-card'
import html2canvas from 'html2canvas'
import { useToast } from '@/components/ui/toast'

export default function ResultClient() {
    const supabase = createClient()
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { showToast } = useToast()

    const scoreParam = searchParams.get('score')
    const mbtiParam = searchParams.get('mbti')

    const [result, setResult] = useState<any>(null)
    const [testInfo, setTestInfo] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [recommendedTests, setRecommendedTests] = useState<any[]>([])
    const [themeColor, setThemeColor] = useState<string>('#ef4444')
    const [isSaving, setIsSaving] = useState(false)

    const resultCardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        console.log('AdSense Interstitial Triggered (Result)')

        const fetchResultAndRecommendations = async () => {
            // 0. Fetch Test Info (Theme Color)
            const { data: testData } = await supabase
                .from('tests')
                .select('title, theme_color')
                .eq('id', params.id)
                .single()

            if (testData) {
                setTestInfo(testData)
                if (testData.theme_color) {
                    setThemeColor(testData.theme_color)
                }
            }

            // 1. Fetch Result
            let query = supabase.from('results').select('*').eq('test_id', params.id)

            if (mbtiParam) {
                query = query.eq('mbti_result', mbtiParam)
            } else if (scoreParam) {
                const score = parseInt(scoreParam)
                query = query.lte('min_score', score).gte('max_score', score)
            } else {
                setLoading(false)
                return
            }

            const { data, error } = await query.single()

            if (data) {
                setResult(data)
            } else {
                console.log('No result found for params:', { scoreParam, mbtiParam })
            }

            // 2. Fetch Recommendations (Random 3)
            const { data: recData } = await supabase
                .from('tests')
                .select('id, title, description, thumbnail_url')
                .neq('id', params.id)
                .limit(3)

            if (recData) {
                // Shuffle array
                const shuffled = recData.sort(() => 0.5 - Math.random())
                setRecommendedTests(shuffled)
            }

            setLoading(false)
        }

        if (params.id) {
            fetchResultAndRecommendations()
        }
    }, [params.id, scoreParam, mbtiParam])

    const handleSaveImage = async () => {
        if (!resultCardRef.current) return
        setIsSaving(true)

        try {
            const canvas = await html2canvas(resultCardRef.current, {
                scale: 2, // High resolution
                backgroundColor: null,
                useCORS: true, // Allow cross-origin images
                logging: false,
            })

            const image = canvas.toDataURL('image/png')
            const link = document.createElement('a')
            link.href = image
            link.download = `${testInfo?.title || 'test'}_result.png`
            link.click()

            showToast('이미지가 저장되었습니다!')
        } catch (error) {
            console.error('Failed to save image:', error)
            showToast('이미지 저장에 실패했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading result...</div>

    return (
        <div className="container mx-auto px-4 py-12 max-w-md min-h-screen flex flex-col justify-center">
            {/* Hidden Card for Capture */}
            <div className="fixed left-[-9999px] top-[-9999px]">
                <ResultImageCard
                    ref={resultCardRef}
                    testTitle={testInfo?.title || ''}
                    resultTitle={result?.title || ''}
                    resultDescription={result?.description || ''}
                    themeColor={themeColor}
                    imageUrl={result?.image_url}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="mb-8 glass border-0 overflow-hidden shadow-2xl shadow-primary/10" style={{ boxShadow: `0 25px 50px -12px ${themeColor}20` }}>
                    <CardHeader className="text-center pb-2">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <CardTitle className="text-3xl mb-2 font-bold">당신의 결과는?</CardTitle>
                        </motion.div>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                        >
                            <CardDescription
                                className="text-2xl font-extrabold bg-clip-text text-transparent"
                                style={{ backgroundImage: `linear-gradient(to right, ${themeColor}, #a855f7)` }}
                            >
                                {result ? result.title : '결과를 찾을 수 없습니다.'}
                            </CardDescription>
                        </motion.div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        {result?.image_url && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="aspect-video w-full overflow-hidden rounded-xl relative shadow-lg"
                            >
                                <Image src={result.image_url} alt={result.title} fill className="object-cover" />
                            </motion.div>
                        )}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="prose dark:prose-invert max-w-none bg-secondary/30 p-4 rounded-lg"
                        >
                            <p className="text-lg leading-relaxed">{result?.description}</p>
                        </motion.div>
                    </CardContent>
                    <div className="px-6 pb-6">
                        <CustomAdBanner />
                    </div>
                </Card>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="space-y-4"
                >
                    {/* Save Image Button */}
                    <Button
                        onClick={handleSaveImage}
                        disabled={isSaving}
                        className="w-full h-14 text-lg font-bold shadow-lg mb-4"
                        style={{ backgroundColor: themeColor }}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                저장 중...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-5 w-5" />
                                결과 이미지로 저장하기
                            </>
                        )}
                    </Button>

                    <ShareButtons
                        title={result?.title || '심리테스트 결과'}
                        description={result?.description || '나의 결과는?'}
                        imageUrl={result?.image_url}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="h-12 text-base border-white/10 hover:bg-white/5"
                            onClick={() => router.push(`/test/${params.id}`)}
                            style={{ borderColor: themeColor, color: themeColor }}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" /> 다시 하기
                        </Button>
                        <Link href="/" className="w-full">
                            <Button
                                className="w-full h-12 text-base text-white"
                                style={{ backgroundColor: themeColor }}
                            >
                                <Home className="mr-2 h-4 w-4" /> 메인으로
                            </Button>
                        </Link>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.3 }}
                        className="border-t border-white/10 pt-8"
                    >
                        <h3 className="text-lg font-bold mb-4 text-center">이런 테스트는 어때요?</h3>
                        <div className="grid gap-3 mb-6">
                            {recommendedTests.map((test: any) => (
                                <Link href={`/test/${test.id}`} key={test.id}>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-white/5">
                                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                            <Image src={test.thumbnail_url || '/placeholder.png'} alt={test.title} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm truncate">{test.title}</h4>
                                            <p className="text-xs text-muted-foreground truncate">{test.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <Link href="/">
                            <Button variant="secondary" className="w-full h-12 text-base bg-secondary/50 hover:bg-secondary">
                                <Home className="mr-2 h-4 w-4" /> 다른 테스트 보러가기
                            </Button>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                    >
                        {/* Comments removed by user request */}
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    )
}
