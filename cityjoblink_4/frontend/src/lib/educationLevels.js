export const EDUCATION_MINIMUM_OPTIONS = [
  { level: 'highschool', label: 'At least High School', storedValue: 'At least High School' },
  { level: 'vocational', label: 'At least Vocational / TESDA', storedValue: 'At least Vocational / TESDA' },
  { level: 'associate', label: 'At least Associate Degree', storedValue: 'At least Associate Degree' },
  { level: 'bachelors', label: "At least Bachelor's Degree", storedValue: "At least Bachelor's Degree" },
  { level: 'masters', label: "At least Master's Degree", storedValue: "At least Master's Degree" },
  { level: 'doctorate', label: 'At least Doctorate', storedValue: 'At least Doctorate' },
];

const EDUCATION_KEYWORDS = {
  doctorate: ['doctorate', 'doctoral', 'phd', 'doctor of philosophy'],
  masters: ['master', 'masters', "master's", 'm.s', 'ms', 'm.a', 'ma', 'mba'],
  bachelors: ['bachelor', 'bachelors', "bachelor's", 'b.s', 'bs', 'b.a', 'ba', 'college graduate', 'college grad'],
  associate: ['associate degree', 'associate'],
  vocational: ['vocational', 'tesda', 'certificate', 'technical-vocational', 'nc ii', 'nc iii'],
  highschool: ['high school', 'secondary', 'senior high', 'shs'],
};

const ANY_VALUES = new Set(['', 'any', 'not specified', 'n/a', 'na', 'none']);

const normalizeText = (value) => String(value || '').trim().toLowerCase();

export const educationLevelRank = (level) => {
  switch (level) {
    case 'highschool':
      return 1;
    case 'associate':
    case 'vocational':
      return 2;
    case 'bachelors':
      return 3;
    case 'masters':
      return 4;
    case 'doctorate':
      return 5;
    default:
      return 0;
  }
};

export const inferEducationLevel = (value) => {
  const normalized = normalizeText(value);
  if (ANY_VALUES.has(normalized)) {
    return null;
  }

  const noSymbols = normalized.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ');

  for (const [level, keywords] of Object.entries(EDUCATION_KEYWORDS)) {
    if (keywords.some((keyword) => noSymbols.includes(normalizeText(keyword)))) {
      return level;
    }
  }

  return null;
};

export const normalizeMinimumEducationRequirement = (value) => {
  const normalized = normalizeText(value);
  if (ANY_VALUES.has(normalized)) {
    return '';
  }

  const level = inferEducationLevel(value);
  if (!level) {
    return String(value || '').trim();
  }

  const option = EDUCATION_MINIMUM_OPTIONS.find((item) => item.level === level);
  return option ? option.storedValue : String(value || '').trim();
};
