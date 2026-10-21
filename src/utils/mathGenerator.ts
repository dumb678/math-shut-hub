import { MathProblem, OperationType } from '../types';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateMultiplicationProblem(): MathProblem {
  // 3-digit number (102 ~ 895)
  const num1 = getRandomInt(112, 789);
  // 2-digit number (12 ~ 59 to keep calculation engaging & manageable for shooting)
  const num2 = getRandomInt(12, 48);

  const correctAnswer = num1 * num2;
  const onesDigit = num2 % 10;
  const tensDigit = Math.floor(num2 / 10);

  // Realistic elementary misconceptions for distractors
  const distractors = new Set<number>();

  // Distractor 1: Forgot the place value 0 of tens (num1 * ones + num1 * tens)
  const forgotPlaceValue = num1 * onesDigit + num1 * tensDigit;
  if (forgotPlaceValue > 0 && forgotPlaceValue !== correctAnswer) {
    distractors.add(forgotPlaceValue);
  }

  // Distractor 2: Off by 10 or 100 (carrying error)
  const carryingError1 = correctAnswer + (Math.random() > 0.5 ? 100 : -100);
  if (carryingError1 > 0 && carryingError1 !== correctAnswer) {
    distractors.add(carryingError1);
  }

  const carryingError2 = correctAnswer + (Math.random() > 0.5 ? 10 : -10);
  if (carryingError2 > 0 && carryingError2 !== correctAnswer) {
    distractors.add(carryingError2);
  }

  // Distractor 3: Unit digit error or small variation
  const unitError = correctAnswer + (Math.random() > 0.5 ? 20 : -20);
  if (unitError > 0 && unitError !== correctAnswer) {
    distractors.add(unitError);
  }

  // Fill up if we need more unique distractors
  let offset = 50;
  while (distractors.size < 3) {
    const candidate = correctAnswer + (distractors.size % 2 === 0 ? offset : -offset);
    if (candidate > 0 && candidate !== correctAnswer) {
      distractors.add(candidate);
    }
    offset += 30;
  }

  const selectedDistractors = Array.from(distractors).slice(0, 3);
  const options = shuffleArray([correctAnswer, ...selectedDistractors]);

  const step1 = num1 * onesDigit;
  const step2 = num1 * (tensDigit * 10);

  const stepExplanation = [
    `1단계: ${num1} × ${onesDigit} (일의 자리) = ${step1.toLocaleString()}`,
    `2단계: ${num1} × ${tensDigit * 10} (십의 자리) = ${step2.toLocaleString()}`,
    `3단계: ${step1.toLocaleString()} + ${step2.toLocaleString()} = ${correctAnswer.toLocaleString()}`
  ];

  return {
    id: `mul_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'multiplication',
    num1,
    num2,
    correctAnswer,
    options,
    displayQuestion: `${num1} × ${num2} = ?`,
    stepExplanation
  };
}

export function generateDivisionProblem(): MathProblem {
  // Divisor: 2-digit number (12 ~ 45)
  const divisor = getRandomInt(12, 38);
  // Quotient: 2-digit number (12 ~ 35) or clean integer such that dividend is 3-digit (100 ~ 999)
  const minQuotient = Math.ceil(100 / divisor);
  const maxQuotient = Math.floor(999 / divisor);
  
  const quotient = getRandomInt(Math.max(11, minQuotient), Math.max(12, Math.min(38, maxQuotient)));
  const dividend = divisor * quotient;

  const correctAnswer = quotient;

  const distractors = new Set<number>();
  
  // Distractor 1: quotient + 1 or - 1 (very common trial quotient mistake)
  if (quotient > 2) distractors.add(quotient - 1);
  distractors.add(quotient + 1);

  // Distractor 2: quotient + 2 or - 2
  if (quotient > 3) distractors.add(quotient - 2);
  distractors.add(quotient + 2);

  // Distractor 3: quotient + 10 or - 10
  if (quotient > 11) distractors.add(quotient - 10);
  distractors.add(quotient + 10);

  let fallbackOffset = 3;
  while (distractors.size < 3) {
    const candidate = quotient + fallbackOffset;
    if (candidate > 0 && candidate !== correctAnswer) {
      distractors.add(candidate);
    }
    fallbackOffset += 2;
  }

  const selectedDistractors = Array.from(distractors).slice(0, 3);
  const options = shuffleArray([correctAnswer, ...selectedDistractors]);

  const tensPart = Math.floor(quotient / 10);
  const onesPart = quotient % 10;

  const stepExplanation = [
    `1단계: ${dividend} 안에 ${divisor}가 대략 몇 번 들어가는지 어림해봅니다.`,
    tensPart > 0 
      ? `2단계: 십의 자리 몫은 ${tensPart} (${divisor} × ${tensPart * 10} = ${divisor * tensPart * 10})` 
      : `2단계: 일의 자리 계산`,
    `3단계: 일의 자리 몫은 ${onesPart} (${divisor} × ${onesPart} = ${divisor * onesPart})`,
    `결과: 몫은 ${correctAnswer} 입니다! (${divisor} × ${correctAnswer} = ${dividend})`
  ];

  return {
    id: `div_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'division',
    num1: dividend,
    num2: divisor,
    correctAnswer,
    options,
    displayQuestion: `${dividend} ÷ ${divisor} = ?`,
    stepExplanation
  };
}

export function generateMathProblem(mode: OperationType): MathProblem {
  if (mode === 'multiplication') {
    return generateMultiplicationProblem();
  } else if (mode === 'division') {
    return generateDivisionProblem();
  } else {
    // Mixed
    return Math.random() > 0.5 
      ? generateMultiplicationProblem() 
      : generateDivisionProblem();
  }
}
