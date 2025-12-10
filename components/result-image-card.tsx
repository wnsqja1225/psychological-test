'use client'

import React, { forwardRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

interface ResultImageCardProps {
    testTitle: string
    resultTitle: string
    resultDescription: string
    themeColor: string
    imageUrl?: string | null
}

export const ResultImageCard = forwardRef<HTMLDivElement, ResultImageCardProps>(
    ({ testTitle, resultTitle, resultDescription, themeColor, imageUrl }, ref) => {
        return (
            <div
                ref={ref}
                className="w-[600px] bg-white p-8 rounded-3xl shadow-xl overflow-hidden relative"
                style={{
                    background: `linear-gradient(135deg, #ffffff 0%, ${themeColor}20 100%)`
                }}
            >
                {/* Decorative Elements */}
                <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 blur-3xl"
                    style={{ backgroundColor: themeColor }}
                />
                <div
                    className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-20 blur-3xl"
                    style={{ backgroundColor: themeColor }}
                />

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-black/5 text-xs font-medium text-muted-foreground mb-2">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {testTitle}
                        </div>
                        <h2
                            className="text-4xl font-black tracking-tight"
                            style={{ color: themeColor }}
                        >
                            {resultTitle}
                        </h2>
                    </div>

                    {/* Image (if available) */}
                    {imageUrl && (
                        <div className="w-full aspect-video relative rounded-xl overflow-hidden shadow-inner bg-black/5">
                            <img
                                src={imageUrl}
                                alt={resultTitle}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Description */}
                    <p className="text-lg text-gray-700 leading-relaxed font-medium px-4">
                        {resultDescription}
                    </p>

                    {/* Footer / Branding */}
                    <div className="pt-6 mt-6 border-t border-black/5 w-full flex justify-between items-center text-sm text-gray-400">
                        <span className="font-bold tracking-widest">DOPAMING</span>
                        <span>dopaming.kr</span>
                    </div>
                </div>
            </div>
        )
    }
)

ResultImageCard.displayName = 'ResultImageCard'
