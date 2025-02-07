export function generateQuestionMarks(length = 1) {
  return Array(length).fill('(?)').join(',');
}

export function limitedText(textContent, maxLength = 25) {
  if (textContent.length > maxLength) {
    textContent = textContent.substring(0, maxLength - 3) + '...';
  }
  return textContent;
}