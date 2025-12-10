'use client'

import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { CustomAdBanner } from '@/components/custom-ad-banner'
import React from 'react'
import { cn } from '@/lib/utils'

interface PhonePreviewProps {
    question?: any
    result?: any
    themeColor: string
    totalQuestions?: number
    currentIndex?: number
    mode?: 'question' | 'result'
    onUpdate?: (field: string, value: any) => void
}

export function PhonePreview({ question, result, themeColor, totalQuestions = 0, currentIndex = 0, mode = 'question', onUpdate }: PhonePreviewProps) {
    const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0
    const [isDragging, setIsDragging] = React.useState(false)
    const [startPos, setStartPos] = React.useState({ x: 0, y: 0 })
    const [initialPan, setInitialPan] = React.useState({ x: 50, y: 50 })

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!onUpdate || !question?.image_url) return
        e.preventDefault()
        setIsDragging(true)
        setStartPos({ x: e.clientX, y: e.clientY })

        const urlObj = new URL(question.image_url, 'http://d.com')
        const params = new URLSearchParams(urlObj.search)
        setInitialPan({
            x: parseFloat(params.get('x') || '50'),
            y: parseFloat(params.get('y') || '50')
        })
    }

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !onUpdate) return

            const deltaX = e.clientX - startPos.x
            const deltaY = e.clientY - startPos.y

            // Increased sensitivity for better control
            const sensitivity = 0.5
            const newX = Math.min(100, Math.max(0, initialPan.x - (deltaX * sensitivity)))
            const newY = Math.min(100, Math.max(0, initialPan.y - (deltaY * sensitivity)))

            const baseUrl = question.image_url?.split('?')[0] || ''
            const urlObj = new URL(question.image_url || '', 'http://d.com')
            const params = new URLSearchParams(urlObj.search)

            // Preserve other params
            const currentS = params.get('s') || '1'

            params.set('x', newX.toFixed(0))
            params.set('y', newY.toFixed(0))
            params.set('s', currentS)

            onUpdate('image_url', `${baseUrl}?${params.toString()}`)
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, startPos, initialPan, onUpdate, question?.image_url])

    return (
        <div
            className="w-[375px] h-[812px] bg-background border-8 border-gray-900 rounded-[3rem] overflow-hidden relative shadow-2xl mx-auto transform scale-[0.85] origin-top"
        >
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-2xl z-50"></div>

            {/* Status Bar Mock */}
            <div className="h-12 w-full bg-background flex justify-between items-end px-6 pb-2 text-xs font-medium z-40 relative">
                <span>9:41</span>
                <div className="flex gap-1">
                    <div className="w-4 h-4 bg-foreground/20 rounded-sm"></div>
                    <div className="w-4 h-4 bg-foreground/20 rounded-sm"></div>
                    <div className="w-6 h-4 bg-foreground/80 rounded-sm"></div>
                </div>
            </div>

            {/* Content Area */}
            <div className="h-[calc(100%-3rem)] overflow-y-auto scrollbar-hide bg-background text-foreground" style={{ '--theme-color': themeColor } as any}>
                <div className="p-6 flex flex-col min-h-full">
                    {mode === 'question' ? (
                        <>
                            <div className="mb-6 z-10 relative">
                                <div className="flex justify-between text-xs text-muted-foreground mb-2 font-medium" style={{ color: question?.layout_type === 'fullscreen' ? 'white' : undefined, textShadow: question?.layout_type === 'fullscreen' ? '0 1px 2px rgba(0,0,0,0.5)' : undefined }}>
                                    <span>Question {currentIndex + 1}</span>
                                    <span>{totalQuestions}</span>
                                </div>
                                <Progress value={progress} className="h-1.5 bg-secondary/50" indicatorClassName="bg-[var(--theme-color)]" />
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex-1 flex flex-col h-full"
                                >
                                    {question?.layout_type === 'fullscreen' ? (
                                        // Full Screen Layout
                                        <div className="absolute inset-0 w-full h-full">
                                            {/* Background Image */}
                                            {question?.image_url ? (
                                                <div
                                                    className="absolute inset-0 w-full h-full"
                                                    onMouseDown={handleMouseDown}
                                                >
                                                    <Image
                                                        src={question.image_url}
                                                        alt="Background"
                                                        fill
                                                        className="object-cover pointer-events-none"
                                                        style={{
                                                            objectPosition: `${new URLSearchParams(new URL(question.image_url, 'http://d.com').search).get('x') || 50}% ${new URLSearchParams(new URL(question.image_url, 'http://d.com').search).get('y') || 50}%`,
                                                            transform: `scale(${new URLSearchParams(new URL(question.image_url, 'http://d.com').search).get('s') || 1})`
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-white/50">
                                                    이미지 없음
                                                </div>
                                            )}

                                            {/* Text Overlay */}
                                            <div
                                                className="absolute w-full px-6 text-center z-20"
                                                style={{
                                                    top: `${question?.text_position?.top || 15}%`,
                                                    color: question?.text_color || '#ffffff'
                                                }}
                                            >
                                                <h2 className="text-2xl font-bold leading-relaxed drop-shadow-md" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                                    {question?.content || "질문을 입력해주세요"}
                                                </h2>
                                            </div>

                                            {/* Options (Bottom Fixed) */}
                                            <div className="absolute bottom-10 left-0 w-full px-6 space-y-3 z-20">
                                                {question?.options?.map((option: any, index: number) => (
                                                    <Button
                                                        key={index}
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full py-4 text-sm whitespace-normal h-auto justify-start px-4 transition-all duration-300",
                                                            question?.option_style === 'glass'
                                                                ? "bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
                                                                : "bg-white/90 border-transparent text-black hover:bg-white"
                                                        )}
                                                    >
                                                        {option.content || `선택지 ${index + 1}`}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : question?.layout_type === 'chat' ? (
                                        // Chat Layout
                                        <div className="flex flex-col h-full bg-[#b2c7da] p-4 rounded-lg relative overflow-hidden">
                                            {/* Chat Header Mock */}
                                            <div className="absolute top-0 left-0 w-full h-12 bg-[#a9bdce] flex items-center px-4 z-10 shadow-sm">
                                                <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center mr-3">
                                                    <span className="text-xs">AI</span>
                                                </div>
                                                <span className="font-bold text-sm text-slate-700">{question?.layout_config?.senderName || '질문자'}</span>
                                            </div>

                                            <div className="mt-14 flex-1 space-y-4 overflow-y-auto pb-20">
                                                {/* Date Divider */}
                                                <div className="flex justify-center">
                                                    <span className="text-[10px] bg-black/10 text-white px-2 py-1 rounded-full">
                                                        {new Date().toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {/* Question Bubble */}
                                                <div className="flex gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-white flex-shrink-0 overflow-hidden">
                                                        {question?.image_url ? (
                                                            <Image src={question.image_url} alt="Profile" width={32} height={32} className="object-cover w-full h-full" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px]">AI</div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-1 max-w-[70%]">
                                                        <div className="bg-white p-3 rounded-r-lg rounded-bl-lg text-sm shadow-sm text-black">
                                                            {question?.content || "질문을 입력해주세요"}
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 ml-1">오전 10:00</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Options as Reply Buttons */}
                                            <div className="absolute bottom-0 left-0 w-full bg-[#b2c7da] p-3 space-y-2 z-20">
                                                {question?.options?.map((option: any, index: number) => (
                                                    <Button
                                                        key={index}
                                                        className="w-full bg-[#ffeeb0] hover:bg-[#ffeeb0]/90 text-black border-0 text-xs py-3 h-auto justify-center shadow-sm"
                                                    >
                                                        {option.content || `답변 ${index + 1}`}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : question?.layout_type === 'swipe' ? (
                                        // Swipe Layout (Preview)
                                        <div className="flex flex-col h-full justify-center items-center relative">
                                            {/* Card Stack Effect */}
                                            <div className="absolute w-[85%] h-[60%] bg-white/50 rounded-xl transform translate-y-4 scale-95 border border-black/5"></div>
                                            <div className="absolute w-[90%] h-[60%] bg-white/80 rounded-xl transform translate-y-2 scale-98 border border-black/5"></div>

                                            {/* Main Card */}
                                            <div className="w-[95%] h-[60%] bg-white rounded-xl shadow-xl border border-black/5 flex flex-col overflow-hidden relative z-10">
                                                {question?.image_url ? (
                                                    <div className="flex-1 relative">
                                                        <Image src={question.image_url} alt="Question" fill className="object-cover" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                        <div className="absolute bottom-4 left-4 text-white font-bold text-xl drop-shadow-md">
                                                            {question?.content || "질문 내용"}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 flex items-center justify-center p-6 text-center font-bold text-lg">
                                                        {question?.content || "질문 내용"}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Swipe Labels */}
                                            <div className="absolute top-1/2 left-4 -translate-y-1/2 -rotate-12 border-4 border-red-500 text-red-500 font-bold px-2 py-1 rounded opacity-30">
                                                {question?.layout_config?.swipeLeftLabel || 'NOPE'}
                                            </div>
                                            <div className="absolute top-1/2 right-4 -translate-y-1/2 rotate-12 border-4 border-green-500 text-green-500 font-bold px-2 py-1 rounded opacity-30">
                                                {question?.layout_config?.swipeRightLabel || 'LIKE'}
                                            </div>

                                            {/* Instructions */}
                                            <div className="mt-8 text-muted-foreground text-xs animate-pulse">
                                                좌우로 스와이프하여 선택
                                            </div>
                                        </div>
                                    ) : (
                                        // Default Layout
                                        <>
                                            <Card className="flex-1 flex flex-col justify-center mb-6 glass border-0 shadow-lg shadow-primary/5">
                                                <CardHeader className="text-center p-4">
                                                    <CardTitle
                                                        className="leading-relaxed font-bold transition-all duration-300"
                                                        style={{
                                                            color: question?.text_color || undefined,
                                                            fontSize: question?.layout_config?.fontSize === 'small' ? '1rem' :
                                                                question?.layout_config?.fontSize === 'large' ? '1.5rem' :
                                                                    question?.layout_config?.fontSize === 'xlarge' ? '1.8rem' : '1.25rem'
                                                        }}
                                                    >
                                                        {question?.content || "질문을 입력해주세요"}
                                                    </CardTitle>
                                                </CardHeader>
                                                {question?.image_url ? (
                                                    <div
                                                        className={cn(
                                                            "px-4 pb-4 relative aspect-video w-full overflow-hidden",
                                                            onUpdate && "cursor-move active:cursor-grabbing hover:ring-2 hover:ring-primary/50 rounded-lg transition-all"
                                                        )}
                                                        onMouseDown={handleMouseDown}
                                                    >
                                                        <Image
                                                            src={question.image_url}
                                                            alt="Question"
                                                            fill
                                                            className="rounded-lg object-cover shadow-md pointer-events-none"
                                                            style={{
                                                                objectPosition: `${new URLSearchParams(new URL(question.image_url, 'http://d.com').search).get('x') || 50}% ${new URLSearchParams(new URL(question.image_url, 'http://d.com').search).get('y') || 50}%`,
                                                                transform: `scale(${new URLSearchParams(new URL(question.image_url, 'http://d.com').search).get('s') || 1})`
                                                            }}
                                                        />
                                                        {onUpdate && (
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 text-white text-xs font-bold pointer-events-none transition-opacity">
                                                                드래그하여 이동
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="px-4 pb-4 relative aspect-video w-full bg-secondary/20 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                                                        이미지 없음
                                                    </div>
                                                )}
                                            </Card>

                                            <div className="space-y-2 mb-8">
                                                {question?.options?.map((option: any, index: number) => (
                                                    <Button
                                                        key={index}
                                                        variant="outline"
                                                        className="w-full py-4 text-sm whitespace-normal h-auto text-left justify-start px-4 bg-secondary/30 border-white/5 hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all duration-300"
                                                    >
                                                        {option.content || `선택지 ${index + 1}`}
                                                    </Button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </>
                    ) : (
                        // Result Mode
                        <div className="flex-1 flex flex-col justify-center">
                            <Card className="mb-8 glass border-0 overflow-hidden shadow-2xl shadow-primary/10" style={{ boxShadow: `0 10px 30px -10px ${themeColor}40` }}>
                                <CardHeader className="text-center pb-2">
                                    <CardTitle className="text-2xl mb-2 font-bold">당신의 결과는?</CardTitle>
                                    <div
                                        className="text-xl font-extrabold bg-clip-text text-transparent"
                                        style={{ backgroundImage: `linear-gradient(to right, ${themeColor}, #a855f7)` }}
                                    >
                                        {result?.title || '결과 제목'}
                                    </div>
                                </CardHeader>
                                <div className="p-4 pt-0 space-y-4">
                                    {result?.image_url ? (
                                        <div className="aspect-video w-full overflow-hidden rounded-xl relative shadow-lg">
                                            <Image src={result.image_url} alt="Result" fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="aspect-video w-full bg-secondary/20 rounded-xl flex items-center justify-center text-muted-foreground text-sm">
                                            이미지 없음
                                        </div>
                                    )}
                                    <div className="bg-secondary/30 p-3 rounded-lg text-sm max-h-[150px] overflow-y-auto">
                                        {result?.description || '결과 설명이 여기에 표시됩니다.'}
                                    </div>
                                </div>
                            </Card>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" style={{ borderColor: themeColor, color: themeColor }}>
                                    다시 하기
                                </Button>
                                <Button size="sm" style={{ backgroundColor: themeColor }}>
                                    메인으로
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </div >
    )
}
