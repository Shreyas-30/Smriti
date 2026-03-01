export const LANGUAGES = [
  { value: "en", label: "English",  native: "English"    },
  { value: "hi", label: "Hindi",    native: "हिन्दी"     },
  { value: "mr", label: "Marathi",  native: "मराठी"      },
  { value: "gu", label: "Gujarati", native: "ગુજરાતી"   },
  { value: "ta", label: "Tamil",    native: "தமிழ்"     },
] as const;

export type LanguageValue = (typeof LANGUAGES)[number]["value"];
