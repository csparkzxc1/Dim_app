# Dim — 시간을 알려주지 않는 시계

> 정보를 더하지 않는다. 빼낸다.

## 1. 프로젝트 개요

**Dim**은 침실용 모바일 앱(iOS + Android). 폰을 베드사이드 시계처럼 두고 자는 사용자를 위해, 밤중에 깨어났을 때 시간 정보를 보지 못하게 함으로써 "시간 확인 → 불안 → 잠 못 듦" 루프를 끊는다.

**핵심 철학**: 문제의 트리거가 되는 정보를 제거한다. 기능을 추가하지 않는다.

**영감**: Mark Zuckerberg가 2019년 만든 'Sleep Box'.

## 2. 타겟

- 머리맡에 폰 두고 자는 30~50대
- 밤중에 깨면 폰으로 시간 확인하는 습관
- 시간 확인이 불안 유발해 다시 잠들기 어려운 사람

## 3. 핵심 동작 (Sleep Mode)

1. 앱 실행 → 풀스크린 검정 잠금
2. `expo-keep-awake`로 화면 자동 잠금 비활성화
3. 23시간 동안 정보 0
4. 사용자 설정 기상 윈도우(예: 06:00~07:00) 동안 화면 중앙에 앰버 글로우 페이드인 (0% → 10~50%)
5. Long-press 3초 → SettingsView 진입 (단순 탭·스와이프로 종료 불가)
6. 햅틱: long-press 시작 soft, 임계점(2.5초) medium

## 4. 기술 스택

- 언어: **TypeScript** (strict mode)
- 프레임워크: **React Native + Expo SDK 51+**
- 라우팅: **expo-router** (파일 기반)
- 최소 지원: iOS 16+, Android 8+ (API 26)
- 핵심 의존성:
  - `expo-keep-awake` — 화면 켜짐 유지
  - `expo-brightness` — 시스템 밝기 제어
  - `expo-haptics` — 햅틱
  - `expo-font` + `@expo-google-fonts/lora` — 폰트
  - `@react-native-async-storage/async-storage` — 설정 저장
  - `expo-task-manager` + `expo-background-fetch` — 기상 윈도우 트리거
  - `react-native-reanimated` — 페이드인 애니메이션
- 빌드/출시: **EAS Build + EAS Submit** (Mac 불필요)

## 5. 디자인 시스템

### `theme/colors.ts`
```ts
export const colors = {
  backgroundBase: '#0A0807',
  lightAmberStart: '#FFB870',
  lightAmberEnd: '#FFCB8A',
  textWarmGray: '#D4C4B0',
  accentAmber: '#C97B4F',
} as const;
```

### 폰트: **Lora** (Google Fonts)
- 앱 시작 시 `useFonts`로 로드, 로드 전 SplashScreen 유지
- 헤드라인 Lora_700Bold 28pt / 본문 Lora_400Regular 17pt / 캡션 13pt

### 모드: 다크 강제, `app.json` → `userInterfaceStyle: "dark"`

## 6. 화면 구성

- **`app/index.tsx`** — SleepMode (진입). 풀검정 + 페이드인 글로우 + long-press 3초 종료
- **`app/settings.tsx`** — 기상 윈도우, 자동 진입, 최대 밝기, 색상(v1 앰버만)
- **`app/onboarding.tsx`** — 3장: "왜?" / "어떻게?" / "Sleep Box 일화"
- **`app/about.tsx`** — 철학·만든 사람·문의

## 7. 권장 파일 구조

```
dim/
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
├── app/
│   ├── _layout.tsx          # 폰트 로드, 테마
│   ├── index.tsx            # SleepMode
│   ├── settings.tsx
│   ├── onboarding.tsx
│   └── about.tsx
├── components/
│   ├── AmberGlow.tsx        # 페이드인 글로우
│   ├── LongPressGate.tsx    # 3초 long-press
│   └── TimeWindowPicker.tsx
├── hooks/
│   ├── useWakeWindow.ts
│   ├── useFadeIn.ts
│   └── useBurnInProtection.ts
├── services/
│   ├── settings.ts          # AsyncStorage 래퍼
│   └── backgroundTask.ts    # expo-task-manager
├── theme/
│   ├── colors.ts
│   └── typography.ts
└── assets/
```

## 8. 중요 제약 (절대 깨지 말 것)

1. **시간 표시 금지** — 숫자·시계·"곧 일어날 시간" 같은 텍스트도 안 됨
2. **정보 추가형 기능 거부** — 수면 트래킹·통계·명상 음원 v2에서도 검토 안 함
3. **푸시 알림 없음** — `expo-notifications` 사용 금지. 알림 자체가 시간 단서
4. **광고 없음** — 정보 노출이며 컨셉 정면 위반
5. **OLED 번인 방지** — 글로우 위치 매번 ±10px 시프트, 직경 5~10% 변동
6. **Long-press 3초 종료 마찰 유지** — 단순 종료 경로 만들지 말 것

## 9. 빌드 / 실행

```bash
# 설치
npm install

# 개발 (Windows에선 실기기 + Expo Go 또는 Android 에뮬레이터)
npx expo start
npx expo start --android

# 클라우드 빌드 (Mac 불필요)
eas build --platform android
eas build --platform ios
eas build --platform all

# 스토어 제출
eas submit --platform all
```

**필수 계정**: Expo (무료) / Apple Developer ($99/년) / Google Play ($25 1회)

## 10. 출시

- 이름: **Dim**
- 카테고리: Lifestyle
- 가격: **₩4,400** — Apple IAP + Play Billing (`expo-in-app-purchases` 또는 `react-native-iap`)
- 카피: "밤에 깨도, 시간이 궁금하지 않은 시계"
- 타겟: 14일 후 양쪽 스토어 동시 제출

## 11. 범위 외 (v2)

빛 색상 확장 / 진동 백업 알람 / 위젯(WidgetKit·Glance) / Apple Watch·Wear OS / 태블릿 최적화

## 12. 의사결정 원칙

새 기능 추가 고민될 때 이 질문 하나:
> "이게 사용자에게 시간을 더 의식하게 만드는가, 덜 의식하게 만드는가?"

전자면 추가하지 않는다. **기본은 항상 추가하지 않음.**
