import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import ResultClient from './result-client'
import { Suspense } from 'react'

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    { params, searchParams }: Props
): Promise<Metadata> {
    const { id } = await params
    const { mbti, score } = await searchParams
    const supabase = await createClient()

    // Fetch Test Info
    const { data: test } = await supabase
        .from('tests')
        .select('title')
        .eq('id', id)
        .single()

    // Fetch Result Info
    let query = supabase.from('results').select('*').eq('test_id', id)

    if (mbti) {
        query = query.eq('mbti_result', mbti)
    } else if (score) {
        const scoreNum = parseInt(score as string)
        query = query.lte('min_score', scoreNum).gte('max_score', scoreNum)
    }

    const { data: result } = await query.single()

    const title = result ? `${result.title} | ${test?.title || '심리테스트'}` : '심리테스트 결과'
    const description = result?.description || '나의 심리테스트 결과를 확인해보세요!'
    const imageUrl = result?.image_url || '/og-image.png'

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [imageUrl],
        },
    }
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <ResultClient />
        </Suspense>
    )
}
