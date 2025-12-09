'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface CommentsProps {
    testId: string
}

export function Comments({ testId }: CommentsProps) {
    const supabase = createClient()
    const [comments, setComments] = useState<any[]>([])
    const [newComment, setNewComment] = useState('')
    const [nickname, setNickname] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchComments()
    }, [testId])

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('test_id', testId)
            .order('created_at', { ascending: false })

        if (data) {
            setComments(data)
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        const { error } = await supabase
            .from('comments')
            .insert({
                test_id: testId,
                content: newComment,
                nickname: nickname || '익명'
            })

        if (!error) {
            setNewComment('')
            fetchComments() // Refresh list
        } else {
            alert('댓글 등록에 실패했습니다.')
        }
    }

    return (
        <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                댓글 <span className="text-primary">{comments.length}</span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-8 bg-secondary/20 p-4 rounded-xl border border-white/5">
                <div className="flex gap-2 mb-2">
                    <Input
                        placeholder="닉네임"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-1/3 bg-secondary/50 border-white/10"
                        maxLength={10}
                    />
                </div>
                <div className="flex gap-2">
                    <Textarea
                        placeholder="댓글을 남겨주세요..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 bg-secondary/50 border-white/10 min-h-[80px]"
                        maxLength={200}
                    />
                    <Button type="submit" className="h-auto bg-primary hover:bg-primary/90">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>

            {/* Comment List */}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-4 rounded-xl bg-secondary/10 border border-white/5">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.nickname}`} />
                            <AvatarFallback>{comment.nickname[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-sm">{comment.nickname}</span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && !loading && (
                    <p className="text-center text-muted-foreground py-8">첫 번째 댓글을 남겨보세요!</p>
                )}
            </div>
        </div>
    )
}
