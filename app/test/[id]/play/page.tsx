'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
// import { GoogleAd } from '@/components/google-ad'
import { CustomAdBanner } from '@/components/custom-ad-banner'
import { cn } from '@/lib/utils'

export default function TestPlayPage() {
    const supabase = createClient()
    const params = useParams()
    const router = useRouter()
    const [testType, setTestType] = useState<'score' | 'mbti'>('score')
    const [questions, setQuestions] = useState<any[]>([])
    const [currentStep, setCurrentStep] = useState(0)
    const [themeColor, setThemeColor] = useState<string>('#ef4444')

    // State for Score Type
    const [totalScore, setTotalScore] = useState(0)

    // State for MBTI Type
    const [mbtiScores, setMbtiScores] = useState<Record<string, number>>({
        E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
    })

    const [loading, setLoading] = useState(true)
    const [calculating, setCalculating] = useState(false)
    const [loadingText, setLoadingText] = useState('결과 분석 중...')

    useEffect(() => {
        if (calculating) {
            const texts = ['성향 분석 중...', '데이터 대조 중...', '결과 생성 중...']
            let i = 0
            const interval = setInterval(() => {
                setLoadingText(texts[i % texts.length])
                i++
            }, 800)
            return () => clearInterval(interval)
        }
    }, [calculating])

    useEffect(() => {
        const fetchTestAndQuestions = async () => {
            // 1. Fetch Test Info (to get type and theme)
            const { data: testData } = await supabase
                .from('tests')
                .select('type, theme_color')
                .eq('id', params.id)
                .single()

            if (testData) {
                setTestType(testData.type as 'score' | 'mbti')
                // Apply Theme Color
                if (testData.theme_color) {
                    setThemeColor(testData.theme_color)
                    document.documentElement.style.setProperty('--theme-color', testData.theme_color)
                }
            }

            // 2. Fetch Questions
            const { data: questionsData } = await supabase
                .from('questions')
                .select(`
                  *,
                  options (
                    *
                  )
                `)
                .eq('test_id', params.id)
                .order('order_index', { ascending: true })

            if (questionsData) {
                const sortedQuestions = questionsData.map(q => ({
                    ...q,
                    options: q.options.sort((a: any, b: any) => a.order_index - b.order_index)
                }))
                setQuestions(sortedQuestions)
            }
            setLoading(false)
        }

        if (params.id) {
            fetchTestAndQuestions()
        }
    }, [params.id])

    const handleOptionClick = (option: any) => {
        if (testType === 'score') {
            setTotalScore(prev => prev + (option.score_weight || 0))
        } else {
            if (option.mbti_indicator) {
                setMbtiScores(prev => ({
                    ...prev,
                    [option.mbti_indicator]: prev[option.mbti_indicator] + 1
                }))
            }
        }

        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            finishTest(option)
        }
    }

    const finishTest = (lastOption: any) => {
        let finalScore = totalScore
        let finalMbtiScores = { ...mbtiScores }

        if (testType === 'score') {
            finalScore += (lastOption.score_weight || 0)
        } else {
            if (lastOption.mbti_indicator) {
                finalMbtiScores[lastOption.mbti_indicator] += 1
            }
        }

        setCalculating(true)

        setTimeout(() => {
            if (testType === 'score') {
                router.push(`/test/${params.id}/result?score=${finalScore}`)
            } else {
                const ei = finalMbtiScores.E >= finalMbtiScores.I ? 'E' : 'I'
                const sn = finalMbtiScores.S >= finalMbtiScores.N ? 'S' : 'N'
                const tf = finalMbtiScores.T >= finalMbtiScores.F ? 'T' : 'F'
                const jp = finalMbtiScores.J >= finalMbtiScores.P ? 'J' : 'P'
                const mbtiResult = `${ei}${sn}${tf}${jp}`

                router.push(`/test/${params.id}/result?mbti=${mbtiResult}`)
            }
        }, 3000)
    }

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading questions...</div>
    if (questions.length === 0) return <div className="p-8 text-center text-muted-foreground">No questions found.</div>

    if (calculating) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-md h-screen flex flex-col justify-center items-center text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <h2
                        className="text-3xl font-bold bg-clip-text text-transparent animate-pulse"
                        style={{
                            backgroundImage: `linear-gradient(to right, ${themeColor}, #ffffff)`,
                            WebkitBackgroundClip: 'text'
                        }}
                    >
                        {loadingText}
                    </h2>


                    <div className="w-full max-w-[300px] h-[250px] mx-auto relative overflow-hidden group rounded-xl">
                        <CustomAdBanner />
                    </div>
                    <div className="flex justify-center gap-2">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}
                        />
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}
                        />
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">잠시만 기다려주세요...</p>
                </motion.div>
            </div>
        )
    }

    const currentQuestion = questions[currentStep]
    const progress = ((currentStep + 1) / questions.length) * 100

    // Parse Image Params
    const getImgStyle = (url: string) => {
        if (!url) return {}
        try {
            const urlObj = new URL(url, 'http://d.com')
            const params = new URLSearchParams(urlObj.search)
            const s = params.get('s') || '1'
            const x = params.get('x') || '50'
            const y = params.get('y') || '50'
            return {
                objectPosition: `${x}% ${y}%`,
                transform: `scale(${s})`
            }
        } catch (e) {
            return {}
        }
    }

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-1000">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                {currentQuestion?.layout_type === 'fullscreen' && currentQuestion?.image_url ? (
                    // Fullscreen Background
                    <>
                        <Image
                            src={currentQuestion.image_url.split('?')[0]}
                            alt="Background"
                            fill
                            className="object-cover"
                            style={getImgStyle(currentQuestion.image_url)}
                        />
                        <div className="absolute inset-0 bg-black/20" />
                    </>
                ) : currentQuestion?.image_url ? (
                    // Default Blurred Background
                    <>
                        <Image
                            src={currentQuestion.image_url.split('?')[0]}
                            alt="Background"
                            fill
                            className="object-cover blur-3xl opacity-30 scale-110 transition-all duration-1000"
                        />
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
                    </>
                ) : (
                    // Default Gradient Background
                    <div
                        className="absolute inset-0 transition-colors duration-1000"
                        style={{
                            background: `radial-gradient(circle at top, ${themeColor}20, transparent 70%)`
                        }}
                    />
                )}
            </div>

            <div className="container mx-auto px-4 py-8 max-w-md flex flex-col relative z-10 flex-1 h-full">
                <div className="mb-6 z-20">
                    <div
                        className="flex justify-between text-sm text-muted-foreground mb-2 font-medium"
                        style={{
                            color: currentQuestion?.layout_type === 'fullscreen' ? 'white' : undefined,
                            textShadow: currentQuestion?.layout_type === 'fullscreen' ? '0 1px 2px rgba(0,0,0,0.5)' : undefined
                        }}
                    >
                        <span>Question {currentStep + 1}</span>
                        <span>{questions.length}</span>
                    </div>
                    <Progress
                        value={progress}
                        className="h-2 bg-secondary/50 backdrop-blur-md"
                        indicatorClassName="transition-all duration-500"
                        style={{
                            // @ts-ignore
                            '--progress-background': themeColor,
                            backgroundColor: currentQuestion?.layout_type === 'fullscreen' ? 'rgba(255,255,255,0.3)' : `${themeColor}20`
                        }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex-1 flex flex-col h-full"
                    >
                        {currentQuestion?.layout_type === 'fullscreen' ? (
                            // Full Screen Layout
                            <div className="flex-1 relative flex flex-col">
                                {/* Text Overlay */}
                                <div
                                    className="absolute w-full text-center z-20"
                                    style={{
                                        top: `${currentQuestion?.text_position?.top || 15}%`,
                                        color: currentQuestion?.text_color || '#ffffff'
                                    }}
                                >
                                    <h2 className="text-2xl font-bold leading-relaxed drop-shadow-md" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                        {currentQuestion.content}
                                    </h2>
                                </div>
                                <Card className="flex-1 flex flex-col justify-center mb-6 glass border-white/10 shadow-2xl shadow-black/5 overflow-hidden relative">
                                    <div className="relative z-10 flex flex-col h-full justify-center">
                                        <CardHeader className="text-center">
                                            <CardTitle className="text-2xl leading-relaxed font-bold">
                                                {currentQuestion.content}
                                            </CardTitle>
                                        </CardHeader>
                                        {currentQuestion.image_url && (
                                            <div className="px-6 pb-6 relative aspect-video w-full overflow-hidden rounded-lg">
                                                <Image
                                                    src={currentQuestion.image_url.split('?')[0]}
                                                    alt="Question"
                                                    fill
                                                    className="object-cover shadow-lg transition-transform duration-700"
                                                    style={getImgStyle(currentQuestion.image_url)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <div className="space-y-3 mb-8">
                                    {currentQuestion.options.map((option: any, index: number) => (
                                        <motion.div
                                            key={option.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full py-8 text-lg whitespace-normal h-auto text-left justify-start px-6 bg-secondary/30 border-white/5 transition-all duration-300 group"
                                                onClick={() => handleOptionClick(option)}
                                                style={{
                                                    // Dynamic hover styles handled by CSS/Tailwind
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = themeColor
                                                    e.currentTarget.style.color = themeColor
                                                    e.currentTarget.style.backgroundColor = `${themeColor}10`
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                                                    e.currentTarget.style.color = ''
                                                    e.currentTarget.style.backgroundColor = ''
                                                }}
                                            >
                                                ```
                                                {option.content}
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : currentQuestion?.layout_type === 'swipe' ? (
                            // Swipe Layout
                            <div className="flex flex-col h-full justify-center items-center relative -mx-4 -my-8 bg-gray-50">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                                {/* Card Stack Effect */}
                                <div className="absolute w-[85%] h-[60%] bg-white rounded-2xl transform translate-y-6 scale-90 border border-black/5 shadow-sm z-0"></div>
                                <div className="absolute w-[90%] h-[60%] bg-white rounded-2xl transform translate-y-3 scale-95 border border-black/5 shadow-md z-10"></div>

                                {/* Main Draggable Card */}
                                <motion.div
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.7}
                                    onDragEnd={(e, info) => {
                                        const threshold = 100
                                        if (info.offset.x > threshold) {
                                            // Swipe Right (Second Option)
                                            if (currentQuestion.options[1]) handleOptionClick(currentQuestion.options[1])
                                        } else if (info.offset.x < -threshold) {
                                            // Swipe Left (First Option)
                                            if (currentQuestion.options[0]) handleOptionClick(currentQuestion.options[0])
                                        }
                                    }}
                                    className="w-[95%] h-[60%] bg-white rounded-2xl shadow-2xl border border-black/5 flex flex-col overflow-hidden relative z-20 cursor-grab active:cursor-grabbing"
                                    whileTap={{ scale: 1.02 }}
                                >
                                    {currentQuestion.image_url ? (
                                        <div className="flex-1 relative">
                                            <Image src={currentQuestion.image_url} alt="Question" fill className="object-cover pointer-events-none" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                                            <div className="absolute bottom-0 left-0 w-full p-6 text-white pointer-events-none">
                                                <h3 className="text-2xl font-bold leading-tight drop-shadow-lg mb-2">
                                                    {currentQuestion.content}
                                                </h3>
                                                <p className="text-white/80 text-sm">스와이프하여 선택하세요</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-white to-gray-50">
                                            <h3 className="text-2xl font-bold text-slate-800 leading-relaxed mb-4">
                                                {currentQuestion.content}
                                            </h3>
                                            <div className="w-16 h-1 bg-primary/20 rounded-full"></div>
                                        </div>
                                    )}

                                    {/* Swipe Overlays (Visible on Drag - Logic handled by Framer Motion variants in a real app, simplified here with static labels for now) */}
                                    <div className="absolute top-8 left-8 border-4 border-green-500 text-green-500 font-bold text-2xl px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity rotate-[-15deg] pointer-events-none">
                                        {currentQuestion.layout_config?.swipeRightLabel || 'LIKE'}
                                    </div>
                                    <div className="absolute top-8 right-8 border-4 border-red-500 text-red-500 font-bold text-2xl px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity rotate-[15deg] pointer-events-none">
                                        {currentQuestion.layout_config?.swipeLeftLabel || 'NOPE'}
                                    </div>
                                </motion.div>

                                {/* Controls / Instructions */}
                                <div className="mt-10 flex gap-8 items-center z-20">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-14 w-14 rounded-full border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 shadow-sm"
                                        onClick={() => currentQuestion.options[0] && handleOptionClick(currentQuestion.options[0])}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </Button>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Swipe</span>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="h-14 w-14 rounded-full border-2 border-green-100 text-green-500 hover:bg-green-50 hover:border-green-200 shadow-sm"
                                        onClick={() => currentQuestion.options[1] && handleOptionClick(currentQuestion.options[1])}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // Default Layout
                            <>
                                <Card className="flex-1 flex flex-col justify-center mb-6 glass border-white/10 shadow-2xl shadow-black/5 overflow-hidden relative">
                                    <div className="relative z-10 flex flex-col h-full justify-center">
                                        <CardHeader className="text-center">
                                            <CardTitle className="text-2xl leading-relaxed font-bold">
                                                {currentQuestion.content}
                                            </CardTitle>
                                        </CardHeader>
                                        {currentQuestion.image_url && (
                                            <div className="px-6 pb-6 relative aspect-video w-full overflow-hidden rounded-lg">
                                                <Image
                                                    src={currentQuestion.image_url.split('?')[0]}
                                                    alt="Question"
                                                    fill
                                                    className="object-cover shadow-lg transition-transform duration-700"
                                                    style={getImgStyle(currentQuestion.image_url)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <div className="space-y-3 mb-8">
                                    {currentQuestion.options.map((option: any, index: number) => (
                                        <motion.div
                                            key={option.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full py-8 text-lg whitespace-normal h-auto text-left justify-start px-6 bg-secondary/30 border-white/5 transition-all duration-300 group"
                                                onClick={() => handleOptionClick(option)}
                                                style={{
                                                    // Dynamic hover styles handled by CSS/Tailwind
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = themeColor
                                                    e.currentTarget.style.color = themeColor
                                                    e.currentTarget.style.backgroundColor = `${themeColor}10`
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                                                    e.currentTarget.style.color = ''
                                                    e.currentTarget.style.backgroundColor = ''
                                                }}
                                            >
                                                {option.content}
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
