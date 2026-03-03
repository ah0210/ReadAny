/**
 * TTS text processing utilities — platform agnostic.
 */

/** Clean text for TTS: remove references like [1], extra whitespace */
export function cleanText(text: string): string {
  return text
    .replace(/\[\d+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Count characters (CJK = 2 units, others = 1) */
export function countChars(text: string): number {
  let count = 0;
  for (const ch of text) {
    count += /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(ch) ? 2 : 1;
  }
  return count;
}

/** Split text into chunks at sentence boundaries */
export function splitIntoChunks(text: string, maxChars = 500): string[] {
  const cleaned = cleanText(text);
  if (countChars(cleaned) <= maxChars) return [cleaned];

  const sentences = cleaned.split(/(?<=[。！？.!?\n])\s*/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (countChars(current + sentence) > maxChars && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
