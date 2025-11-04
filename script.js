// 설정
const NUMBER_OF_ATTEMPTS = 30; // 최대 시도 횟수
const DIGITS = 5; // 다섯 자리 숫자

let attemptsLeft = NUMBER_OF_ATTEMPTS;
let currentAttempt = 0;
let gameOver = false;

// 1. 정답 숫자 생성 (1~5로 이루어진 5자리 숫자)
function generateRandomAnswer() {
    let result = '';
    for (let i = 0; i < DIGITS; i++) {
        // 1에서 5 사이의 랜덤 정수를 생성합니다.
        result += Math.floor(Math.random() * 5) + 1;
    }
    return result;
}

const ANSWER = generateRandomAnswer();
console.log("정답 (개발자용):", ANSWER); 

// DOM 요소 가져오기
const gameBoard = document.getElementById('game-board');
const digitInputs = document.querySelectorAll('.guess-digit-input'); // 5개의 입력 필드
const submitButton = document.getElementById('submit-button');
const messageArea = document.getElementById('message-area');

// 게임 보드 초기화
function initializeBoard() {
    for (let i = 0; i < NUMBER_OF_ATTEMPTS; i++) {
        const row = document.createElement('div');
        row.classList.add('row');

        for (let j = 0; j < DIGITS; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            row.appendChild(tile);
        }
        gameBoard.appendChild(row);
    }
}

// 2. 핵심 로직: 위치가 맞는 숫자 개수만 계산
function checkGuess(guess, answer) {
    let exactMatches = 0;

    for (let i = 0; i < DIGITS; i++) {
        if (guess[i] === answer[i]) {
            exactMatches++;
        }
    }
    return exactMatches;
}

// 보드에 추측 숫자를 표시
function displayGuess(guess, exactMatches) {
    const currentRow = gameBoard.children[currentAttempt];

    // 1. 타일에 입력된 숫자를 표시하고 스타일 적용
    for (let i = 0; i < DIGITS; i++) {
        const tile = currentRow.children[i];
        tile.textContent = guess[i];
        tile.classList.add('filled-tile');
    }
    
    // 2. 메시지 영역에 피드백 개수 표시
    const feedbackMessage = `✅ 맞는 위치의 숫자 개수: ${exactMatches}개`;
    messageArea.textContent = feedbackMessage; 
}

// 입력 필드 포커스 및 유효성 처리
function setupInputHandling() {
    digitInputs.forEach((input, index) => {
        // 1. 입력 시 다음 칸으로 자동 포커스 이동
        input.addEventListener('input', () => {
            if (input.value.length === 1 && index < DIGITS - 1) {
                digitInputs[index + 1].focus();
            }
        });

        // 2. 백스페이스(Backspace) 시 이전 칸으로 이동
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value.length === 0 && index > 0) {
                digitInputs[index - 1].focus();
            }
        });
        
        // 3. 1~5 숫자만 허용하도록 유효성 검사 (입력과 동시에 처리)
        input.addEventListener('change', () => {
             let val = parseInt(input.value);
             // 입력 값이 1~5 범위를 벗어나면 비움
             if (isNaN(val) || val < 1 || val > 5) {
                 input.value = ''; 
             }
        });
    });
}

// 게임 상태 업데이트 (승리 시 시도 횟수 표시 로직 포함)
function updateGameStatus(guess, exactMatches) {
    
    // 1. 보드에 추측 숫자 표시 및 개수 메시지 출력
    displayGuess(guess, exactMatches); 
    
    if (exactMatches === DIGITS) {
        // 🌟 정답을 맞춤: 시도 횟수 표시 🌟
        const attemptsUsed = currentAttempt + 1;
        messageArea.textContent = `🎉 축하합니다! 정답입니다! ${attemptsUsed}번 만에 맞췄어요!`;
        gameOver = true;
    } else if (attemptsLeft - 1 === 0) {
        // 모든 시도 횟수를 소진
        messageArea.textContent = `😭 실패! 정답은 ${ANSWER} 였습니다.`;
        gameOver = true;
    }

    if (gameOver) {
        // 입력 필드 전체 비활성화
        digitInputs.forEach(input => input.disabled = true);
        submitButton.disabled = true;
    } else {
        attemptsLeft--;
        currentAttempt++;
        
        // 다음 시도를 위해 입력 필드 초기화 및 첫 번째 칸으로 포커스 이동
        digitInputs.forEach(input => input.value = '');
        digitInputs[0].focus(); 
    }
}

// '확인' 버튼 클릭 이벤트 핸들러 (입력 미완료 시 처리 로직 추가)
submitButton.addEventListener('click', () => {
    if (gameOver) return;

    // 5개의 입력 필드에서 값을 합쳐서 guess 문자열 생성
    let guess = '';
    let incompleteIndex = -1; // 채워지지 않은 칸의 인덱스

    for (let i = 0; i < DIGITS; i++) {
        const inputVal = digitInputs[i].value;
        if (inputVal === '' || !/^[1-5]$/.test(inputVal)) {
            incompleteIndex = i; // 채워지지 않은 첫 번째 칸을 찾음
            break;
        }
        guess += inputVal;
    }

    if (incompleteIndex !== -1) {
        // 🚨 5칸 중 하나라도 채워지지 않았다면
        messageArea.textContent = '❌ 5개의 칸을 1~5 사이의 숫자로 모두 채워야 합니다.';
        digitInputs[incompleteIndex].focus(); // 채워지지 않은 칸으로 포커스 이동
        return; 
    }

    // 모든 칸이 채워졌다면 게임 로직 실행
    // 메시지 초기화 (성공적으로 입력됐으므로)
    messageArea.textContent = ''; 
    const exactMatches = checkGuess(guess, ANSWER);
    updateGameStatus(guess, exactMatches);
});


// 엔터 키 입력 처리
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !gameOver) {
        // 엔터 시 바로 submitButton 클릭 이벤트 발생
        submitButton.click();
    }
});


// 게임 시작
initializeBoard();
setupInputHandling(); // 입력 칸 핸들링 설정 시작