import TEXTS from './texts';

type Lang = keyof typeof TEXTS;
type Length = string;

// 句読点で split し、各文の末尾に句読点を残す
const splitByPunctuation = (content: string): string[] => {
  return content
    .split(/([,.、。])/)
    .filter((item) => item !== '')
    .reduce<string[]>((acc, curr, i, arr) => {
      if (i % 2 === 0) {
        acc.push(curr + (arr[i + 1] || ''));
      }
      return acc;
    }, []);
};

interface GetContentOptions {
  pre?: string;
  length?: Length;
  lang?: Lang;
  offset?: number;
}

export default function getContent({ pre = '', length = 'm', lang = 'en', offset = 0 }: GetContentOptions): string {
  const langTexts = TEXTS[lang] as Record<string, string> | undefined;
  let content = langTexts?.[length] || '';

  if (offset) {
    content = splitByPunctuation(content).slice(offset).join('').trim();
    content = content.charAt(0).toUpperCase() + content.slice(1);
  }
  if (pre) {
    content = pre + content;
  }

  return content;
}
