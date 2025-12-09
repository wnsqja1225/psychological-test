'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Search, ArrowUpDown, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface Test {
    id: string
    title: string
    description: string
    thumbnail_url: string
    view_count: number
}

export default function Home() {
    const supabase = createClient()
    const [tests, setTests] = useState<Test[]>([])
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<'latest' | 'popular'>('latest')
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        fetchTests()
    }, [sort])

    const fetchTests = async () => {
        const { data, error } = await supabase.from('tests').select('*')
        if (!error) {
            setTests(data || [])
        }
    }

    const filteredTests = tests.filter(test =>
        test.title.toLowerCase().includes(search.toLowerCase())
    )

    if (!isMounted) return null

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16 text-center space-y-4"
            >
                <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
                    <Sparkles className="w-5 h-5 text-primary mr-2" />
                    <span className="text-primary font-medium text-sm">Premium Psychological Tests</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    나를 발견하는 여행
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    MBTI부터 심층 심리 분석까지, 당신의 진짜 모습을 찾아보세요.
                </p>
            </motion.header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-4 mb-12 max-w-2xl mx-auto"
            >
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="테스트 검색..."
                        className="pl-10 h-12 bg-secondary/50 border-border/50 focus:bg-secondary transition-all text-lg"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 border-border/50 bg-secondary/50 hover:bg-secondary"
                    onClick={() => setSort(sort === 'latest' ? 'popular' : 'latest')}
                    title={sort === 'latest' ? '최신순' : '인기순'}
                >
                    <ArrowUpDown className="h-5 w-5" />
                </Button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTests.map((test, index) => (
                    <motion.div
                        key={test.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link href={`/test/${test.id}`} className="block h-full group">
                            <Card className="h-full overflow-hidden glass border-0 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-primary/20">
                                {test.thumbnail_url && (
                                    <div className="aspect-video w-full overflow-hidden relative">
                                        <Image
                                            src={test.thumbnail_url}
                                            alt={test.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="line-clamp-1 text-xl group-hover:text-primary transition-colors">
                                        {test.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 text-base">
                                        {test.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="text-sm text-muted-foreground flex justify-between items-center">
                                    <span>조회수 {(test.view_count || 0).toLocaleString()}</span>
                                    <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                                        시작하기 →
                                    </span>
                                </CardFooter>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {filteredTests.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    <div className="inline-flex items-center justify-center p-6 bg-secondary/30 rounded-full mb-6">
                        <Search className="w-12 h-12 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">검색 결과가 없습니다</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        "{search}"에 대한 테스트를 찾을 수 없습니다.<br />
                        다른 키워드로 검색하거나 새로운 테스트를 만들어보세요.
                    </p>
                </motion.div>
            )}
        </div>
    )
}
