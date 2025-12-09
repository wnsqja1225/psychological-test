'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Save, Check, LayoutDashboard, ListTodo, Map, RotateCcw, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import { cn } from '@/lib/utils'

const MBTI_TYPES = [
    'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
    'ISTP', 'ISFP', 'INFP', 'INTP',
    'ESTP', 'ESFP', 'ENFP', 'ENTP',
    'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
]

const THEME_COLORS = [
    { name: 'Purple (Default)', value: '#8b5cf6' },
    { name: 'Christmas Red', value: '#ef4444' },
    { name: 'Ocean Blue', value: '#3b82f6' },
    { name: 'Forest Green', value: '#22c55e' },
    { name: 'Romantic Pink', value: '#ec4899' },
    { name: 'Midnight Black', value: '#0f172a' },
]

interface TestEditorProps {
    initialData?: any
    mode: 'create' | 'edit'
}

export function TestEditor({ initialData, mode }: TestEditorProps) {
    const supabase = createClient()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("basic")
    const [loading, setLoading] = useState(false)

    // 1. Basic Info State
    const [title, setTitle] = useState(initialData?.title || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || '')
    const [themeColor, setThemeColor] = useState(initialData?.theme_color || '#8b5cf6')
    const [testType, setTestType] = useState<'mbti' | 'score'>(initialData?.type || 'mbti')

    // 2. Questions State
    const [questions, setQuestions] = useState<any[]>(initialData?.questions || [])

    // Initialize template if empty and creating
    useEffect(() => {
        if (mode === 'create' && questions.length === 0) {
            const template: any[] = []
            const axes = [
                { label: 'E vs I', options: ['E', 'I'] },
                { label: 'S vs N', options: ['S', 'N'] },
                { label: 'T vs F', options: ['T', 'F'] },
                { label: 'J vs P', options: ['J', 'P'] },
            ]
            axes.forEach(axis => {
                for (let i = 0; i < 3; i++) {
                    template.push({
                        content: '',
                        placeholder: `질문 (${axis.label} 관련 ${i + 1}/3)`,
                        options: [
                            { content: '', mbti_indicator: axis.options[0], score_weight: 0 },
                            { content: '', mbti_indicator: axis.options[1], score_weight: 0 }
                        ]
                    })
                }
            })
            setQuestions(template)
        }
    }, [mode])

    // 3. Results State
    const [results, setResults] = useState<any[]>(initialData?.results || [])

    // Initialize results template
    useEffect(() => {
        if (mode === 'create' && results.length === 0) {
            setResults(MBTI_TYPES.map(type => ({
                mbti_result: type,
                title: '',
                description: '',
                image_url: ''
            })))
        }
    }, [mode])

    const [selectedResultIndex, setSelectedResultIndex] = useState(0)

    // --- Handlers ---
    const updateQuestion = (index: number, field: string, value: any) => {
        const newQuestions = [...questions]
        newQuestions[index] = { ...newQuestions[index], [field]: value }
        setQuestions(newQuestions)
    }

    const updateOption = (qIndex: number, oIndex: number, field: string, value: any) => {
        const newQuestions = [...questions]
        newQuestions[qIndex].options[oIndex] = { ...newQuestions[qIndex].options[oIndex], [field]: value }
        setQuestions(newQuestions)
    }

    const updateResult = (index: number, field: string, value: any) => {
        const newResults = [...results]
        newResults[index] = { ...newResults[index], [field]: value }
        setResults(newResults)
    }

    // --- Save Handler ---
    const handleSave = async () => {
        if (!title) {
            alert('제목을 입력해주세요.')
            setActiveTab("basic")
            return
        }

        setLoading(true)

        try {
            let testId = initialData?.id

            // 1. Upsert Test
            const testPayload = {
                title,
                description,
                thumbnail_url: thumbnailUrl,
                type: testType,
                theme_color: themeColor
            }

            if (mode === 'create') {
                const { data, error } = await supabase.from('tests').insert(testPayload).select().single()
                if (error) throw error
                testId = data.id
            } else {
                const { error } = await supabase.from('tests').update(testPayload).eq('id', testId)
                if (error) throw error
            }

            // 2. Handle Questions (Delete all and re-insert for simplicity in this version, or upsert)
            // For simplicity and robustness, we'll delete existing questions/options and re-insert.
            // In a production app with huge data, we'd diff them.
            if (mode === 'edit') {
                await supabase.from('options').delete().in('question_id', questions.filter(q => q.id).map(q => q.id))
                await supabase.from('questions').delete().eq('test_id', testId)
            }

            // Insert Questions
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i]
                if (!q.content.trim()) continue

                const { data: qData, error: qError } = await supabase
                    .from('questions')
                    .insert({ test_id: testId, content: q.content, image_url: q.image_url, order_index: i })
                    .select()
                    .single()

                if (qError) throw qError

                const optionsToInsert = q.options.map((o: any, idx: number) => ({
                    question_id: qData.id,
                    content: o.content,
                    score_weight: o.score_weight || 0,
                    mbti_indicator: o.mbti_indicator,
                    order_index: idx
                }))

                const { error: oError } = await supabase.from('options').insert(optionsToInsert)
                if (oError) throw oError
            }

            // 3. Handle Results
            if (mode === 'edit') {
                await supabase.from('results').delete().eq('test_id', testId)
            }

            const resultsToInsert = results
                .filter(r => r.title.trim() !== '')
                .map(r => ({
                    test_id: testId,
                    mbti_result: r.mbti_result,
                    title: r.title,
                    description: r.description,
                    image_url: r.image_url,
                    min_score: r.min_score || 0,
                    max_score: r.max_score || 0
                }))

            if (resultsToInsert.length > 0) {
                const { error: rError } = await supabase.from('results').insert(resultsToInsert)
                if (rError) throw rError
            }

            alert('저장되었습니다!')
            router.push('/admin')
            router.refresh()

        } catch (error: any) {
            console.error('Error saving:', error)
            alert(`저장 실패: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Toolbar */}
            <div className="flex justify-between items-center p-4 border-b bg-background/95 backdrop-blur shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">
                        {mode === 'create' ? '새 테스트 만들기' : '테스트 수정'}
                    </h1>
                </div>
                <Button onClick={handleSave} disabled={loading} className="min-w-[100px]">
                    {loading ? '저장 중...' : (
                        <>
                            <Save className="mr-2 h-4 w-4" /> 저장
                        </>
                    )}
                </Button>
            </div>

            {/* Custom Tabs */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="shrink-0 border-b bg-muted/30">
                    <div className="container max-w-5xl">
                        <div className="flex h-12 w-full justify-start gap-8">
                            <button
                                onClick={() => setActiveTab("basic")}
                                className={cn(
                                    "flex items-center px-4 border-b-2 transition-colors",
                                    activeTab === "basic" ? "border-primary font-bold text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <LayoutDashboard className="mr-2 h-4 w-4" /> 기본 정보
                            </button>
                            <button
                                onClick={() => setActiveTab("questions")}
                                className={cn(
                                    "flex items-center px-4 border-b-2 transition-colors",
                                    activeTab === "questions" ? "border-primary font-bold text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <ListTodo className="mr-2 h-4 w-4" /> 질문 관리
                            </button>
                            <button
                                onClick={() => setActiveTab("results")}
                                className={cn(
                                    "flex items-center px-4 border-b-2 transition-colors",
                                    activeTab === "results" ? "border-primary font-bold text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Map className="mr-2 h-4 w-4" /> 결과 매핑
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-muted/10">
                    <div className="container max-w-5xl py-8">
                        {/* Tab 1: Basic Info */}
                        {activeTab === "basic" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>기본 설정</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid gap-2">
                                            <label className="font-medium">테스트 제목</label>
                                            <Input
                                                placeholder="예: 내 성격으로 알아보는 크리스마스 캐릭터"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="text-lg"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="font-medium">설명</label>
                                            <Textarea
                                                placeholder="테스트에 대한 설명을 입력하세요."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="font-medium">썸네일</label>
                                            <ImageUpload value={thumbnailUrl} onChange={setThumbnailUrl} />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="font-medium">테마 색상</label>
                                            <div className="flex flex-wrap gap-3">
                                                {THEME_COLORS.map(color => (
                                                    <button
                                                        key={color.value}
                                                        className={cn(
                                                            "w-10 h-10 rounded-full border-2 transition-all shadow-sm",
                                                            themeColor === color.value ? "border-primary scale-110 ring-2 ring-primary ring-offset-2" : "border-transparent hover:scale-105"
                                                        )}
                                                        style={{ backgroundColor: color.value }}
                                                        onClick={() => setThemeColor(color.value)}
                                                        title={color.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Tab 2: Questions */}
                        {activeTab === "questions" && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>질문 목록 ({questions.length})</CardTitle>
                                        <Button variant="outline" size="sm" onClick={() => {
                                            setQuestions([...questions, {
                                                content: '',
                                                placeholder: '새로운 질문',
                                                options: [
                                                    { content: '', mbti_indicator: 'E', score_weight: 0 },
                                                    { content: '', mbti_indicator: 'I', score_weight: 0 }
                                                ]
                                            }])
                                        }}>
                                            <Plus className="mr-2 h-4 w-4" /> 질문 추가
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {questions.map((q, index) => (
                                            <div key={index} className="flex gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                                                <div className="mt-3 text-muted-foreground cursor-move">
                                                    ::
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex gap-2">
                                                        <span className="flex items-center justify-center w-8 h-10 font-bold text-muted-foreground bg-muted rounded">
                                                            Q{index + 1}
                                                        </span>
                                                        <div className="flex-1 space-y-2">
                                                            <Input
                                                                placeholder={q.placeholder || "질문을 입력하세요"}
                                                                value={q.content}
                                                                onChange={(e) => updateQuestion(index, 'content', e.target.value)}
                                                                className="font-medium"
                                                            />
                                                            <ImageUpload
                                                                value={q.image_url || ''}
                                                                onChange={(url) => updateQuestion(index, 'image_url', url)}
                                                                placeholder="질문 이미지 (선택)"
                                                            />
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                                                            const newQ = [...questions]
                                                            newQ.splice(index, 1)
                                                            setQuestions(newQ)
                                                        }}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                                                        {q.options.map((opt: any, oIndex: number) => (
                                                            <div key={oIndex} className="space-y-2">
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        placeholder={`선택지 ${oIndex + 1}`}
                                                                        value={opt.content}
                                                                        onChange={(e) => updateOption(index, oIndex, 'content', e.target.value)}
                                                                    />
                                                                    <div className="flex items-center px-3 bg-secondary rounded font-bold min-w-[40px] justify-center border text-xs text-muted-foreground" title="성향 지표">
                                                                        {opt.mbti_indicator}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Tab 3: Results */}
                        {activeTab === "results" && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold">결과 매핑</h2>
                                        <p className="text-sm text-muted-foreground">16가지 성향에 대한 결과를 작성해주세요.</p>
                                    </div>
                                    <div className="text-sm font-medium">
                                        작성 완료: <span className="text-primary">{results.filter(r => r.title.trim() !== '').length}</span> / 16
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {results.map((r, index) => {
                                        const isFilled = r.title.trim() !== ''
                                        const isSelected = selectedResultIndex === index

                                        return (
                                            <Card
                                                key={index}
                                                className={cn(
                                                    "cursor-pointer transition-all hover:shadow-md border-2 relative overflow-hidden group",
                                                    isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border hover:border-primary/50",
                                                    isFilled ? "bg-primary/5" : "bg-card"
                                                )}
                                                onClick={() => setSelectedResultIndex(index)}
                                            >
                                                {r.image_url && (
                                                    <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                                                        <img src={r.image_url} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <CardHeader className="p-4 pb-2 relative">
                                                    <div className="flex justify-between items-center">
                                                        <CardTitle className="text-lg font-bold">{r.mbti_result}</CardTitle>
                                                        {isFilled ? (
                                                            <div className="h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm">
                                                                <Check className="h-3 w-3" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center border">
                                                                <span className="text-[10px]">Empty</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-2 relative">
                                                    <p className={cn("text-sm line-clamp-2 min-h-[2.5em]", isFilled ? "text-foreground font-medium" : "text-muted-foreground italic")}>
                                                        {r.title || "결과 내용을 입력해주세요"}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>

                                {/* Editor Dialog / Area */}
                                <div className="mt-8 border-t pt-8">
                                    <Card className="border-2 shadow-lg" style={{ borderColor: themeColor }}>
                                        <CardHeader className="border-b bg-muted/20">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                                                    {results[selectedResultIndex].mbti_result}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl">결과 상세 편집</CardTitle>
                                                    <CardDescription>
                                                        {results[selectedResultIndex].mbti_result} 성향에 보여줄 내용을 작성합니다.
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6 pt-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="font-medium flex items-center gap-2">
                                                            결과 제목 <span className="text-red-500">*</span>
                                                        </label>
                                                        <Input
                                                            placeholder="예: 당신은 따뜻한 난로 같은 사람"
                                                            value={results[selectedResultIndex].title}
                                                            onChange={(e) => updateResult(selectedResultIndex, 'title', e.target.value)}
                                                            className="text-lg font-medium"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="font-medium">대표 이미지</label>
                                                        <ImageUpload
                                                            value={results[selectedResultIndex].image_url}
                                                            onChange={(url) => updateResult(selectedResultIndex, 'image_url', url)}
                                                            placeholder="결과 이미지 업로드"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="font-medium">상세 설명</label>
                                                    <Textarea
                                                        placeholder="결과에 대한 상세한 설명을 적어주세요."
                                                        className="min-h-[250px] text-base leading-relaxed p-4 resize-none"
                                                        value={results[selectedResultIndex].description}
                                                        onChange={(e) => updateResult(selectedResultIndex, 'description', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
