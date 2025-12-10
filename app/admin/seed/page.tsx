'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface SeedOption {
    content: string
    score_weight?: number
    mbti_indicator?: string
}

interface SeedQuestion {
    content: string
    options: SeedOption[]
}

interface SeedResult {
    result_type: string
    title?: string
    description: string
    min_score?: number
    max_score?: number
}

interface SeedTest {
    title: string
    description: string
    thumbnail_url: string
    type: string
    theme_color: string
    questions: SeedQuestion[]
    results: SeedResult[]
}

export default function SeedPage() {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<string>('')
    const [error, setError] = useState<string>('')

    const supabase = createClient()

    const seedContent = async () => {
        // if (!confirm('경고: 기존의 모든 테스트 데이터가 삭제됩니다. 계속하시겠습니까?')) return

        setLoading(true)
        setStatus('기존 데이터 삭제 중...')
        setError('')

        try {
            // 1. Delete all existing tests (cascade should handle questions/results)
            const { error: deleteError } = await supabase
                .from('tests')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

            if (deleteError) throw deleteError

            setStatus('새로운 테스트 데이터 생성 중...')

            const tests: SeedTest[] = [
                {
                    title: '연애 세포 생존 테스트',
                    description: '당신의 연애 세포는 안녕한가요? 12가지 질문으로 알아보는 나의 연애 준비 상태!',
                    thumbnail_url: '/thumbnails/romance.png',
                    type: 'score',
                    theme_color: '#ec4899', // Pink
                    questions: [
                        { content: '주말에 약속이 없다면?', options: [{ content: '집에서 넷플릭스 보며 힐링', score_weight: 0 }, { content: '친구들에게 연락해 약속을 잡는다', score_weight: 5 }] },
                        { content: '길거리에서 커플을 보면?', options: [{ content: '부럽다... 나도 연애하고 싶다', score_weight: 5 }, { content: '더운데 붙어다니네...', score_weight: 0 }] },
                        { content: '소개팅 제안이 들어온다면?', options: [{ content: '일단 사진부터 본다', score_weight: 2 }, { content: '무조건 OK! 새로운 만남은 설레니까', score_weight: 5 }] },
                        { content: '마지막 연애는 언제인가요?', options: [{ content: '기억도 안 난다 (모태솔로 포함)', score_weight: 0 }, { content: '1년 이내', score_weight: 5 }] },
                        { content: '로맨스 영화를 볼 때 나는?', options: [{ content: '주인공에 빙의해서 설렌다', score_weight: 5 }, { content: '저게 말이 되나... 현실성 따진다', score_weight: 0 }] },
                        { content: '이성에게 연락이 온다면?', options: [{ content: '귀찮다.. 나중에 답장해야지', score_weight: 0 }, { content: '칼답! 대화를 이어간다', score_weight: 5 }] },
                        { content: '꾸미고 나가는 날의 기분은?', options: [{ content: '누구라도 마주치고 싶다', score_weight: 5 }, { content: '빨리 집에 가서 씻고 싶다', score_weight: 0 }] },
                        { content: '친구가 연애 상담을 해오면?', options: [{ content: '헤어져! (솔로 천국)', score_weight: 0 }, { content: '진지하게 들어주고 조언해준다', score_weight: 5 }] },
                        { content: '이상형을 만난다면?', options: [{ content: '멀리서 지켜만 본다', score_weight: 0 }, { content: '어떻게든 말을 걸어본다', score_weight: 5 }] },
                        { content: '크리스마스 계획은?', options: [{ content: '케빈과 함께 (나홀로 집에)', score_weight: 0 }, { content: '파티나 모임 참석', score_weight: 5 }] },
                        { content: '연애를 안 하는 이유는?', options: [{ content: '못 하는 게 아니라 안 하는 거다', score_weight: 0 }, { content: '만날 기회가 없어서', score_weight: 3 }] },
                        { content: '지금 당장 연애를 시작할 수 있다면?', options: [{ content: '조금 부담스럽다', score_weight: 0 }, { content: '당장 시작한다!', score_weight: 5 }] }
                    ],
                    results: [
                        { result_type: '연애 세포 사망', description: '당신의 연애 세포는 이미 화석이 되었습니다. 심폐소생술이 시급합니다!', min_score: 0, max_score: 20 },
                        { result_type: '연애 세포 동면 중', description: '연애 세포가 잠들어 있습니다. 좋은 사람을 만나면 깨어날지도?', min_score: 21, max_score: 40 },
                        { result_type: '연애 세포 활발', description: '당신은 언제든 연애할 준비가 되어 있습니다! 기회만 오면 바로 쟁취!', min_score: 41, max_score: 60 }
                    ]
                },
                {
                    title: '나와 닮은 동물 찾기',
                    description: 'MBTI 기반으로 나와 가장 닮은 동물을 찾아드립니다. (12문항)',
                    thumbnail_url: '/thumbnails/animal.png',
                    type: 'mbti',
                    theme_color: '#22c55e', // Green
                    questions: [
                        // E vs I
                        { content: '파티에서 나는?', options: [{ content: '주목받는 게 좋아! 댄스 머신', mbti_indicator: 'E' }, { content: '구석에서 조용히 칵테일 마심', mbti_indicator: 'I' }] },
                        { content: '스트레스 해소법은?', options: [{ content: '친구들 만나서 수다 떨기', mbti_indicator: 'E' }, { content: '혼자 방에서 넷플릭스 보기', mbti_indicator: 'I' }] },
                        { content: '새로운 모임에 가면?', options: [{ content: '먼저 말을 걸고 분위기를 주도한다', mbti_indicator: 'E' }, { content: '누가 말 걸어줄 때까지 기다린다', mbti_indicator: 'I' }] },
                        // S vs N
                        { content: '멍 때릴 때 나는?', options: [{ content: '오늘 저녁 뭐 먹지? (현실적)', mbti_indicator: 'S' }, { content: '좀비가 나타나면 어떻게 도망가지? (상상)', mbti_indicator: 'N' }] },
                        { content: '설명서를 볼 때', options: [{ content: '꼼꼼히 처음부터 읽는다', mbti_indicator: 'S' }, { content: '대충 그림만 보고 조립한다', mbti_indicator: 'N' }] },
                        { content: '길을 찾을 때', options: [{ content: '네비게이션의 정확한 미터 수 확인', mbti_indicator: 'S' }, { content: '큰 건물 위주로 대략적인 방향 파악', mbti_indicator: 'N' }] },
                        // T vs F
                        { content: '친구가 우울해하면', options: [{ content: '왜 우울해? 무슨 일 있어? (해결책)', mbti_indicator: 'T' }, { content: '헐 ㅠㅠ 많이 힘들었겠다 (공감)', mbti_indicator: 'F' }] },
                        { content: '나를 화나게 하는 사람은?', options: [{ content: '논리적이지 않고 떼쓰는 사람', mbti_indicator: 'T' }, { content: '예의 없고 배려 없는 사람', mbti_indicator: 'F' }] },
                        { content: '의사결정을 할 때', options: [{ content: '객관적인 사실과 데이터 중시', mbti_indicator: 'T' }, { content: '사람들의 감정과 관계 중시', mbti_indicator: 'F' }] },
                        // J vs P
                        { content: '여행 계획을 짤 때', options: [{ content: '분 단위로 엑셀 정리', mbti_indicator: 'J' }, { content: '비행기 표만 끊고 일단 출발', mbti_indicator: 'P' }] },
                        { content: '책상 위 상태는?', options: [{ content: '깔끔하게 정리정돈 되어있다', mbti_indicator: 'J' }, { content: '어디에 뭐가 있는지 나만 안다', mbti_indicator: 'P' }] },
                        { content: '마감 기한이 다가오면', options: [{ content: '미리미리 끝내놓고 여유 부림', mbti_indicator: 'J' }, { content: '닥쳐야 초인적인 힘이 나온다', mbti_indicator: 'P' }] }
                    ],
                    results: [
                        { result_type: 'ESTJ', title: '부지런한 꿀벌', description: '체계적이고 규칙을 중요시하는 당신은 꿀벌과 닮았어요.' },
                        { result_type: 'ESTP', title: '모험을 즐기는 표범', description: '스릴을 즐기고 행동력이 강한 당신은 표범과 닮았어요.' },
                        { result_type: 'ESFJ', title: '다정한 강아지', description: '사람을 좋아하고 배려심 깊은 당신은 강아지와 닮았어요.' },
                        { result_type: 'ESFP', title: '재기발랄한 돌고래', description: '분위기 메이커인 당신은 돌고래와 닮았어요.' },
                        { result_type: 'ENTJ', title: '용맹한 사자', description: '리더십이 있고 목표 지향적인 당신은 사자와 닮았어요.' },
                        { result_type: 'ENTP', title: '장난기 많은 원숭이', description: '호기심이 많고 창의적인 당신은 원숭이와 닮았어요.' },
                        { result_type: 'ENFJ', title: '정의로운 골든리트리버', description: '타인을 이끌고 영감을 주는 당신은 골든리트리버와 닮았어요.' },
                        { result_type: 'ENFP', title: '자유로운 영혼의 쿼카', description: '항상 웃고 긍정적인 당신은 쿼카와 닮았어요.' },
                        { result_type: 'ISTJ', title: '신중한 거북이', description: '책임감이 강하고 묵묵히 일하는 당신은 거북이와 닮았어요.' },
                        { result_type: 'ISTP', title: '만능 재주꾼 고양이', description: '독립적이고 관찰력이 뛰어난 당신은 고양이와 닮았어요.' },
                        { result_type: 'ISFJ', title: '온화한 사슴', description: '조용하고 헌신적인 당신은 사슴과 닮았어요.' },
                        { result_type: 'ISFP', title: '예술적인 나무늘보', description: '여유롭고 감각적인 당신은 나무늘보와 닮았어요.' },
                        { result_type: 'INTJ', title: '지혜로운 부엉이', description: '통찰력이 있고 계획적인 당신은 부엉이와 닮았어요.' },
                        { result_type: 'INTP', title: '논리적인 문어', description: '지적 호기심이 많고 분석적인 당신은 문어와 닮았어요.' },
                        { result_type: 'INFJ', title: '신비로운 유니콘', description: '이상적이고 깊은 내면을 가진 당신은 유니콘과 닮았어요.' },
                        { result_type: 'INFP', title: '꿈꾸는 토끼', description: '순수하고 상상력이 풍부한 당신은 토끼와 닮았어요.' }
                    ]
                },
                {
                    title: '조선시대 직업 테스트',
                    description: '전생에 나는 조선시대에서 어떤 직업을 가졌을까요? (12문항)',
                    thumbnail_url: '/thumbnails/joseon.png',
                    type: 'mbti',
                    theme_color: '#d97706', // Amber
                    questions: [
                        // E vs I
                        { content: '장터에 나갔을 때', options: [{ content: '사람 구경하고 흥정하는 게 재밌다', mbti_indicator: 'E' }, { content: '기가 빨려서 얼른 집에 가고 싶다', mbti_indicator: 'I' }] },
                        { content: '동네 잔치가 열리면', options: [{ content: '앞장서서 춤추고 노래한다', mbti_indicator: 'E' }, { content: '구석에서 조용히 음식만 먹는다', mbti_indicator: 'I' }] },
                        { content: '새로운 이웃이 이사 오면', options: [{ content: '먼저 가서 떡 돌리고 인사한다', mbti_indicator: 'E' }, { content: '마주칠까 봐 문을 닫는다', mbti_indicator: 'I' }] },
                        // S vs N
                        { content: '농사를 지을 때', options: [{ content: '조상님들이 하던 방식 그대로', mbti_indicator: 'S' }, { content: '새로운 농법을 시도해본다', mbti_indicator: 'N' }] },
                        { content: '밤하늘을 보며', options: [{ content: '내일 날씨가 맑겠군', mbti_indicator: 'S' }, { content: '저 별에는 누가 살까?', mbti_indicator: 'N' }] },
                        { content: '길을 가다 돌탑을 보면', options: [{ content: '누가 쌓았네', mbti_indicator: 'S' }, { content: '소원을 빌면 이루어질까?', mbti_indicator: 'N' }] },
                        // T vs F
                        { content: '친구가 억울한 일을 당하면', options: [{ content: '누가 잘못했는지 따져본다', mbti_indicator: 'T' }, { content: '같이 욕해주고 위로한다', mbti_indicator: 'F' }] },
                        { content: '상소문을 올릴 때', options: [{ content: '논리정연하게 팩트 위주로', mbti_indicator: 'T' }, { content: '임금님의 감정에 호소하며', mbti_indicator: 'F' }] },
                        { content: '흉년이 들어 힘들 때', options: [{ content: '식량을 어떻게 배분할지 계산', mbti_indicator: 'T' }, { content: '굶주린 이웃들이 불쌍해 눈물', mbti_indicator: 'F' }] },
                        // J vs P
                        { content: '과거 시험 준비를 할 때', options: [{ content: '몇 년 전부터 계획을 세워 공부', mbti_indicator: 'J' }, { content: '시험 전날 벼락치기', mbti_indicator: 'P' }] },
                        { content: '여행을 떠날 때', options: [{ content: '숙소와 경로를 미리 정한다', mbti_indicator: 'J' }, { content: '발길 닿는 대로 간다', mbti_indicator: 'P' }] },
                        { content: '방 청소는', options: [{ content: '항상 깨끗하게 유지', mbti_indicator: 'J' }, { content: '몰아서 한 번에', mbti_indicator: 'P' }] }
                    ],
                    results: [
                        { result_type: 'ENTJ', title: '카리스마 장군', description: '통솔력이 뛰어나고 대업을 이루는 장군감입니다.' },
                        { result_type: 'ENTP', title: '언변 좋은 재담꾼', description: '말재주가 뛰어나고 임기응변에 강한 재담꾼입니다.' },
                        { result_type: 'ENFJ', title: '덕망 높은 촌장', description: '마을 사람들을 이끌고 보살피는 촌장입니다.' },
                        { result_type: 'ENFP', title: '방랑 시인', description: '자유롭게 세상을 떠돌며 노래하는 시인입니다.' },
                        { result_type: 'ESTJ', title: '깐깐한 이방', description: '행정 처리가 확실하고 규칙을 지키는 이방입니다.' },
                        { result_type: 'ESTP', title: '장사 수완 좋은 보부상', description: '전국을 누비며 물건을 파는 능력 있는 보부상입니다.' },
                        { result_type: 'ESFJ', title: '인심 좋은 주막 주모', description: '사람들을 챙기고 정이 많은 주모입니다.' },
                        { result_type: 'ESFP', title: '흥 많은 사당패', description: '춤과 노래로 사람들을 즐겁게 하는 사당패입니다.' },
                        { result_type: 'INTJ', title: '천재적인 책사', description: '뒤에서 전략을 짜고 미래를 내다보는 책사입니다.' },
                        { result_type: 'INTP', title: '괴짜 발명가', description: '신기한 물건을 만들어내는 발명가입니다.' },
                        { result_type: 'INFJ', title: '신통한 무당', description: '남들이 보지 못하는 것을 보는 무당입니다.' },
                        { result_type: 'INFP', title: '낙향한 선비', description: '자연을 벗 삼아 글을 쓰는 선비입니다.' },
                        { result_type: 'ISTJ', title: '우직한 대장장이', description: '묵묵히 자신의 일을 해내는 대장장이입니다.' },
                        { result_type: 'ISTP', title: '전설의 무사', description: '말보다 행동이 앞서는 고독한 무사입니다.' },
                        { result_type: 'ISFJ', title: '충직한 내관', description: '임금님을 그림자처럼 보필하는 내관입니다.' },
                        { result_type: 'ISFP', title: '감성적인 화공', description: '아름다움을 그림으로 담아내는 화공입니다.' }
                    ]
                },
                {
                    title: '나의 멘탈 등급 테스트',
                    description: '당신의 멘탈은 유리인가요, 다이아몬드인가요? (12문항)',
                    thumbnail_url: '/thumbnails/mental.png',
                    type: 'score',
                    theme_color: '#3b82f6', // Blue
                    questions: [
                        { content: '악플을 보게 된다면?', options: [{ content: '하루 종일 기분이 나쁘다', score_weight: 0 }, { content: '관심 없어서 무시한다', score_weight: 5 }] },
                        { content: '시험을 망쳤을 때', options: [{ content: '난 안 될 놈인가 봐... 자책한다', score_weight: 0 }, { content: '다음에 잘 보면 되지! 훌훌 턴다', score_weight: 5 }] },
                        { content: '친구가 약속을 당일 파기하면?', options: [{ content: '손절각 잰다', score_weight: 2 }, { content: '오예! 집에서 쉬어야지 (긍정회로)', score_weight: 5 }] },
                        { content: '상사에게 혼났을 때', options: [{ content: '퇴사하고 싶다...', score_weight: 0 }, { content: '한 귀로 듣고 한 귀로 흘린다', score_weight: 5 }] },
                        { content: '길 가다 넘어졌을 때', options: [{ content: '쪽팔려서 죽고 싶다', score_weight: 0 }, { content: '아프다... 하고 그냥 일어난다', score_weight: 5 }] },
                        { content: '계획대로 일이 안 풀릴 때', options: [{ content: '패닉에 빠진다', score_weight: 0 }, { content: '플랜 B를 가동한다', score_weight: 5 }] },
                        { content: '누가 내 뒷담화를 했다면?', options: [{ content: '찾아가서 따진다', score_weight: 3 }, { content: '내가 잘나서 질투하나 보다', score_weight: 5 }] },
                        { content: '힘든 일이 생기면', options: [{ content: '술로 푼다', score_weight: 1 }, { content: '운동이나 취미로 푼다', score_weight: 5 }] },
                        { content: '과거의 실수가 떠오르면', options: [{ content: '이불킥하며 괴로워한다', score_weight: 0 }, { content: '그땐 그랬지 하고 넘긴다', score_weight: 5 }] },
                        { content: '새로운 도전을 앞두고', options: [{ content: '실패하면 어쩌지? 걱정부터 한다', score_weight: 0 }, { content: '재밌겠다! 설렌다', score_weight: 5 }] },
                        { content: '남들과 비교될 때', options: [{ content: '나는 왜 이럴까 우울해진다', score_weight: 0 }, { content: '나는 나, 쟤는 쟤', score_weight: 5 }] },
                        { content: '지금 행복한가요?', options: [{ content: '아니요...', score_weight: 0 }, { content: '네! 행복합니다', score_weight: 5 }] }
                    ],
                    results: [
                        { result_type: '쿠크다스 멘탈', description: '바사삭... 작은 충격에도 부서지기 쉬워요. 멘탈 관리가 필요합니다.', min_score: 0, max_score: 20 },
                        { result_type: '유리 멘탈', description: '투명하고 깨지기 쉽지만, 조심하면 괜찮아요.', min_score: 21, max_score: 35 },
                        { result_type: '강철 멘탈', description: '웬만한 일에는 끄떡없는 강인함을 가졌군요!', min_score: 36, max_score: 50 },
                        { result_type: '다이아몬드 멘탈', description: '절대 깨지지 않는 최강의 멘탈 소유자! 존경합니다.', min_score: 51, max_score: 60 }
                    ]
                },
                {
                    title: '퍼스널 컬러 성격 테스트',
                    description: '나를 색깔로 표현한다면 무슨 색일까요? (12문항)',
                    thumbnail_url: '/thumbnails/color.png',
                    type: 'mbti',
                    theme_color: '#8b5cf6', // Violet
                    questions: [
                        // E vs I
                        { content: '주말에 쉬는 방식', options: [{ content: '밖에서 에너지 발산', mbti_indicator: 'E' }, { content: '집에서 에너지 충전', mbti_indicator: 'I' }] },
                        { content: '대화할 때', options: [{ content: '말하는 게 편하다', mbti_indicator: 'E' }, { content: '듣는 게 편하다', mbti_indicator: 'I' }] },
                        { content: '친구를 사귈 때', options: [{ content: '넓고 얕게', mbti_indicator: 'E' }, { content: '좁고 깊게', mbti_indicator: 'I' }] },
                        // S vs N
                        { content: '영화를 볼 때', options: [{ content: '스토리와 연출에 집중', mbti_indicator: 'S' }, { content: '숨겨진 의미와 복선 해석', mbti_indicator: 'N' }] },
                        { content: '요리할 때', options: [{ content: '레시피 정량 준수', mbti_indicator: 'S' }, { content: '감으로 대충 넣음', mbti_indicator: 'N' }] },
                        { content: '미래에 대해', options: [{ content: '당장 내일이 중요함', mbti_indicator: 'S' }, { content: '5년 후, 10년 후를 그림', mbti_indicator: 'N' }] },
                        // T vs F
                        { content: '고민 상담 시', options: [{ content: '현실적인 조언', mbti_indicator: 'T' }, { content: '따뜻한 위로', mbti_indicator: 'F' }] },
                        { content: '화해할 때', options: [{ content: '잘못한 점을 논리적으로 따짐', mbti_indicator: 'T' }, { content: '서운했던 감정을 이야기함', mbti_indicator: 'F' }] },
                        { content: '판단을 내릴 때', options: [{ content: '머리로 생각', mbti_indicator: 'T' }, { content: '가슴이 시키는 대로', mbti_indicator: 'F' }] },
                        // J vs P
                        { content: '약속 시간', options: [{ content: '10분 전 도착', mbti_indicator: 'J' }, { content: '정각 혹은 5분 지각', mbti_indicator: 'P' }] },
                        { content: '일 처리 방식', options: [{ content: '순서대로 차근차근', mbti_indicator: 'J' }, { content: '유동적으로 그때그때', mbti_indicator: 'P' }] },
                        { content: '쇼핑할 때', options: [{ content: '살 것만 딱 산다', mbti_indicator: 'J' }, { content: '둘러보다 맘에 들면 산다', mbti_indicator: 'P' }] }
                    ],
                    results: [
                        { result_type: 'ENTJ', title: '미드나잇 블루', description: '깊고 차분하지만 강력한 리더십을 가진 색입니다.' },
                        { result_type: 'ENTP', title: '일렉트릭 블루', description: '톡톡 튀고 에너지가 넘치는 창의적인 색입니다.' },
                        { result_type: 'ENFJ', title: '웜 옐로우', description: '따뜻하고 사람들을 포용하는 밝은 색입니다.' },
                        { result_type: 'ENFP', title: '네온 오렌지', description: '어디서나 눈에 띄고 활기찬 긍정의 색입니다.' },
                        { result_type: 'ESTJ', title: '클래식 네이비', description: '단정하고 신뢰감을 주는 정석적인 색입니다.' },
                        { result_type: 'ESTP', title: '비비드 레드', description: '열정적이고 행동력이 강한 강렬한 색입니다.' },
                        { result_type: 'ESFJ', title: '파스텔 핑크', description: '사랑스럽고 배려심 깊은 부드러운 색입니다.' },
                        { result_type: 'ESFP', title: '핫 핑크', description: '화려하고 주목받기를 즐기는 인싸의 색입니다.' },
                        { result_type: 'INTJ', title: '딥 퍼플', description: '신비롭고 지적인 고귀한 색입니다.' },
                        { result_type: 'INTP', title: '슬레이트 그레이', description: '논리적이고 차분한 지성의 색입니다.' },
                        { result_type: 'INFJ', title: '라벤더', description: '신비롭고 오묘한 매력을 가진 치유의 색입니다.' },
                        { result_type: 'INFP', title: '스카이 블루', description: '맑고 순수한 꿈을 꾸는 색입니다.' },
                        { result_type: 'ISTJ', title: '포레스트 그린', description: '변함없고 우직한 자연의 색입니다.' },
                        { result_type: 'ISTP', title: '올리브 그린', description: '실용적이고 적응력이 뛰어난 색입니다.' },
                        { result_type: 'ISFJ', title: '베이지', description: '편안하고 안정감을 주는 따뜻한 색입니다.' },
                        { result_type: 'ISFP', title: '민트', description: '상쾌하고 감각적인 예술가의 색입니다.' }
                    ]
                }
            ]

            for (const test of tests) {
                // Insert Test
                const { data: testData, error: testError } = await supabase
                    .from('tests')
                    .insert({
                        title: test.title,
                        description: test.description,
                        thumbnail_url: test.thumbnail_url,
                        type: test.type,
                        theme_color: test.theme_color,
                        created_at: new Date().toISOString()
                    })
                    .select()
                    .single()

                if (testError) throw testError

                // Insert Questions
                const questionsWithId = test.questions.map((q, idx) => ({
                    test_id: testData.id,
                    content: q.content,
                    order_index: idx,
                    image_url: null
                }))

                const { data: questionsData, error: questionsError } = await supabase
                    .from('questions')
                    .insert(questionsWithId)
                    .select()

                if (questionsError) throw questionsError

                // Insert Options
                for (let i = 0; i < questionsData.length; i++) {
                    const q = questionsData[i]
                    const originalOptions = test.questions[i].options
                    const optionsWithId = originalOptions.map((opt: any, idx: number) => ({
                        question_id: q.id,
                        content: opt.content,
                        score_weight: opt.score_weight || 0,
                        mbti_indicator: opt.mbti_indicator || null,
                        order_index: idx
                    }))

                    const { error: optionsError } = await supabase
                        .from('options')
                        .insert(optionsWithId)

                    if (optionsError) throw optionsError
                }

                // Insert Results
                const resultsWithId = test.results.map(r => ({
                    test_id: testData.id,
                    mbti_result: test.type === 'mbti' ? r.result_type : null,
                    title: r.title || r.result_type, // Fallback for score types
                    description: r.description,
                    image_url: null,
                    min_score: r.min_score || 0,
                    max_score: r.max_score || 0
                }))

                const { error: resultsError } = await supabase
                    .from('results')
                    .insert(resultsWithId)

                if (resultsError) throw resultsError
            }

            setStatus('모든 데이터 생성 완료!')
            setLoading(false)
            alert('성공적으로 데이터를 초기화하고 생성했습니다.')

        } catch (e: any) {
            console.error(e)
            setError(e.message)
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>데이터 초기화 및 시드 생성</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-yellow-500/10 text-yellow-500 p-4 rounded-lg flex gap-3 items-start">
                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        <p className="text-sm">
                            이 작업을 수행하면 <strong>기존의 모든 테스트 데이터가 영구적으로 삭제</strong>됩니다.
                            새로운 5개의 테마 테스트로 데이터베이스가 채워집니다.
                        </p>
                    </div>

                    <Button
                        onClick={seedContent}
                        disabled={loading}
                        className="w-full"
                        variant="destructive"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {status}
                            </>
                        ) : (
                            '데이터 초기화 및 생성 시작'
                        )}
                    </Button>

                    {status === '모든 데이터 생성 완료!' && (
                        <div className="bg-green-500/10 text-green-500 p-4 rounded-lg flex gap-3 items-center justify-center">
                            <CheckCircle className="w-5 h-5" />
                            <p className="font-bold">완료되었습니다!</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg text-sm">
                            에러 발생: {error}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
