'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, LogOut, Plus, Home } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function AdminHeader() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/admin" className="flex items-center gap-2 font-bold text-lg hover:text-primary transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Admin Studio</span>
                    </Link>

                    <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                        <Link
                            href="/admin"
                            className={`hover:text-foreground transition-colors ${pathname === '/admin' ? 'text-foreground font-bold' : ''}`}
                        >
                            대시보드
                        </Link>
                        <Link
                            href="/admin/create"
                            className={`hover:text-foreground transition-colors ${pathname === '/admin/create' ? 'text-foreground font-bold' : ''}`}
                        >
                            테스트 만들기
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/" target="_blank">
                        <Button variant="ghost" size="sm" className="h-8">
                            <Home className="mr-2 h-4 w-4" />
                            사이트 홈
                        </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        로그아웃
                    </Button>
                </div>
            </div>
        </header>
    )
}
