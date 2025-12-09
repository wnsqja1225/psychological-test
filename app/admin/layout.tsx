import { AdminHeader } from '@/components/admin/admin-header'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <AdminHeader />
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}
