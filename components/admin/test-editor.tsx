import { PhonePreview } from '@/components/admin/phone-preview'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import { Plus, Trash2, Check, Image as ImageIcon, X, Save, ArrowLeft, Wand2, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"

interface TestEditorProps {
    initialData?: any
    mode: 'create' | 'edit'
}

const THEME_COLORS = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
]

const MBTI_INDICATORS = ['E', 'I', 'N', 'S', 'F', 'T', 'P', 'J']

export function TestEditor({ initialData, mode }: TestEditorProps) {
    const router = useRouter()
    const supabase = createClient()
    const [activeTab, setActiveTab] = useState("basic")
    const [title, setTitle] = useState(initialData?.title || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || '')
    const [themeColor, setThemeColor] = useState(initialData?.theme_color || '#ef4444')
    const [questions, setQuestions] = useState<any[]>(initialData?.questions || [])
    const [results, setResults] = useState<any[]>(initialData?.results || [])
    const [selectedResultIndex, setSelectedResultIndex] = useState(0)
    const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0)
    const [priority, setPriority] = useState(0)
    const [adConfig, setAdConfig] = useState(initialData?.ad_config || { imageUrl: '', linkUrl: '' })

    // Parse priority from description on load
    useEffect(() => {
        if (initialData?.description) {
            const match = initialData.description.match(/<!-- priority: (\d+) -->/)
            if (match) {
                setPriority(parseInt(match[1]))
            }
        }
    }, [initialData])

    // Initialize results if empty (for 16 MBTI types)
    useEffect(() => {
        if (results.length === 0) {
            const mbtiTypes = [
                'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
                'ISTP', 'ISFP', 'INFP', 'INTP',
                'ESTP', 'ESFP', 'ENFP', 'ENTP',
                'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
            ]
            setResults(mbtiTypes.map(type => ({
                mbti_result: type,
                title: '',
                description: '',
                image_url: ''
            })))
        }
    }, [])

    const generateTemplate = (count: 12 | 20) => {
        if (questions.length > 0 && !confirm('기존 질문이 모두 삭제되고 템플릿으로 대체됩니다. 계속하시겠습니까?')) {
            return
        }

        const newQuestions = []
        const dimensions = [
            ['E', 'I'], // Energy
            ['N', 'S'], // Information
            ['F', 'T'], // Decisions
            ['P', 'J']  // Lifestyle
        ]

        // Distribute questions evenly across dimensions
        // 12 questions: 3 per dimension
        // 20 questions: 5 per dimension
        const questionsPerDimension = count / 4

        let qIndex = 1
        for (let d = 0; d < 4; d++) {
            const [dimA, dimB] = dimensions[d]
            for (let i = 0; i < questionsPerDimension; i++) {
                newQuestions.push({
                    content: '',
                    placeholder: `[${dimA}/${dimB}] 관련 질문을 입력하세요 (${i + 1}/${questionsPerDimension})`,
                    image_url: '',
                    options: [
                        { content: '', mbti_indicator: dimA, score_weight: 1 },
                        { content: '', mbti_indicator: dimB, score_weight: 1 }
                    ]
                })
                qIndex++
            }
        }

        setQuestions(newQuestions)
        setPreviewQuestionIndex(0)
        alert(`${count}문항 MBTI 템플릿이 적용되었습니다.`)
    }

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQuestions = [...questions]
        newQuestions[index] = { ...newQuestions[index], [field]: value }
        setQuestions(newQuestions)
    }

    const updateOption = (qIndex: number, oIndex: number, field: string, value: any) => {
        const newQuestions = [...questions]
        const newOptions = [...newQuestions[qIndex].options]
        newOptions[oIndex] = { ...newOptions[oIndex], [field]: value }
        newQuestions[qIndex].options = newOptions
        setQuestions(newQuestions)
    }

    const updateResult = (index: number, field: string, value: any) => {
        const newResults = [...results]
        newResults[index] = { ...newResults[index], [field]: value }
        setResults(newResults)
    }

    const handleSave = async () => {
        if (!title.trim()) return alert('제목을 입력해주세요.')
        if (questions.length === 0) return alert('최소 1개의 질문이 필요합니다.')

        // Inject priority into description
        const cleanDescription = description.replace(/<!-- priority: \d+ -->/g, '').trim()
        const finalDescription = `${cleanDescription}\n\n<!-- priority: ${priority} -->`

        try {
            let testId = initialData?.id

            if (mode === 'create') {
                const { data, error } = await supabase.from('tests').insert({
                    title,
                    description: finalDescription,
                    thumbnail_url: thumbnailUrl,
                    theme_color: themeColor,
                    type: 'mbti',
                    ad_config: adConfig
                }).select().single()

                if (error) throw error
                testId = data.id
            } else {
                const { error } = await supabase.from('tests').update({
                    title,
                    description: finalDescription,
                    thumbnail_url: thumbnailUrl,
                    theme_color: themeColor,
                    ad_config: adConfig
                }).eq('id', testId)
                if (error) throw error

                // Delete existing related data to replace
                await supabase.from('questions').delete().eq('test_id', testId)
                await supabase.from('results').delete().eq('test_id', testId)
            }

            // Insert Questions & Options
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i]
                const { data: qData, error: qError } = await supabase.from('questions').insert({
                    test_id: testId,
                    content: q.content,
                    image_url: q.image_url,
                    order_index: i,
                    layout_type: q.layout_type || 'default',
                    text_color: q.text_color || '#000000',
                    text_position: q.text_position || { top: 10, left: 50 },
                    option_style: q.option_style || 'default',
                    layout_config: q.layout_config || {}
                }).select().single()

                if (qError) throw qError

                const optionsToInsert = q.options.map((o: any, idx: number) => ({
                    question_id: qData.id,
                    content: o.content,
                    mbti_indicator: o.mbti_indicator,
                    score_weight: o.score_weight,
                    order_index: idx
                }))

                const { error: oError } = await supabase.from('options').insert(optionsToInsert)
                if (oError) throw oError
            }

            // Insert Results
            const resultsToInsert = results.map(r => ({
                test_id: testId,
                mbti_result: r.mbti_result,
                title: r.title,
                description: r.description,
                image_url: r.image_url,
                min_score: 0,
                max_score: 0,
                layout_config: r.layout_config || {}
            }))

            const { error: rError } = await supabase.from('results').insert(resultsToInsert)
            if (rError) throw rError

            alert('저장되었습니다.')
            router.push('/admin')
            router.refresh()

        } catch (error: any) {
            console.error('Save Error:', error)
            alert(`저장 중 오류가 발생했습니다: ${error.message || JSON.stringify(error)}`)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> 뒤로가기
                </Button>
                <h1 className="text-xl font-bold">{mode === 'create' ? '새 테스트 만들기' : '테스트 수정'}</h1>
            </div>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Save className="mr-2 h-4 w-4" /> 저장하기
            </Button>


            {/* Custom Tabs */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Tab Headers */}
                <div className="border-b bg-background">
                    <div className="container max-w-6xl flex">
                        <button
                            onClick={() => setActiveTab("basic")}
                            className={cn(
                                "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === "basic" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            기본 설정
                        </button>
                        <button
                            onClick={() => setActiveTab("questions")}
                            className={cn(
                                "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === "questions" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            질문 관리
                        </button>
                        <button
                            onClick={() => setActiveTab("results")}
                            className={cn(
                                "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === "results" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            결과 관리
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-muted/10">
                    <div className="container max-w-6xl py-8">
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
                                            <ImageUpload value={thumbnailUrl} onChange={setThumbnailUrl} fit="contain" />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="font-medium">정렬 순서 (우선순위)</label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={priority}
                                                    onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                                                    className="w-24"
                                                />
                                                <span className="text-sm text-muted-foreground">높은 숫자가 먼저 표시됩니다. (예: 100 &gt; 1)</span>
                                            </div>
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

                                        <div className="grid gap-4 pt-4 border-t">
                                            <h3 className="font-bold text-lg">광고 설정</h3>
                                            <div className="grid gap-2">
                                                <label className="font-medium">광고 이미지 URL</label>
                                                <ImageUpload
                                                    value={adConfig.imageUrl}
                                                    onChange={(url) => setAdConfig({ ...adConfig, imageUrl: url })}
                                                    placeholder="광고 배너 이미지 업로드"
                                                />
                                                <div className="mt-1">
                                                    <p className="text-xs text-muted-foreground mb-1">또는 이미지 URL 직접 입력</p>
                                                    <Input
                                                        placeholder="https://example.com/banner.jpg"
                                                        value={adConfig.imageUrl}
                                                        onChange={(e) => setAdConfig({ ...adConfig, imageUrl: e.target.value })}
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="font-medium">광고 링크 URL</label>
                                                <Input
                                                    placeholder="https://example.com"
                                                    value={adConfig.linkUrl}
                                                    onChange={(e) => setAdConfig({ ...adConfig, linkUrl: e.target.value })}
                                                />
                                            </div>
                                            {/* Ad Preview */}
                                            {adConfig.imageUrl && (
                                                <div className="mt-4 p-4 border rounded-lg bg-slate-50">
                                                    <p className="text-sm font-medium mb-2 text-slate-500">배너 미리보기</p>
                                                    <div className="relative w-full aspect-[320/100] overflow-hidden rounded-md border shadow-sm">
                                                        <img
                                                            src={adConfig.imageUrl}
                                                            alt="Ad Banner"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute top-0 right-0 bg-black/20 text-white text-[10px] px-1">AD</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Tab 2: Questions */}
                        {activeTab === "questions" && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                                    {/* Left: Editor List */}
                                    <div className="lg:col-span-7 space-y-4">
                                        <div className="flex items-center justify-between mb-4 bg-card p-4 rounded-lg border shadow-sm">
                                            <div>
                                                <h2 className="text-lg font-bold">질문 목록 ({questions.length})</h2>
                                                <p className="text-sm text-muted-foreground">템플릿을 사용하여 빠르게 구성하세요.</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => generateTemplate(12)}>
                                                    <Wand2 className="mr-2 h-4 w-4 text-purple-500" /> 12문항 (약식)
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => generateTemplate(20)}>
                                                    <Wand2 className="mr-2 h-4 w-4 text-blue-500" /> 20문항 (정식)
                                                </Button>
                                                <Button size="sm" onClick={() => {
                                                    const newIndex = questions.length
                                                    setQuestions([...questions, {
                                                        content: '',
                                                        placeholder: '새로운 질문',
                                                        options: [
                                                            { content: '', mbti_indicator: 'E', score_weight: 1 },
                                                            { content: '', mbti_indicator: 'I', score_weight: 1 }
                                                        ]
                                                    }])
                                                    setPreviewQuestionIndex(newIndex)
                                                }}>
                                                    <Plus className="mr-2 h-4 w-4" /> 직접 추가
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pb-20">
                                            {questions.map((q, index) => (
                                                <div
                                                    key={index}
                                                    className={cn(
                                                        "flex gap-4 p-4 rounded-lg border bg-card transition-all",
                                                        previewQuestionIndex === index ? "ring-2 ring-primary border-primary shadow-md" : "hover:shadow-sm"
                                                    )}
                                                    onClick={() => setPreviewQuestionIndex(index)}
                                                >
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
                                                                    onFocus={() => setPreviewQuestionIndex(index)}
                                                                    className="font-medium"
                                                                />
                                                                <div className="flex flex-col gap-4">
                                                                    {/* Large Image Upload Area */}
                                                                    <div className="w-full">
                                                                        <ImageUpload
                                                                            value={q.image_url?.split('?')[0] || ''}
                                                                            onChange={(url) => {
                                                                                const currentParams = q.image_url?.split('?')[1] || ''
                                                                                const newUrl = currentParams ? `${url}?${currentParams}` : url
                                                                                updateQuestion(index, 'image_url', newUrl)
                                                                            }}
                                                                            placeholder="이미지 업로드 (클릭 또는 드래그)"
                                                                            className="w-full h-48 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-600 hover:border-slate-300"
                                                                        />
                                                                    </div>

                                                                    {/* Image Controls (Always Visible if Image Exists) */}
                                                                    {q.image_url && (
                                                                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                                                                            <div className="flex items-center justify-between">
                                                                                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                                                                    <Settings2 className="w-3 h-3" /> 이미지 상세 조정
                                                                                </label>
                                                                                <Select
                                                                                    value={q.image_url?.includes('layout=full') ? 'full' : 'default'}
                                                                                    onValueChange={(value) => {
                                                                                        const baseUrl = q.image_url?.split('?')[0] || ''
                                                                                        if (!baseUrl) return
                                                                                        const urlObj = new URL(q.image_url || '', 'http://dummy.com')
                                                                                        const params = new URLSearchParams(urlObj.search)
                                                                                        if (value === 'full') params.set('layout', 'full')
                                                                                        else params.delete('layout')
                                                                                        updateQuestion(index, 'image_url', `${baseUrl}?${params.toString()}`)
                                                                                    }}
                                                                                >
                                                                                    <SelectTrigger className="w-[120px] h-8 text-xs bg-white">
                                                                                        <SelectValue placeholder="레이아웃" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="default">기본 (박스)</SelectItem>
                                                                                        <SelectItem value="full">꽉 찬 화면</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>

                                                                            <div className="grid grid-cols-3 gap-4">
                                                                                <div className="space-y-1.5">
                                                                                    <label className="text-[10px] font-medium text-slate-500">확대/축소</label>
                                                                                    <Slider
                                                                                        defaultValue={[parseFloat(new URLSearchParams(new URL(q.image_url || '', 'http://d.com').search).get('s') || '1')]}
                                                                                        max={3} min={1} step={0.1}
                                                                                        onValueChange={(vals) => {
                                                                                            const baseUrl = q.image_url?.split('?')[0] || ''
                                                                                            const urlObj = new URL(q.image_url || '', 'http://d.com')
                                                                                            const params = new URLSearchParams(urlObj.search)
                                                                                            params.set('s', vals[0].toString())
                                                                                            updateQuestion(index, 'image_url', `${baseUrl}?${params.toString()}`)
                                                                                        }}
                                                                                        className="py-1"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <label className="text-[10px] font-medium text-slate-500">가로 위치 (X)</label>
                                                                                    <Slider
                                                                                        defaultValue={[parseFloat(new URLSearchParams(new URL(q.image_url || '', 'http://d.com').search).get('x') || '50')]}
                                                                                        max={100} min={0} step={1}
                                                                                        onValueChange={(vals) => {
                                                                                            const baseUrl = q.image_url?.split('?')[0] || ''
                                                                                            const urlObj = new URL(q.image_url || '', 'http://d.com')
                                                                                            const params = new URLSearchParams(urlObj.search)
                                                                                            params.set('x', vals[0].toString())
                                                                                            updateQuestion(index, 'image_url', `${baseUrl}?${params.toString()}`)
                                                                                        }}
                                                                                        className="py-1"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <label className="text-[10px] font-medium text-slate-500">세로 위치 (Y)</label>
                                                                                    <Slider
                                                                                        defaultValue={[parseFloat(new URLSearchParams(new URL(q.image_url || '', 'http://d.com').search).get('y') || '50')]}
                                                                                        max={100} min={0} step={1}
                                                                                        onValueChange={(vals) => {
                                                                                            const baseUrl = q.image_url?.split('?')[0] || ''
                                                                                            const urlObj = new URL(q.image_url || '', 'http://d.com')
                                                                                            const params = new URLSearchParams(urlObj.search)
                                                                                            params.set('y', vals[0].toString())
                                                                                            updateQuestion(index, 'image_url', `${baseUrl}?${params.toString()}`)
                                                                                        }}
                                                                                        className="py-1"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="text-destructive absolute top-4 right-4" onClick={(e) => {
                                                                e.stopPropagation()
                                                                const newQ = [...questions]
                                                                newQ.splice(index, 1)
                                                                setQuestions(newQ)
                                                                if (previewQuestionIndex >= newQ.length) {
                                                                    setPreviewQuestionIndex(Math.max(0, newQ.length - 1))
                                                                }
                                                            }}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        {/* Advanced Layout & Text Controls (Available for ALL layouts) */}
                                                        <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 space-y-4 shadow-sm">
                                                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                                <label className="text-sm font-bold flex items-center gap-2 text-slate-800">
                                                                    <Wand2 className="w-4 h-4 text-indigo-500" /> 디자인 설정
                                                                </label>
                                                                <div className="flex gap-2">
                                                                    <select
                                                                        className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 text-black"
                                                                        value={q.layout_type || 'default'}
                                                                        onChange={(e) => updateQuestion(index, 'layout_type', e.target.value)}
                                                                    >
                                                                        <option value="default" className="text-black">기본 (박스형)</option>
                                                                        <option value="fullscreen" className="text-black">전체 화면 (몰입형)</option>
                                                                        <option value="chat" className="text-black">채팅형 (메신저)</option>
                                                                        <option value="swipe" className="text-black">스와이프 (틴더)</option>
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium text-slate-500">텍스트 색상</label>
                                                                    <div className="flex gap-2">
                                                                        <input
                                                                            type="color"
                                                                            value={q.text_color || '#000000'}
                                                                            onChange={(e) => updateQuestion(index, 'text_color', e.target.value)}
                                                                            className="w-8 h-8 rounded cursor-pointer border border-slate-200 p-0.5"
                                                                        />
                                                                        <Input
                                                                            value={q.text_color || '#000000'}
                                                                            onChange={(e) => updateQuestion(index, 'text_color', e.target.value)}
                                                                            className="h-8 text-xs font-mono"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium text-slate-500">선택지 스타일</label>
                                                                    <select
                                                                        className="w-full h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-black"
                                                                        value={q.option_style || 'default'}
                                                                        onChange={(e) => updateQuestion(index, 'option_style', e.target.value)}
                                                                    >
                                                                        <option value="default" className="text-black">기본 (흰색)</option>
                                                                        <option value="glass" className="text-black">글래스 (반투명)</option>
                                                                        <option value="dark" className="text-black">다크 (검정)</option>
                                                                        <option value="outline" className="text-black">아웃라인</option>
                                                                    </select>
                                                                </div>

                                                                {/* Font Size Control (New) */}
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium text-slate-500">폰트 크기</label>
                                                                    <select
                                                                        className="w-full h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-black"
                                                                        value={q.layout_config?.fontSize || 'medium'}
                                                                        onChange={(e) => {
                                                                            const newConfig = { ...(q.layout_config || {}), fontSize: e.target.value }
                                                                            updateQuestion(index, 'layout_config', newConfig)
                                                                        }}
                                                                    >
                                                                        <option value="small" className="text-black">작게</option>
                                                                        <option value="medium" className="text-black">보통</option>
                                                                        <option value="large" className="text-black">크게</option>
                                                                        <option value="xlarge" className="text-black">아주 크게</option>
                                                                    </select>
                                                                </div>

                                                                <div className="col-span-2 space-y-2">
                                                                    <label className="text-xs font-medium text-slate-500">텍스트 세로 위치 ({q.text_position?.top || 15}%)</label>
                                                                    <Slider
                                                                        defaultValue={[q.text_position?.top || 15]}
                                                                        max={90}
                                                                        min={5}
                                                                        step={1}
                                                                        onValueChange={(vals) => {
                                                                            updateQuestion(index, 'text_position', { ...q.text_position, top: vals[0] })
                                                                        }}
                                                                        className="py-1"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {
                                                            q.layout_type === 'chat' && (
                                                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                                                    <div className="space-y-2">
                                                                        <label className="text-xs text-muted-foreground">발신자 이름</label>
                                                                        <Input
                                                                            placeholder="예: AI, 썸남, 김대리"
                                                                            value={q.layout_config?.senderName || ''}
                                                                            onChange={(e) => updateQuestion(index, 'layout_config', { ...q.layout_config, senderName: e.target.value })}
                                                                            className="h-8 text-xs"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-xs text-muted-foreground">답변 딜레이 (ms)</label>
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="1000"
                                                                            value={q.layout_config?.delay || 1000}
                                                                            onChange={(e) => updateQuestion(index, 'layout_config', { ...q.layout_config, delay: parseInt(e.target.value) })}
                                                                            className="h-8 text-xs"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )
                                                        }

                                                        {
                                                            q.layout_type === 'swipe' && (
                                                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                                                    <div className="space-y-2">
                                                                        <label className="text-xs text-muted-foreground">왼쪽 라벨 (Nope)</label>
                                                                        <Input
                                                                            placeholder="아니오, 별로"
                                                                            value={q.layout_config?.swipeLeftLabel || 'Nope'}
                                                                            onChange={(e) => updateQuestion(index, 'layout_config', { ...q.layout_config, swipeLeftLabel: e.target.value })}
                                                                            className="h-8 text-xs"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-xs text-muted-foreground">오른쪽 라벨 (Like)</label>
                                                                        <Input
                                                                            placeholder="네, 좋아"
                                                                            value={q.layout_config?.swipeRightLabel || 'Like'}
                                                                            onChange={(e) => updateQuestion(index, 'layout_config', { ...q.layout_config, swipeRightLabel: e.target.value })}
                                                                            className="h-8 text-xs"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )
                                                        }

                                                        {/* Options Editor */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                                                            {q.options.map((opt: any, oIndex: number) => (
                                                                <div key={oIndex} className="space-y-2">
                                                                    <div className="flex gap-2">
                                                                        <Input
                                                                            placeholder={`선택지 ${oIndex + 1}`}
                                                                            value={opt.content}
                                                                            onChange={(e) => updateOption(index, oIndex, 'content', e.target.value)}
                                                                            onFocus={() => setPreviewQuestionIndex(index)}
                                                                            className="flex-1"
                                                                        />
                                                                        <select
                                                                            className="h-10 rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-[80px]"
                                                                            style={{ backgroundColor: 'white', color: 'black' }}
                                                                            value={opt.mbti_indicator}
                                                                            onChange={(e) => updateOption(index, oIndex, 'mbti_indicator', e.target.value)}
                                                                        >
                                                                            {MBTI_INDICATORS.map(ind => (
                                                                                <option key={ind} value={ind} style={{ backgroundColor: 'white', color: 'black' }}>{ind}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Preview (Sticky) */}
                                    <div className="hidden lg:block lg:col-span-5">
                                        <div className="sticky top-8">
                                            <div className="text-center mb-4">
                                                <h3 className="font-bold text-muted-foreground">실시간 미리보기</h3>
                                                <p className="text-xs text-muted-foreground mt-1">이미지를 드래그하여 위치를 조정할 수 있습니다.</p>
                                            </div>
                                            <PhonePreview
                                                question={questions[previewQuestionIndex] || {}}
                                                themeColor={themeColor}
                                                totalQuestions={questions.length}
                                                currentIndex={previewQuestionIndex}
                                                onUpdate={(field, value) => updateQuestion(previewQuestionIndex, field, value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Results */}
                        {activeTab === "results" && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                                    {/* Left: Result List & Editor */}
                                    <div className="lg:col-span-7 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-lg font-bold">결과 매핑</h2>
                                                <p className="text-sm text-muted-foreground">16가지 성향에 대한 결과를 작성해주세요.</p>
                                            </div>
                                            <div className="text-sm font-medium">
                                                작성 완료: <span className="text-primary">{results.filter(r => r.title.trim() !== '').length}</span> / 16
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-3 mb-6">
                                            {results.map((r, index) => {
                                                const isFilled = r.title.trim() !== ''
                                                const isSelected = selectedResultIndex === index

                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => setSelectedResultIndex(index)}
                                                        className={cn(
                                                            "flex flex-col items-center justify-center p-3 rounded-lg border transition-all relative overflow-hidden aspect-square",
                                                            isSelected ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-1" : "border-border hover:bg-muted",
                                                            isFilled && !isSelected && "bg-green-50/50 border-green-200"
                                                        )}
                                                    >
                                                        <span className={cn("font-bold z-10", isSelected ? "text-primary text-base" : "text-muted-foreground text-sm")}>
                                                            {r.mbti_result}
                                                        </span>
                                                        {isFilled && (
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                                                <Check className="w-8 h-8 text-green-500" />
                                                            </div>
                                                        )}
                                                        {!isFilled && !isSelected && (
                                                            <div className="w-2 h-2 rounded-full bg-slate-300 mt-1" />
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        <Card className="border-2 shadow-lg" style={{ borderColor: themeColor }}>
                                            <CardHeader className="border-b bg-muted/20 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                                                        {results[selectedResultIndex].mbti_result}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">결과 상세 편집</CardTitle>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-6 pt-6">
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
                                                            placeholder="결과 이미지 업로드 (9:16 비율 권장)"
                                                            className="h-96"
                                                            aspect={9 / 16}
                                                            fit="contain"
                                                        />

                                                        {/* Image Layout Controls */}
                                                        {results[selectedResultIndex].image_url ? (
                                                            <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 space-y-4 mt-2">
                                                                <label className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                                                    <Settings2 className="w-4 h-4" /> 이미지 상세 조정
                                                                </label>

                                                                <div className="space-y-1">
                                                                    <div className="flex justify-between text-xs text-slate-700 font-medium">
                                                                        <span>확대/축소</span>
                                                                        <span>{results[selectedResultIndex].layout_config?.zoom || 100}%</span>
                                                                    </div>
                                                                    <Slider
                                                                        value={[results[selectedResultIndex].layout_config?.zoom || 100]}
                                                                        min={100}
                                                                        max={200}
                                                                        step={1}
                                                                        onValueChange={([val]) => {
                                                                            const currentConfig = results[selectedResultIndex].layout_config || {}
                                                                            updateResult(selectedResultIndex, 'layout_config', { ...currentConfig, zoom: val })
                                                                        }}
                                                                        className="cursor-pointer"
                                                                    />
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <div className="flex justify-between text-xs text-slate-700 font-medium">
                                                                        <span>가로 위치 (X)</span>
                                                                        <span>{results[selectedResultIndex].layout_config?.x || 0}%</span>
                                                                    </div>
                                                                    <Slider
                                                                        value={[results[selectedResultIndex].layout_config?.x || 0]}
                                                                        min={-50}
                                                                        max={50}
                                                                        step={1}
                                                                        onValueChange={([val]) => {
                                                                            const currentConfig = results[selectedResultIndex].layout_config || {}
                                                                            updateResult(selectedResultIndex, 'layout_config', { ...currentConfig, x: val })
                                                                        }}
                                                                        className="cursor-pointer"
                                                                    />
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <div className="flex justify-between text-xs text-slate-700 font-medium">
                                                                        <span>세로 위치 (Y)</span>
                                                                        <span>{results[selectedResultIndex].layout_config?.y || 0}%</span>
                                                                    </div>
                                                                    <Slider
                                                                        value={[results[selectedResultIndex].layout_config?.y || 0]}
                                                                        min={-50}
                                                                        max={50}
                                                                        step={1}
                                                                        onValueChange={([val]) => {
                                                                            const currentConfig = results[selectedResultIndex].layout_config || {}
                                                                            updateResult(selectedResultIndex, 'layout_config', { ...currentConfig, y: val })
                                                                        }}
                                                                        className="cursor-pointer"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-sm text-muted-foreground">
                                                                이미지를 업로드하면 상세 조정 옵션이 나타납니다.
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="font-medium">폰트 크기</label>
                                                        <Select
                                                            value={results[selectedResultIndex].layout_config?.fontSize || 'medium'}
                                                            onValueChange={(value) => {
                                                                const currentConfig = results[selectedResultIndex].layout_config || {}
                                                                updateResult(selectedResultIndex, 'layout_config', { ...currentConfig, fontSize: value })
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="폰트 크기 선택" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="small">작게</SelectItem>
                                                                <SelectItem value="medium">보통</SelectItem>
                                                                <SelectItem value="large">크게</SelectItem>
                                                                <SelectItem value="xlarge">아주 크게</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="font-medium">상세 설명</label>
                                                        <Textarea
                                                            placeholder="결과에 대한 상세한 설명을 적어주세요."
                                                            className="min-h-[200px] text-base leading-relaxed p-4 resize-none"
                                                            value={results[selectedResultIndex].description}
                                                            onChange={(e) => updateResult(selectedResultIndex, 'description', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Right: Preview (Sticky) */}
                                    <div className="hidden lg:block lg:col-span-5">
                                        <div className="sticky top-8">
                                            <div className="text-center mb-4">
                                                <h3 className="font-bold text-muted-foreground">결과 미리보기</h3>
                                            </div>
                                            <PhonePreview
                                                result={results[selectedResultIndex]}
                                                themeColor={themeColor}
                                                mode="result"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}
