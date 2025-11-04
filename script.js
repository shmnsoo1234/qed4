function generateSecret() {
  const pool = [1, 2, 3, 4, 5];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

// 입력 문자열 → 숫자 배열 변환
function normalizeGuess(guess) {
  if (typeof guess === 'string') {
    return guess.split('').map(Number);
  } else if (Array.isArray(guess)) {
    return guess.map(Number);
  } else {
    throw new Error('guess는 문자열("12345") 또는 배열([1,2,3,4,5]) 이어야 합니다.');
  }
}

// 입력 검증
function validateGuess(guess) {
  const arr = normalizeGuess(guess);
  if (arr.length !== 5) return { ok: false, reason: '길이는 5여야 합니다.' };

  for (const n of arr) {
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return { ok: false, reason: '각 자리는 1~5 사이 숫자여야 합니다.' };
    }
  }

  const set = new Set(arr);
  if (set.size !== 5) return { ok: false, reason: '숫자는 중복되면 안 됩니다.' };

  return { ok: true, arr };
}

// 맞은 숫자 개수 계산 (위치 무관)
function evaluateGuess(secret, guessArr) {
  const sSet = new Set(secret);
  let match = 0;
  for (const n of guessArr) {
    if (sSet.has(n)) match++;
  }
  return match;
}

/* ---------- 게임 본체 ---------- */

function playNumberWordle() {
  const secret = generateSecret();
  console.log(' 숫자 워들 게임을 시작합니다! (1~5, 중복 없음, 5자리)');
  console.log('최대 6번 시도할 수 있습니다.');
  // 개발용: 실제 정답 보기 (테스트용)
  console.log('(정답 디버그용):', secret.join(''));

  let attempts = 0;
  const maxAttempts = 6;

  while (attempts < maxAttempts) {
    const input = prompt(`(${attempts + 1}/${maxAttempts}) 5자리 숫자 입력 (1~5, 중복없음):`);
    if (input === null) {
      console.log('게임이 취소되었습니다.');
      return;
    }

    const validation = validateGuess(input);
    if (!validation.ok) {
      console.log('잘못된 입력:', validation.reason);
      continue;
    }

    attempts++;
    const guessArr = validation.arr;
    const matched = evaluateGuess(secret, guessArr);

    if (matched === 5) {
      console.log(` 정답! ${attempts}번 만에 맞췄습니다!`);
      return;
    } else {
      console.log(` ${matched}개 숫자가 정답에 포함되어 있습니다. (${maxAttempts - attempts}번 남음)`);
    }
  }

  console.log(` 실패 (정답: ${secret.join('')}`);
}

// 브라우저 콘솔에서 실행할 때:
playNumberWordle();

// Node.js에서 실행할 때는 아래 주석을 참고하세요.
// (Node 환경에서는 prompt가 없으므로 readline 인터페이스로 대체 가능)
