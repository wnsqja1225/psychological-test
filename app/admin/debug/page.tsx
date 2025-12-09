'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DebugPage() {
    const supabase = createClient()
    const [status, setStatus] = useState('Testing connection...')
    const [envInfo, setEnvInfo] = useState<any>({})
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        checkConnection()
    }, [])

    const checkConnection = async () => {
        try {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

            setEnvInfo({
                urlPresent: !!url,
                urlValue: url, // Show full URL to debug typo
                keyPresent: !!key,
                keyLength: key?.length
            })

            if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing')
            if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')

            const { data, error } = await supabase.from('tests').select('count', { count: 'exact', head: true })

            if (error) throw error

            setStatus('Connection Successful! Supabase is reachable.')
        } catch (err: any) {
            console.error(err)
            setStatus('Connection Failed')
            setError(err.message || JSON.stringify(err))
        }
    }

    return (
        <div className="p-8 space-y-4 text-white">
            <h1 className="text-2xl font-bold">Supabase Connection Debug</h1>

            <div className="p-4 bg-gray-800 rounded">
                <h2 className="font-bold mb-2">Environment Variables</h2>
                <pre>{JSON.stringify(envInfo, null, 2)}</pre>
            </div>

            <div className={`p-4 rounded ${error ? 'bg-red-900' : 'bg-green-900'}`}>
                <h2 className="font-bold mb-2">Status</h2>
                <p className="text-xl">{status}</p>
                {error && <p className="mt-2 text-red-300">{error}</p>}
            </div>
        </div>
    )
}
