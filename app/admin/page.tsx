'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Trash2, Copy, Edit, LayoutDashboard, ArrowUpRight } from 'lucide-react'
import { DashboardChart } from '@/components/admin/dashboard-chart'

export default function AdminDashboard() {
    const supabase = createClient()
    const [tests, setTests] = useState<any[]>([])
    const [resultsData, setResultsData] = useState<any[]>([])
    const [selectedTests, setSelectedTests] = useState<string[]>([])

    useEffect(() => {
        fetchTests()
        fetchResults()
    }, [])

    const fetchTests = async () => {
        const { data, error } = await supabase.from('tests').select('*').order('created_at', { ascending: false })
        if (data) setTests(data)
    }

    const fetchResults = async () => {
        const { data, error } = await supabase.from('results').select('created_at')
        if (data) setResultsData(data)
    }

    const deleteTest = async (id: string) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            await supabase.from('tests').delete().eq('id', id)
            fetchTests()
            setSelectedTests(prev => prev.filter(tid => tid !== id))
        }
    }

    const deleteSelectedTests = async () => {
        if (selectedTests.length === 0) return
        if (confirm(`선택한 ${selectedTests.length}개의 테스트를 삭제하시겠습니까?`)) {
            await supabase.from('tests').delete().in('id', selectedTests)
            fetchTests()
            setSelectedTests([])
        }
    }

    const toggleSelection = (id: string) => {
        setSelectedTests(prev =>
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedTests.length === tests.length) {
            setSelectedTests([])
        } else {
            setSelectedTests(tests.map(t => t.id))
        }
    }

    const duplicateTest = async (test: any) => {
        if (!confirm(`'${test.title}' 테스트를 복제하시겠습니까?`)) return

        // 1. Create new test
        const { data: newTest, error: testError } = await supabase
            .from('tests')
            .insert({
                title: `${test.title} (복사본)`,
                description: test.description,
                thumbnail_url: test.thumbnail_url,
                type: test.type,
                theme_color: test.theme_color
            })
            .select()
            .single()

        if (testError || !newTest) {
            alert('테스트 복제 실패')
            return
        }

        // 2. Fetch original questions with options
        const { data: questions } = await supabase
            .from('questions')
            .select('*, options(*)')
            .eq('test_id', test.id)

        if (questions) {
            for (const q of questions) {
                // 3. Insert question
                const { data: newQ } = await supabase
                    .from('questions')
                    .insert({
                        test_id: newTest.id,
                        content: q.content,
                        image_url: q.image_url,
                        order_index: q.order_index
                    })
                    .select()
                    .single()

                if (newQ && q.options) {
                    // 4. Insert options
                    const newOptions = q.options.map((o: any) => ({
                        question_id: newQ.id,
                        content: o.content,
                        score_weight: o.score_weight,
                        mbti_indicator: o.mbti_indicator,
                        order_index: o.order_index
                    }))
                    await supabase.from('options').insert(newOptions)
                }
            }
        }

        // 5. Fetch original results (mappings)
        const { data: results } = await supabase
            .from('results')
            .select('*')
            .eq('test_id', test.id)

        if (results) {
            const newResults = results.map((r: any) => ({
                test_id: newTest.id,
                mbti_result: r.mbti_result,
                min_score: r.min_score,
                max_score: r.max_score,
                title: r.title,
                description: r.description,
                image_url: r.image_url
            }))
            await supabase.from('results').insert(newResults)
        }

        alert('테스트가 복제되었습니다.')
        fetchTests()
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">크리에이터 스튜디오</h1>
                    <p className="text-muted-foreground mt-1">나만의 심리테스트를 만들고 관리하세요.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                <DashboardChart data={resultsData} />
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">내 테스트 목록 ({tests.length})</h2>
                    {tests.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                                {selectedTests.length === tests.length ? '전체 해제' : '전체 선택'}
                            </Button>
                            {selectedTests.length > 0 && (
                                <Button variant="destructive" size="sm" onClick={deleteSelectedTests}>
                                    <Trash2 className="mr-2 h-4 w-4" /> 선택 삭제 ({selectedTests.length})
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                <Link href="/admin/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> 새 테스트 만들기
                    </Button>
                </Link>
            </div>

            {tests.length === 0 ? (
                <Card className="border-dashed border-2 p-12 flex flex-col items-center justify-center text-center min-h-[300px] bg-muted/10">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">아직 만들어진 테스트가 없습니다</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                        첫 번째 심리테스트를 만들어보세요. 쉽고 빠르게 시작할 수 있습니다.
                    </p>
                    <Link href="/admin/create">
                        <Button size="lg">
                            테스트 만들기 시작
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tests.map((test) => (
                        <Card
                            key={test.id}
                            className={`group hover:shadow-lg transition-all duration-300 overflow-hidden border-2 ${selectedTests.includes(test.id) ? 'border-primary ring-2 ring-primary ring-offset-2' : 'hover:border-primary/50'}`}
                        >
                            <div className="aspect-video relative bg-muted">
                                {test.thumbnail_url ? (
                                    <img
                                        src={test.thumbnail_url}
                                        alt={test.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                        <LayoutDashboard className="h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                                {/* Checkbox */}
                                <div className="absolute top-2 left-2 z-10">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shadow-sm"
                                        checked={selectedTests.includes(test.id)}
                                        onChange={() => toggleSelection(test.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>

                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <Button size="icon" variant="secondary" className="h-8 w-8 shadow-sm" onClick={() => duplicateTest(test)} title="복제">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="destructive" className="h-8 w-8 shadow-sm" onClick={() => deleteTest(test.id)} title="삭제">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardHeader className="pb-3">
                                <CardTitle className="truncate text-lg">{test.title}</CardTitle>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {test.description || "설명 없음"}
                                </p>
                            </CardHeader>
                            <CardFooter className="pt-0">
                                <div className="flex gap-2 w-full">
                                    <Link href={`/admin/edit/${test.id}`} className="flex-1">
                                        <Button variant="default" className="w-full bg-primary/90 hover:bg-primary">
                                            <Edit className="mr-2 h-4 w-4" /> 편집
                                        </Button>
                                    </Link>
                                    <Link href={`/test/${test.id}`} target="_blank">
                                        <Button variant="outline" size="icon" title="미리보기">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
