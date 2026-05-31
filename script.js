/* 기본 서체 및 배경 디자인 선언 */
body {
    font-family: 'Pretendard', sans-serif;
    background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
}

/* 풍향 나침반 바늘 회전 애니메이션 속성 정의 */
#wind-needle {
    transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 온도 및 습도 프로그레스 바 가로폭 변경 애니메이션 속성 정의 */
.gauge-bar-fill {
    transition: width 1s cubic-bezier(0.25, 1, 0.5, 1);
}

/* 기상 아이콘 바운스 애니메이션 */
.weather-bounce {
    animation: bounce 3s infinite ease-in-out;
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-8px);
    }
}
