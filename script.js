const API_ENDPOINT = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";
const API_KEY = "b6db065968b639643a9ac6d55d8921a0e2c9ba1b3c640ff91ea1589a97bade53";

// 기상 정보에 따른 컬러 맵핑 정의 (비주얼 보강 및 SVG 그래픽 정의)
const WEATHER_THEMES = {
    SUNNY: {
        gradient: "from-sky-500 via-blue-600 to-indigo-900",
        badgeColor: "text-amber-400",
        svg: `
            <svg viewBox="0 0 100 100" class="w-24 h-24 weather-bounce filter drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                <circle cx="50" cy="50" r="22" fill="#fbbf24"/>
                <g stroke="#fbbf24" stroke-width="6" stroke-linecap="round">
                    <line x1="50" y1="10" x2="50" y2="20" />
                    <line x1="50" y1="80" x2="50" y2="90" />
                    <line x1="10" y1="50" x2="20" y2="50" />
                    <line x1="80" y1="50" x2="90" y2="50" />
                    <line x1="21.7" y1="21.7" x2="28.8" y2="28.8" />
                    <line x1="71.2" y1="71.2" x2="78.3" y2="78.3" />
                    <line x1="21.7" y1="78.3" x2="28.8" y2="71.2" />
                    <line x1="71.2" y1="28.8" x2="78.3" y2="21.7" />
                </g>
            </svg>
        `
    },
    RAINY: {
        gradient: "from-slate-700 via-slate-800 to-blue-950",
        badgeColor: "text-sky-400",
        svg: `
            <svg viewBox="0 0 100 100" class="w-24 h-24 weather-bounce filter drop-shadow-[0_4px_8px_rgba(56,189,248,0.3)]">
                <path d="M30 65h40a15 15 0 0010-26 15 15 0 00-25-14 15 15 0 00-25 10A15 15 0 0030 65z" fill="#94a3b8"/>
                <g stroke="#38bdf8" stroke-width="4" stroke-linecap="round">
                    <line x1="38" y1="72" x2="33" y2="84" />
                    <line x1="53" y1="72" x2="48" y2="84" />
                    <line x1="68" y1="72" x2="63" y2="84" />
                </g>
            </svg>
        `
    },
    SNOWY: {
        gradient: "from-blue-900 via-indigo-950 to-slate-900",
        badgeColor: "text-slate-200",
        svg: `
            <svg viewBox="0 0 100 100" class="w-24 h-24 weather-bounce filter drop-shadow-[0_0_12px_rgba(224,242,254,0.4)]">
                <path d="M30 65h40a15 15 0 0010-26 15 15 0 00-25-14 15 15 0 00-25 10A15 15 0 0030 65z" fill="#cbd5e1"/>
                <g stroke="#e2e8f0" stroke-width="4" stroke-linecap="round">
                    <line x1="35" y1="75" x2="35" y2="75.01" stroke-width="6" />
                    <line x1="50" y1="80" x2="50" y2="80.01" stroke-width="6" />
                    <line x1="65" y1="75" x2="65" y2="75.01" stroke-width="6" />
                </g>
            </svg>
        `
    },
    UNKNOWN: {
        gradient: "from-slate-800 via-slate-900 to-slate-950",
        badgeColor: "text-slate-400",
        svg: `
            <svg viewBox="0 0 100 100" class="w-24 h-24 weather-bounce">
                <path d="M30 65h40a15 15 0 0010-26 15 15 0 00-25-14 15 15 0 00-25 10A15 15 0 0030 65z" fill="#475569"/>
            </svg>
        `
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const regionSelect = document.getElementById("region-select");
    const inputNx = document.getElementById("input-nx");
    const inputNy = document.getElementById("input-ny");
    const searchBtn = document.getElementById("search-btn");

    initializeClock();

    // 대표 지점 선택 인터페이스 핸들러
    regionSelect.addEventListener("change", () => {
        const [nx, ny] = regionSelect.value.split(",");
        inputNx.value = nx;
        inputNy.value = ny;
        const regionName = regionSelect.options[regionSelect.selectedIndex].text.split(" ")[0];
        requestWeatherData(regionName, nx, ny);
    });

    // 수동 입력 전송 버퍼
    searchBtn.addEventListener("click", () => {
        requestWeatherData("지정 권역", inputNx.value, inputNy.value);
    });

    // 시스템 초기값 호출 (기본값: 부천시)
    requestWeatherData("부천시", 56, 125);
});

// 시스템 동기화 시계 제어
function initializeClock() {
    const timeEl = document.getElementById("system-time");
    const tick = () => {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        timeEl.textContent = `SYSTEM CLOCK: ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
}

// 공공데이터 API 비동기 수신 코어 엔진
function requestWeatherData(regionName, nx, ny) {
    const loader = document.getElementById("card-loader");
    const diagStatus = document.getElementById("diagnostic-status");
    const diagUrl = document.getElementById("diagnostic-url");
    
    loader.classList.remove("hidden");
    diagStatus.textContent = "WAITING RESPONSE...";
    diagStatus.className = "text-amber-400";

    const { baseDate, baseTime, viewTime } = calculateQueryTime();

    const params = new URLSearchParams({
        serviceKey: API_KEY,
        pageNo: "1",
        numOfRows: "1000",
        dataType: "JSON",
        base_date: baseDate,
        base_time: baseTime,
        nx: nx.toString(),
        ny: ny.toString()
    });

    const targetUrl = `${API_ENDPOINT}?${params.toString()}`;
    diagUrl.textContent = `Request URL: ${targetUrl}`;

    fetch(targetUrl)
        .then(res => {
            if (!res.ok) throw new Error("서버 응답 거부");
            return res.json();
        })
        .then(data => {
            if (!data.response || !data.response.header) {
                throw new Error("올바르지 않은 응답 패킷 구조");
            }
            if (data.response.header.resultCode !== "00") {
                throw new Error(data.response.header.resultMsg);
            }
            const items = data.response.body.items.item;
            updateUI(regionName, nx, ny, viewTime, items);
            
            diagStatus.textContent = "CONNECTED SUCCESS";
            diagStatus.className = "text-emerald-400";
        })
        .catch(err => {
            console.error(err);
            diagStatus.textContent = "ERROR OCCURRED";
            diagStatus.className = "text-rose-500";
            clearUI(regionName, nx, ny, err.message);
        })
        .finally(() => {
            loader.classList.add("hidden");
        });
}

// 매시 40분 정기 업데이트 지연 변동성 완화 로직
function calculateQueryTime() {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let date = now.getDate();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    // 기상청 초단기 실황은 매시 40분 이후에 데이터가 생성되므로 보정 처리 적용
    if (minutes < 40) {
        if (hours === 0) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            year = yesterday.getFullYear();
            month = yesterday.getMonth() + 1;
            date = yesterday.getDate();
            hours = 23;
        } else {
            hours -= 1;
        }
    }

    const strYear = String(year);
    const strMonth = String(month).padStart(2, '0');
    const strDate = String(date).padStart(2, '0');
    const strHours = String(hours).padStart(2, '0');

    return {
        baseDate: `${strYear}${strMonth}${strDate}`,
        baseTime: `${strHours}00`,
        viewTime: `${strHours}:00`
    };
}

// 가시화 카드 렌더링 동기화 장치
function updateUI(regionName, nx, ny, viewTime, items) {
    document.getElementById("display-region-name").textContent = regionName;
    document.getElementById("display-grid-meta").textContent = `NX: ${nx} | NY: ${ny}`;
    document.getElementById("display-base-time").textContent = `${viewTime} 발표`;

    const dataMap = {};
    items.forEach(item => {
        dataMap[item.category] = item.obsrValue;
    });

    // 1. 기온 지표 맵핑 및 가로 비교 게이지 변환
    const tempVal = parseFloat(dataMap["T1H"]);
    if (!isNaN(tempVal)) {
        document.getElementById("val-temp").textContent = tempVal;
        document.getElementById("gauge-temp-text").textContent = `${tempVal}°C`;
        
        // -15도 ~ 45도 범위를 100% 스케일로 정밀 조정
        const tempPercentage = Math.min(100, Math.max(0, ((tempVal + 15) / 60) * 100));
        document.getElementById("temp-bar-fill").style.width = `${tempPercentage}%`;
    } else {
        document.getElementById("val-temp").textContent = "--";
        document.getElementById("temp-bar-fill").style.width = "0%";
    }

    // 2. 대기 습도 및 게이지바 매핑
    const rehVal = parseFloat(dataMap["REH"]);
    if (!isNaN(rehVal)) {
        document.getElementById("gauge-reh-text").textContent = `${rehVal}%`;
        document.getElementById("reh-bar-fill").style.width = `${rehVal}%`;
    } else {
        document.getElementById("gauge-reh-text").textContent = "--%";
        document.getElementById("reh-bar-fill").style.width = "0%";
    }

    // 3. 기상 형태 연동 분석 (강수 코드에 따른 지형 테마 교체 기능 내장)
    const ptyCode = String(dataMap["PTY"]);
    const { text, theme } = getPtyStatus(ptyCode);
    document.getElementById("val-pty-text").textContent = text;
    
    // 기상 카드 그라데이션 동적 전환
    const cardEl = document.getElementById("weather-card");
    cardEl.className = `bg-gradient-to-br ${theme.gradient} border border-slate-800 rounded-3xl p-6 relative overflow-hidden transition-all duration-700`;
    
    // 중앙 SVG 일러스트 변경
    document.getElementById("main-weather-graphic").innerHTML = theme.svg;

    // 4. 풍속 수치 및 풍향 각도 수신
    const wsdVal = dataMap["WSD"];
    const vecVal = parseFloat(dataMap["VEC"]);
    document.getElementById("val-wsd").textContent = wsdVal !== undefined ? wsdVal : "--";
    
    if (!isNaN(vecVal)) {
        document.getElementById("val-vec-text").textContent = `${vecVal}° (${getWindDirectionKor(vecVal)})`;
        // 물리적 각도 벡터를 주입하여 나침반 바늘 실시간 회전 유도
        document.getElementById("wind-needle").style.transform = `rotate(${vecVal}deg)`;
    } else {
        document.getElementById("val-vec-text").textContent = "--";
        document.getElementById("wind-needle").style.transform = `rotate(0deg)`;
    }

    // 5. 강수량 출력
    const rn1Val = parseFloat(dataMap["RN1"]);
    document.getElementById("val-rn1").textContent = (!isNaN(rn1Val) && rn1Val > 0) ? `${rn1Val} mm` : "0.0 mm";
}

// 통신 단절 및 수신 지연 대처 백업 루틴
function clearUI(regionName, nx, ny, errText) {
    document.getElementById("display-region-name").textContent = `${regionName} (조회 실패)`;
    document.getElementById("display-grid-meta").textContent = `NX: ${nx} | NY: ${ny}`;
    document.getElementById("val-temp").textContent = "--";
    document.getElementById("val-pty-text").textContent = errText || "기상 정보를 수신할 수 없음";
    document.getElementById("gauge-temp-text").textContent = "--°C";
    document.getElementById("temp-bar-fill").style.width = "0%";
    document.getElementById("gauge-reh-text").textContent = "--%";
    document.getElementById("reh-bar-fill").style.width = "0%";
    document.getElementById("val-wsd").textContent = "--";
    document.getElementById("val-vec-text").textContent = "--";
    document.getElementById("wind-needle").style.transform = `rotate(0deg)`;
    document.getElementById("val-rn1").textContent = "-- mm";
    
    // 기본 상태 SVG 복원
    document.getElementById("main-weather-graphic").innerHTML = WEATHER_THEMES.UNKNOWN.svg;
    document.getElementById("weather-card").className = "bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden transition-all duration-700";
}

// 기상청 특수 비주얼 메타 취득 알고리즘
function getPtyStatus(code) {
    switch (code) {
        case "0":
            return { text: "맑음 (강수 없음)", theme: WEATHER_THEMES.SUNNY };
        case "1":
            return { text: "강우 상태 (비)", theme: WEATHER_THEMES.RAINY };
        case "2":
            return { text: "진눈깨비 (비/눈)", theme: WEATHER_THEMES.SNOWY };
        case "3":
            return { text: "강설 상태 (눈)", theme: WEATHER_THEMES.SNOWY };
        case "5":
            return { text: "약한 빗방울 낙하", theme: WEATHER_THEMES.RAINY };
        case "6":
            return { text: "빗방울 및 눈날림 현상", theme: WEATHER_THEMES.SNOWY };
        case "7":
            return { text: "진눈깨비 / 눈날림", theme: WEATHER_THEMES.SNOWY };
        default:
            return { text: "맑음 / 대기 구름", theme: WEATHER_THEMES.SUNNY };
    }
}

// 풍향 각도(VEC) 기반 16방위 변환기
function getWindDirectionKor(deg) {
    if (deg >= 337.5 || deg < 22.5) return "북풍";
    if (deg >= 22.5 && deg < 67.5) return "북동풍";
    if (deg >= 67.5 && deg < 112.5) return "동풍";
    if (deg >= 112.5 && deg < 157.5) return "남동풍";
    if (deg >= 157.5 && deg < 202.5) return "남풍";
    if (deg >= 202.5 && deg < 247.5) return "남서풍";
    if (deg >= 247.5 && deg < 292.5) return "서풍";
    if (deg >= 292.5 && deg < 337.5) return "북서풍";
    return "변동풍";
}
