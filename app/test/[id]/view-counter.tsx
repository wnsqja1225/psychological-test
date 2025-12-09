'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export function ViewCounter({ testId }: { testId: string }) {
    const supabase = createClient()
    useEffect(() => {
        const increment = async () => {
            await supabase.rpc('increment_view_count', { test_id: testId })
        }
        increment()
    }, [testId])

    return null
}
