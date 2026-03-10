# Color Guide — #F26118

## Tokens (globals.css)
```css
:root {
  --primary:            #F26118;
  --primary-foreground: #FFFFFF;
  --primary-50:         #FFF4EE;
  --primary-100:        #FFE4D0;
  --background:         #FFFFFF;
  --foreground:         #1A1A1A;
  --muted:              #F5F5F5;
  --muted-foreground:   #737373;
  --border:             #E5E5E5;
  --ring:               #F26118;
  --destructive:        #EF4444;
  --success:            #22C55E;
  --warning:            #F59E0B;
}
```

## Font (globals.css)
```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css');
body {
  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.7;
  word-break: keep-all;
}
h1, h2, h3 { letter-spacing: -0.01em; }
/* Weight: 400 본문 / 500 UI레이블 / 600 소제목 / 700 제목 / 800 히어로 */
```

## Variants

| Variant | Tailwind | 용도 |
|---|---|---|
| Fill | `bg-primary text-primary-foreground hover:bg-primary/90` | Primary CTA 1개만 |
| Light | `bg-[#FFF4EE] text-primary` | 배지, 인포박스, 선택 상태 |
| Outline | `border border-primary text-primary hover:bg-primary/10` | Fill 없을 때 보조 액션 |
| Muted | `bg-muted border border-border text-foreground` | 다운로드, 취소 등 중립 |
| Ghost | `text-primary hover:bg-primary/10` | 네비, 인라인 액션 |
| Link | `text-primary hover:underline underline-offset-4` | 본문 강조, 문단당 1개 |

## Never
- 주황 배경 + 주황 CTA
- 주황 + red / green 동시 사용
- Fill 버튼 3개 이상
- 다크 배경
