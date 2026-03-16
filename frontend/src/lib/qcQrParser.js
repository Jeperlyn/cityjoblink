const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const normalizeText = (value) => String(value ?? "").trim();
const normalizeDigits = (value) => normalizeText(value).replace(/\D/g, "");

const stripTrailingPeriod = (value) => normalizeText(value).replace(/\.+$/, "");

const isInitialToken = (value) => {
  const cleaned = stripTrailingPeriod(value);
  return /^[A-Za-z]$/.test(cleaned);
};

const normalizeGender = (value) => {
  const normalized = normalizeText(value).toUpperCase();
  if (normalized === "M" || normalized === "MALE") return "M";
  if (normalized === "F" || normalized === "FEMALE") return "F";
  return "";
};

const normalizeBirthdateYYMMDD = (value) => {
  const digits = normalizeDigits(value);
  return /^\d{6}$/.test(digits) ? digits : "";
};

const parseName = (rawName) => {
  const value = normalizeText(rawName);

  if (!value) {
    return { isValid: false, error: "QR name is empty." };
  }

  const commaIndex = value.indexOf(",");
  if (commaIndex < 1) {
    return {
      isValid: false,
      error: "QR name must use LAST, FIRST MIDDLE format.",
    };
  }

  const lastName = normalizeText(value.slice(0, commaIndex));
  const rightSide = normalizeText(value.slice(commaIndex + 1));
  const rightTokens = rightSide.split(/\s+/).filter(Boolean);

  if (!lastName || rightTokens.length < 2) {
    return {
      isValid: false,
      error: "QR name must include a last name and at least first name + trailing name token.",
    };
  }

  const trailingNameToken = rightTokens[rightTokens.length - 1];
  const givenNameTokens = rightTokens.slice(0, -1);

  const hasInitialInGivenNames = givenNameTokens.some((token) => isInitialToken(token));
  if (hasInitialInGivenNames) {
    return {
      isValid: false,
      error:
        "First and given names must be full words. Only the final trailing name token can be abbreviated (e.g., M.).",
    };
  }

  const firstName = givenNameTokens.join(" ");
  const middleName = trailingNameToken;

  return {
    isValid: true,
    fullName: `${lastName}, ${rightTokens.join(" ")}`,
    lastName,
    firstName,
    middleName,
    trailingNameToken,
    trailingTokenIsInitial: isInitialToken(trailingNameToken),
  };
};

export const parseQcQrPayload = (payload) => {
  const raw = normalizeText(payload);

  if (!raw.includes("|")) {
    return {
      isQrPayload: false,
      isValid: false,
      raw,
      errors: [],
    };
  }

  const parts = raw.split("|").map((part) => normalizeText(part));
  if (parts.length < 4) {
    return {
      isQrPayload: true,
      isValid: false,
      raw,
      errors: ["QR payload must follow NAME|QCID|BIRTHDATE|GENDER."],
    };
  }

  const [nameRaw, qcIdRaw, birthdateRaw, genderRaw] = parts;
  const errors = [];

  const name = parseName(nameRaw);
  if (!name.isValid) {
    errors.push(name.error);
  }

  const qcIdDigits = normalizeDigits(qcIdRaw);
  if (qcIdDigits.length !== 14) {
    errors.push("QC ID from QR must contain 14 digits.");
  }

  const birthdateYYMMDD = normalizeBirthdateYYMMDD(birthdateRaw);
  if (!birthdateYYMMDD) {
    errors.push("Birthdate from QR must be in YYMMDD format.");
  }

  const gender = normalizeGender(genderRaw);
  if (!gender) {
    errors.push("Gender from QR must be M or F.");
  }

  return {
    isQrPayload: true,
    isValid: errors.length === 0,
    raw,
    errors,
    fields: {
      nameRaw,
      qcIdRaw,
      qcIdDigits,
      birthdateRaw,
      birthdateYYMMDD,
      genderRaw,
      gender,
      extraFields: parts.slice(4),
      name,
    },
  };
};

export const toBirthdateFormValues = (birthdateYYMMDD) => {
  const digits = normalizeBirthdateYYMMDD(birthdateYYMMDD);
  if (!digits) return null;

  const yy = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const dd = Number(digits.slice(4, 6));

  if (!Number.isInteger(mm) || mm < 1 || mm > 12) return null;
  if (!Number.isInteger(dd) || dd < 1 || dd > 31) return null;

  const currentYear = new Date().getFullYear();
  const currentYY = currentYear % 100;
  const yyyy = yy > currentYY ? 1900 + yy : 2000 + yy;

  return {
    bdayMonth: MONTHS[mm - 1],
    bdayDay: String(dd),
    bdayYear: String(yyyy),
  };
};

export const normalizeQrGenderToFormValue = (genderCode) => {
  const normalized = normalizeGender(genderCode);
  if (normalized === "M") return "Male";
  if (normalized === "F") return "Female";
  return "";
};

export const formatQcId338 = (digits) => {
  const normalized = normalizeDigits(digits);
  if (normalized.length !== 14) {
    return normalized;
  }

  return `${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6)}`;
};
