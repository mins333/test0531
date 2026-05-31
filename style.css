document.addEventListener("DOMContentLoaded", () => {
    fetchWeatherData();
});

function fetchWeatherData() {
    const API_KEY = "b6db065968b639643a9ac6d55d8921a0e2c9ba1b3c640ff91ea1589a97bade53";
    const NX = "56";
    const NY = "125";
    
    // 기상청 API 조건에 맞는 날짜 및 시간 계산
    const { baseDate, baseTime, viewTime } = getBaseDateTime();
    
    // 화면에 조회 기준 시간 표시
    document.getElementById("current-time").innerText = `발표 시각: ${viewTime}`;

    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${NX}&ny=${NY}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("네트워크 응답에 문제가 발생했습니다.");
            return response.json();
        })
        .then(data => {
            if (data.response.header.resultCode !== "00") {
                throw new Error(data.response.header.resultMsg);
            }
            
            const items = data.response.body.items.item;
            parseAndDisplayWeather(items);
        })
        .catch(error => {
            console.error("데이터 로드 실패:", error);
            document.getElementById("rain-status").innerText = "데이터를 불러올 수 없습니다.";
        });
}

/**
 * 기상청 초단기실황 표출 기준(매시 40분 업데이트)에 맞추어 
 * base_date와 base_time을 계산하는 함수
 */
function getBaseDateTime() {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let date = now.getDate();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    // 매시 40분 이전이면 전 시각 데이터를 요청해야 함
    if (minutes < 40) {
        if (hours === 0) {
            // 00시 40분 이전인 경우 전날 23시로 설정
            const yesterday = new Date(now.setDate(now.getDate() - 1));
            year = yesterday.getFullYear();
            month = yesterday.getMonth() + 1;
            date = yesterday.getDate();
            hours = 23;
        } else {
            hours -= 1;
        }
    }

    // 포맷팅 (자리수 맞춤)
    const strYear = String(year);
    const strMonth = String(month).padStart(2, '0');
    const strDate = String(date).padStart(2, '0');
    const strHours = String(hours).padStart(2, '0');

    return {
        baseDate: `${strYear}${strMonth}${strDate}`,
        baseTime: `${strHours}00`,
        viewTime: `${strYear}-${strMonth}-${strDate} ${strHours}:00 실황`
    };
}

/**
 * API 응답 데이터를 항목별로 매핑하여 화면에 출력하는 함수
 */
function parseAndDisplayWeather(items) {
    items.forEach(item => {
        const value = item.obsrValue;
        
        switch (item.category) {
            case "T1H": // 기온
                document.getElementById("temp-value").innerText = value;
                break;
            case "RN1": // 1시간 강수량
                document.getElementById("rn1-value").innerText = `${value} mm`;
                break;
            case "REH": // 습도
                document.getElementById("reh-value").innerText = `${value} %`;
                break;
            case "VEC": // 풍향
                document.getElementById("vec-value").innerText = `${value} deg`;
                break;
            case "WSD": // 풍속
                document.getElementById("wsd-value").innerText = `${value} m/s`;
                break;
            case "PTY": // 강수형태
                document.getElementById("rain-status").innerText = getRainStatusText(value);
                break;
            default:
                break;
        }
    });
}

/**
 * 강수형태 코드(PTY)를 직관적인 텍스트로 변환하는 함수
 */
function getRainStatusText(code) {
    const statusMap = {
        "0": "맑음 / 비 안옴",
        "1": "비 옴",
        "2": "비 또는 눈",
        "3": "눈 옴",
        "5": "빗방울 떨어짐",
        "6": "빗방울 또는 눈날림",
        "7": "눈날림"
    };
    return statusMap[code] || "정보 없음";
}
