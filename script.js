// weather_app.html 약 415라인 부근 (updateDashboard 함수 내부)
function updateDashboard() {
    // ... (날씨 그래픽 및 수치 업데이트 로직)

    // [중요] 선택창(Select)에서 현재 선택된 지역의 '이름'만 추출하는 부분
    const select = document.getElementById('selectRegion');
    const locName = select.options[select.selectedIndex].text.split('(')[0].trim();
    
    // 추출한 이름을 화면의 txtLocation 요소에 대입
    document.getElementById('txtLocation').textContent = locName;
    
    // 격자 좌표도 함께 표시
    document.getElementById('txtGridCoord').textContent = `격자: NX ${state.nx}, NY ${state.ny}`;
}
