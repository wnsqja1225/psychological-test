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

export default function TestPlayPage() {
    const supabase = createClient()
    const params = useParams()
    const router = useRouter()
    const [testType, setTestType] = useState<'score' | 'mbti'>('score')
    const [questions, setQuestions] = useState<any[]>([])
    const [currentStep, setCurrentStep] = useState(0)

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
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-white animate-pulse">
                        {loadingText}
                    </h2>


                    <div className="w-full max-w-[300px] h-[250px] mx-auto relative overflow-hidden group rounded-xl">
                        <CustomAdBanner />
                    </div>
                    <div className="flex justify-center gap-2">
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
                    </div>
                    <p className="text-sm text-muted-foreground">잠시만 기다려주세요...</p>
                </motion.div>
            </div>
        )
    }

    const currentQuestion = questions[currentStep]
    const progress = ((currentStep + 1) / questions.length) * 100

    return (
        <div className="container mx-auto px-4 py-8 max-w-md h-screen flex flex-col">
            <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2 font-medium">
                    <span>Question {currentStep + 1}</span>
                    <span>{questions.length}</span>
                </div>
                <Progress value={progress} className="h-2 bg-secondary" />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col"
                >
                    <Card className="flex-1 flex flex-col justify-center mb-6 glass border-0 shadow-lg shadow-primary/5">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl leading-relaxed font-bold">
                                {currentQuestion.content}
                            </CardTitle>
                        </CardHeader>
                        {currentQuestion.image_url && (
                            <div className="px-6 pb-6 relative aspect-video">
                                <Image src={currentQuestion.image_url} alt="Question" fill className="rounded-lg object-cover shadow-lg" />
                            </div>
                        )}
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
                                    className="w-full py-8 text-lg whitespace-normal h-auto text-left justify-start px-6 bg-secondary/30 border-white/5 hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all duration-300"
                                    onClick={() => handleOptionClick(option)}
                                >
                                    {option.content}
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
