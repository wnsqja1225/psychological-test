'use client'

import dynamic from 'next/dynamic'

const TestEditor = dynamic(() => import('@/components/admin/test-editor').then(mod => mod.TestEditor), {
    ssr: false,
    loading: () => <div className="p-8 text-center">Loading Editor...</div>
})

export default function CreateTestPage() {
    return <TestEditor mode="create" />
}
