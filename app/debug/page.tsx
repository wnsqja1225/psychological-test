'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DebugPage() {
    const [status, setStatus] = useState('Testing...')
    const [error, setError] = useState<any>(null)

    useEffect(() => {
        testInsert()
    }, [])

    const testInsert = async () => {
        const supabase = createClient()
        try {
            const { data: test } = await supabase.from('tests').select('*').limit(1).single()
            const { data: question } = await supabase.from('questions').select('*').limit(1).single()
            const { data: result } = await supabase.from('results').select('*').limit(1).single()

            setStatus('Schema Check Complete')
            setError({ test, question, result })
        } catch (err: any) {
            setStatus('Exception')
            setError(err)
        }
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Supabase Insert Debug</h1>
            <div className="text-xl mb-2">Status: {status}</div>
            {error && (
                <pre className="bg-red-100 p-4 rounded text-red-800 overflow-auto">
                    {JSON.stringify(error, null, 2)}
                </pre>
            )}
        </div>
    )
}
