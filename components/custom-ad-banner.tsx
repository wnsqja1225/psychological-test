'use client'

import { ExternalLink, ShoppingBag } from 'lucide-react'

export function CustomAdBanner() {
    return (
        <a
            href="https://smartstore.naver.com/soyoulife"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full min-h-[250px] bg-gradient-to-br from-[#03C75A] to-[#02b04e] rounded-xl overflow-hidden relative group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
        >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <ShoppingBag className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-2 drop-shadow-md">소유라이프</h3>
                <p className="text-white/90 font-medium mb-6 drop-shadow-sm">
                    당신의 일상을 특별하게 만드는 아이템<br />
                    지금 바로 구경하러 가기
                </p>

                <div className="px-6 py-2 bg-white text-[#03C75A] rounded-full font-bold text-sm flex items-center gap-2 shadow-sm group-hover:bg-white/90 transition-colors">
                    스마트스토어 방문하기 <ExternalLink className="w-3 h-3" />
                </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </a>
    )
}
