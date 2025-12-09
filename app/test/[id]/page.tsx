import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Image from 'next/image'
import { StartButton } from './start-button'
import { ViewCounter } from './view-counter'
import { Metadata } from 'next'

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const supabase = await createClient()
    const { data: test } = await supabase.from('tests').select('*').eq('id', id).single()

    if (!test) return { title: 'Test Not Found' }

    return {
        title: test.title,
        description: test.description,
        // openGraph: {
        //     title: test.title,
        //     description: test.description,
        //     images: [test.thumbnail_url],
        // },
    }
}

export default async function TestIntroPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    const { data: test, error } = await supabase.from('tests').select('*').eq('id', id).single()

    if (!test) return <div className="p-8 text-center">Test not found</div>

    return (
        <div className="container mx-auto px-4 py-8 max-w-md h-screen flex flex-col justify-center">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'SoftwareApplication',
                        name: test.title,
                        description: test.description,
                        applicationCategory: 'EntertainmentApplication',
                        operatingSystem: 'Web',
                        offers: {
                            '@type': 'Offer',
                            price: '0',
                            priceCurrency: 'KRW',
                        },
                    }),
                }}
            />
            <Card className="w-full">
                {test.thumbnail_url && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
                        <Image
                            src={test.thumbnail_url}
                            alt={test.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl mb-2">{test.title}</CardTitle>
                    <CardDescription className="text-base">{test.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <StartButton testId={id} />
                    <ViewCounter testId={id} />
                </CardContent>
            </Card>
        </div>
    )
}
