/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function decodeUnicodeEscapes(input) {
  return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
}

function normalizeText(input) {
  if (!input) return '';

  let text = input.replace(/\r/g, '').trim();
  text = decodeUnicodeEscapes(text);

  // Unescape literal sequences from the Android export.
  text = text.replace(/\\r\\n/g, '\n');
  text = text.replace(/\\n/g, '\n');
  text = text.replace(/\\r/g, '\n');

  // The source sometimes includes an "Â " (C2 A0) artifact.
  text = text.replace(/\u00C2/g, '');
  text = text.replace(/\u00A0/g, ' ');

  // Common mojibake sequences for smart punctuation.
  text = text.replace(/â/g, "'");
  text = text.replace(/â/g, '-');
  text = text.replace(/â/g, '-');
  text = text.replace(/â/g, '"');
  text = text.replace(/â/g, '"');

  // Drop common stray footer fragments.
  text = text
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      if (/^\d+$/.test(trimmed)) return false;
      if (/^Frequently Asked Questions$/i.test(trimmed)) return false;
      return true;
    })
    .join('\n');

  // Clean any remaining carriage returns (some sources embed them).
  text = text.replace(/\r/g, '');

  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

function isSectionHeading(text) {
  const value = (text || '').trim();
  if (!value) return false;
  if (/\?/.test(value)) return false;
  return /faq/i.test(value);
}

function extractStrings(raw) {
  const re = /<string name="([^"]+)">([\s\S]*?)<\/string>/g;
  const strings = [];
  let match;
  while ((match = re.exec(raw))) {
    const name = match[1];
    const text = normalizeText(match[2]);
    if (!text) continue;
    strings.push({ name, text });
  }
  return strings;
}

function buildSections(strings) {
  const sections = [];
  let current = null;
  let currentItem = null;

  const questionStarts = /^(is|does|do|who|what|how|when|are|can|will|where|why)\b/i;
  const isQuestion = (value) => {
    const text = (value || '').trim();
    if (!text) return false;
    if (/\?$/.test(text)) return true;
    return questionStarts.test(text) && text.length <= 120;
  };

  for (let i = 0; i < strings.length; i++) {
    const { text } = strings[i];

    if (isSectionHeading(text)) {
      if (current) sections.push(current);
      current = { title: text, items: [] };
      currentItem = null;
      continue;
    }

    if (!current) current = { title: 'FAQs', items: [] };

    if (isQuestion(text)) {
      currentItem = { question: text, answer: '' };
      current.items.push(currentItem);
      continue;
    }

    // Non-question text becomes answer content for the most recent question.
    if (!currentItem) {
      currentItem = { question: text, answer: '' };
      current.items.push(currentItem);
      continue;
    }

    if (!currentItem.answer) {
      currentItem.answer = text;
    } else {
      currentItem.answer = `${currentItem.answer}\n${text}`.trim();
    }
  }

  if (current) sections.push(current);
  return sections;
}

function main() {
  const inputPath =
    process.argv[2] || '/mnt/c/Users/ALIEN/Documents/specs.txt';
  const outputPath =
    process.argv[3] ||
    path.join(
      process.cwd(),
      'src',
      'features',
      'support',
      'data',
      'faqs.json',
    );

  const raw = fs.readFileSync(inputPath, 'utf8');
  const strings = extractStrings(raw);
  const sections = buildSections(strings);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(sections, null, 2) + '\n', 'utf8');

  console.log(`Wrote ${sections.length} sections to ${outputPath}`);
}

main();
