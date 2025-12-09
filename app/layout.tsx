import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
        default: "심리테스트 플랫폼",
        template: "%s | 심리테스트 플랫폼"
    },
    description: "나를 알아보는 다양한 심리테스트",
    // openGraph: {
    //     type: 'website',
    //     locale: 'ko_KR',
    //     url: '/',
    //     siteName: '심리테스트 플랫폼',
    //     images: [
    //         {
    //             url: '/api/og',
    //             width: 1200,
    //             height: 630,
    //             alt: '심리테스트 플랫폼',
    //         },
    //     ],
    // },
    twitter: {
        card: 'summary_large_image',
    },
};


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <head>
                <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
                <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}`} crossOrigin="anonymous"></script>
            </head>
            <body className="font-sans antialiased min-h-screen bg-background text-foreground" suppressHydrationWarning>
                <main className="min-h-screen bg-background">
                    {children}
                </main>
                <script
                    src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.1/kakao.min.js"
                    crossOrigin="anonymous"
                    async
                ></script>
            </body>
        </html>
    );
}
