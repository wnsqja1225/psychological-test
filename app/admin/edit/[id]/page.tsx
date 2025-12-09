'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const TestEditor = dynamic(() => import('@/components/admin/test-editor').then(mod => mod.TestEditor), {
    ssr: false,
    loading: () => <div className="flex h-[calc(100vh-4rem)] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
})

export default function EditTestPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const supabase = createClient()
    const [testData, setTestData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            // 1. Fetch Test
            const { data: test, error: testError } = await supabase
                .from('tests')
                .select('*')
                .eq('id', id)
                .single()

            if (testError) {
                alert('테스트를 불러오는데 실패했습니다.')
                return
            }

            // 2. Fetch Questions & Options
            const { data: questions } = await supabase
                .from('questions')
                .select('*, options(*)')
                .eq('test_id', id)
                .order('order_index')

            // 3. Fetch Results
            const { data: results } = await supabase
                .from('results')
                .select('*')
                .eq('test_id', id)

            // Sort options by order_index
            const sortedQuestions = questions?.map(q => ({
                ...q,
                options: q.options.sort((a: any, b: any) => a.order_index - b.order_index)
            }))

            setTestData({
                ...test,
                questions: sortedQuestions || [],
                results: results || []
            })
            setLoading(false)
        }

        fetchData()
    }, [id])

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return <TestEditor mode="edit" initialData={testData} />
}
