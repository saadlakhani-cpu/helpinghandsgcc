// Static Quran reference data: all 114 surahs (name, meaning, ayah count) and
// the 30 traditional Juz divisions (name + starting Surah:Ayah). Ayah counts
// follow the standard Hafs/Uthmani numbering (they sum to 6,236, the
// canonical total) used by virtually every printed Mushaf and Quran app.

export type Surah = {
  number: number;
  name: string;
  translation: string;
  ayahCount: number;
};

export const SURAHS: Surah[] = [
  { number: 1, name: "Al-Fatihah", translation: "The Opening", ayahCount: 7 },
  { number: 2, name: "Al-Baqarah", translation: "The Cow", ayahCount: 286 },
  { number: 3, name: "Aal-E-Imran", translation: "The Family of Imran", ayahCount: 200 },
  { number: 4, name: "An-Nisa", translation: "The Women", ayahCount: 176 },
  { number: 5, name: "Al-Ma'idah", translation: "The Table Spread", ayahCount: 120 },
  { number: 6, name: "Al-An'am", translation: "The Cattle", ayahCount: 165 },
  { number: 7, name: "Al-A'raf", translation: "The Heights", ayahCount: 206 },
  { number: 8, name: "Al-Anfal", translation: "The Spoils of War", ayahCount: 75 },
  { number: 9, name: "At-Tawbah", translation: "The Repentance", ayahCount: 129 },
  { number: 10, name: "Yunus", translation: "Jonah", ayahCount: 109 },
  { number: 11, name: "Hud", translation: "Hud", ayahCount: 123 },
  { number: 12, name: "Yusuf", translation: "Joseph", ayahCount: 111 },
  { number: 13, name: "Ar-Ra'd", translation: "The Thunder", ayahCount: 43 },
  { number: 14, name: "Ibrahim", translation: "Abraham", ayahCount: 52 },
  { number: 15, name: "Al-Hijr", translation: "The Rocky Tract", ayahCount: 99 },
  { number: 16, name: "An-Nahl", translation: "The Bee", ayahCount: 128 },
  { number: 17, name: "Al-Isra", translation: "The Night Journey", ayahCount: 111 },
  { number: 18, name: "Al-Kahf", translation: "The Cave", ayahCount: 110 },
  { number: 19, name: "Maryam", translation: "Mary", ayahCount: 98 },
  { number: 20, name: "Ta-Ha", translation: "Ta-Ha", ayahCount: 135 },
  { number: 21, name: "Al-Anbiya", translation: "The Prophets", ayahCount: 112 },
  { number: 22, name: "Al-Hajj", translation: "The Pilgrimage", ayahCount: 78 },
  { number: 23, name: "Al-Mu'minun", translation: "The Believers", ayahCount: 118 },
  { number: 24, name: "An-Nur", translation: "The Light", ayahCount: 64 },
  { number: 25, name: "Al-Furqan", translation: "The Criterion", ayahCount: 77 },
  { number: 26, name: "Ash-Shu'ara", translation: "The Poets", ayahCount: 227 },
  { number: 27, name: "An-Naml", translation: "The Ants", ayahCount: 93 },
  { number: 28, name: "Al-Qasas", translation: "The Narration", ayahCount: 88 },
  { number: 29, name: "Al-Ankabut", translation: "The Spider", ayahCount: 69 },
  { number: 30, name: "Ar-Rum", translation: "The Romans", ayahCount: 60 },
  { number: 31, name: "Luqman", translation: "Luqman", ayahCount: 34 },
  { number: 32, name: "As-Sajdah", translation: "The Prostration", ayahCount: 30 },
  { number: 33, name: "Al-Ahzab", translation: "The Combined Forces", ayahCount: 73 },
  { number: 34, name: "Saba", translation: "Sheba", ayahCount: 54 },
  { number: 35, name: "Fatir", translation: "Originator", ayahCount: 45 },
  { number: 36, name: "Ya-Sin", translation: "Ya-Sin", ayahCount: 83 },
  { number: 37, name: "As-Saffat", translation: "Those Who Set the Ranks", ayahCount: 182 },
  { number: 38, name: "Sad", translation: "Sad", ayahCount: 88 },
  { number: 39, name: "Az-Zumar", translation: "The Troops", ayahCount: 75 },
  { number: 40, name: "Ghafir", translation: "The Forgiver", ayahCount: 85 },
  { number: 41, name: "Fussilat", translation: "Explained in Detail", ayahCount: 54 },
  { number: 42, name: "Ash-Shura", translation: "The Consultation", ayahCount: 53 },
  { number: 43, name: "Az-Zukhruf", translation: "The Ornaments of Gold", ayahCount: 89 },
  { number: 44, name: "Ad-Dukhan", translation: "The Smoke", ayahCount: 59 },
  { number: 45, name: "Al-Jathiyah", translation: "The Crouching", ayahCount: 37 },
  { number: 46, name: "Al-Ahqaf", translation: "The Wind-Curved Sandhills", ayahCount: 35 },
  { number: 47, name: "Muhammad", translation: "Muhammad", ayahCount: 38 },
  { number: 48, name: "Al-Fath", translation: "The Victory", ayahCount: 29 },
  { number: 49, name: "Al-Hujurat", translation: "The Rooms", ayahCount: 18 },
  { number: 50, name: "Qaf", translation: "Qaf", ayahCount: 45 },
  { number: 51, name: "Adh-Dhariyat", translation: "The Winnowing Winds", ayahCount: 60 },
  { number: 52, name: "At-Tur", translation: "The Mount", ayahCount: 49 },
  { number: 53, name: "An-Najm", translation: "The Star", ayahCount: 62 },
  { number: 54, name: "Al-Qamar", translation: "The Moon", ayahCount: 55 },
  { number: 55, name: "Ar-Rahman", translation: "The Beneficent", ayahCount: 78 },
  { number: 56, name: "Al-Waqi'ah", translation: "The Inevitable", ayahCount: 96 },
  { number: 57, name: "Al-Hadid", translation: "The Iron", ayahCount: 29 },
  { number: 58, name: "Al-Mujadila", translation: "The Pleading Woman", ayahCount: 22 },
  { number: 59, name: "Al-Hashr", translation: "The Exile", ayahCount: 24 },
  { number: 60, name: "Al-Mumtahanah", translation: "She That Is To Be Examined", ayahCount: 13 },
  { number: 61, name: "As-Saff", translation: "The Ranks", ayahCount: 14 },
  { number: 62, name: "Al-Jumu'ah", translation: "Friday", ayahCount: 11 },
  { number: 63, name: "Al-Munafiqun", translation: "The Hypocrites", ayahCount: 11 },
  { number: 64, name: "At-Taghabun", translation: "Mutual Disillusion", ayahCount: 18 },
  { number: 65, name: "At-Talaq", translation: "Divorce", ayahCount: 12 },
  { number: 66, name: "At-Tahrim", translation: "The Prohibition", ayahCount: 12 },
  { number: 67, name: "Al-Mulk", translation: "The Sovereignty", ayahCount: 30 },
  { number: 68, name: "Al-Qalam", translation: "The Pen", ayahCount: 52 },
  { number: 69, name: "Al-Haqqah", translation: "The Reality", ayahCount: 52 },
  { number: 70, name: "Al-Ma'arij", translation: "The Ascending Stairways", ayahCount: 44 },
  { number: 71, name: "Nuh", translation: "Noah", ayahCount: 28 },
  { number: 72, name: "Al-Jinn", translation: "The Jinn", ayahCount: 28 },
  { number: 73, name: "Al-Muzzammil", translation: "The Enshrouded One", ayahCount: 20 },
  { number: 74, name: "Al-Muddaththir", translation: "The Cloaked One", ayahCount: 56 },
  { number: 75, name: "Al-Qiyamah", translation: "The Resurrection", ayahCount: 40 },
  { number: 76, name: "Al-Insan", translation: "Man", ayahCount: 31 },
  { number: 77, name: "Al-Mursalat", translation: "The Emissaries", ayahCount: 50 },
  { number: 78, name: "An-Naba", translation: "The Tidings", ayahCount: 40 },
  { number: 79, name: "An-Nazi'at", translation: "Those Who Drag Forth", ayahCount: 46 },
  { number: 80, name: "Abasa", translation: "He Frowned", ayahCount: 42 },
  { number: 81, name: "At-Takwir", translation: "The Overthrowing", ayahCount: 29 },
  { number: 82, name: "Al-Infitar", translation: "The Cleaving", ayahCount: 19 },
  { number: 83, name: "Al-Mutaffifin", translation: "Defrauding", ayahCount: 36 },
  { number: 84, name: "Al-Inshiqaq", translation: "The Sundering", ayahCount: 25 },
  { number: 85, name: "Al-Buruj", translation: "The Mansions of the Stars", ayahCount: 22 },
  { number: 86, name: "At-Tariq", translation: "The Nightcomer", ayahCount: 17 },
  { number: 87, name: "Al-A'la", translation: "The Most High", ayahCount: 19 },
  { number: 88, name: "Al-Ghashiyah", translation: "The Overwhelming", ayahCount: 26 },
  { number: 89, name: "Al-Fajr", translation: "The Dawn", ayahCount: 30 },
  { number: 90, name: "Al-Balad", translation: "The City", ayahCount: 20 },
  { number: 91, name: "Ash-Shams", translation: "The Sun", ayahCount: 15 },
  { number: 92, name: "Al-Layl", translation: "The Night", ayahCount: 21 },
  { number: 93, name: "Ad-Duha", translation: "The Morning Hours", ayahCount: 11 },
  { number: 94, name: "Ash-Sharh", translation: "The Relief", ayahCount: 8 },
  { number: 95, name: "At-Tin", translation: "The Fig", ayahCount: 8 },
  { number: 96, name: "Al-Alaq", translation: "The Clot", ayahCount: 19 },
  { number: 97, name: "Al-Qadr", translation: "The Power", ayahCount: 5 },
  { number: 98, name: "Al-Bayyinah", translation: "The Clear Proof", ayahCount: 8 },
  { number: 99, name: "Az-Zalzalah", translation: "The Earthquake", ayahCount: 8 },
  { number: 100, name: "Al-Adiyat", translation: "The Courser", ayahCount: 11 },
  { number: 101, name: "Al-Qari'ah", translation: "The Calamity", ayahCount: 11 },
  { number: 102, name: "At-Takathur", translation: "Rivalry in World Increase", ayahCount: 8 },
  { number: 103, name: "Al-Asr", translation: "The Declining Day", ayahCount: 3 },
  { number: 104, name: "Al-Humazah", translation: "The Traducer", ayahCount: 9 },
  { number: 105, name: "Al-Fil", translation: "The Elephant", ayahCount: 5 },
  { number: 106, name: "Quraysh", translation: "Quraysh", ayahCount: 4 },
  { number: 107, name: "Al-Ma'un", translation: "The Small Kindnesses", ayahCount: 7 },
  { number: 108, name: "Al-Kawthar", translation: "The Abundance", ayahCount: 3 },
  { number: 109, name: "Al-Kafirun", translation: "The Disbelievers", ayahCount: 6 },
  { number: 110, name: "An-Nasr", translation: "The Divine Support", ayahCount: 3 },
  { number: 111, name: "Al-Masad", translation: "The Palm Fibre", ayahCount: 5 },
  { number: 112, name: "Al-Ikhlas", translation: "The Sincerity", ayahCount: 4 },
  { number: 113, name: "Al-Falaq", translation: "The Daybreak", ayahCount: 5 },
  { number: 114, name: "An-Nas", translation: "Mankind", ayahCount: 6 },
];

export const TOTAL_AYAHS = SURAHS.reduce((sum, s) => sum + s.ayahCount, 0); // 6236

export type Juz = {
  number: number;
  name: string;
  startSurah: number;
  startAyah: number;
};

// Traditional Juz names (transliterated from each Juz's opening word(s)).
export const JUZ_LIST: Juz[] = [
  { number: 1, name: "Alif Lam Meem", startSurah: 1, startAyah: 1 },
  { number: 2, name: "Sayaqool", startSurah: 2, startAyah: 142 },
  { number: 3, name: "Tilkal Rusul", startSurah: 2, startAyah: 253 },
  { number: 4, name: "Lan Tanaloo", startSurah: 3, startAyah: 93 },
  { number: 5, name: "Wal Muhsanat", startSurah: 4, startAyah: 24 },
  { number: 6, name: "La Yuhibbullah", startSurah: 4, startAyah: 148 },
  { number: 7, name: "Wa Iza Sami'oo", startSurah: 5, startAyah: 82 },
  { number: 8, name: "Wa Lau Annana", startSurah: 6, startAyah: 111 },
  { number: 9, name: "Qalal Mala", startSurah: 7, startAyah: 88 },
  { number: 10, name: "Wa A'lamoo", startSurah: 8, startAyah: 41 },
  { number: 11, name: "Ya'tazeroon", startSurah: 9, startAyah: 93 },
  { number: 12, name: "Wa Mamin Da'abat", startSurah: 11, startAyah: 6 },
  { number: 13, name: "Wa Ma Ubrioo", startSurah: 12, startAyah: 53 },
  { number: 14, name: "Rubama", startSurah: 15, startAyah: 1 },
  { number: 15, name: "Subhanallazi", startSurah: 17, startAyah: 1 },
  { number: 16, name: "Qal Alam", startSurah: 18, startAyah: 75 },
  { number: 17, name: "Aqtaraba", startSurah: 21, startAyah: 1 },
  { number: 18, name: "Qad Aflaha", startSurah: 23, startAyah: 1 },
  { number: 19, name: "Wa Qalallazina", startSurah: 25, startAyah: 21 },
  { number: 20, name: "Amman Khalaq", startSurah: 27, startAyah: 56 },
  { number: 21, name: "Utlu Ma Oohiya", startSurah: 29, startAyah: 46 },
  { number: 22, name: "Wa Manyaqnut", startSurah: 33, startAyah: 31 },
  { number: 23, name: "Wa Mali", startSurah: 36, startAyah: 28 },
  { number: 24, name: "Faman Azlam", startSurah: 39, startAyah: 32 },
  { number: 25, name: "Ilayhi Yuraddu", startSurah: 41, startAyah: 47 },
  { number: 26, name: "Ha Meem", startSurah: 46, startAyah: 1 },
  { number: 27, name: "Qala Fama Khatbukum", startSurah: 51, startAyah: 31 },
  { number: 28, name: "Qad Sami Allah", startSurah: 58, startAyah: 1 },
  { number: 29, name: "Tabarakallazi", startSurah: 67, startAyah: 1 },
  { number: 30, name: "Amma", startSurah: 78, startAyah: 1 },
];

export function surahByNumber(n: number): Surah {
  return SURAHS[Math.min(Math.max(n, 1), SURAHS.length) - 1];
}

export function clampAyah(surah: number, ayah: number): number {
  const count = surahByNumber(surah).ayahCount;
  return Math.min(Math.max(ayah, 1), count);
}

// 1-based position of a Surah:Ayah in canonical Quran order.
export function absoluteAyahIndex(surah: number, ayah: number): number {
  let idx = 0;
  for (const s of SURAHS) {
    if (s.number === surah) return idx + clampAyah(surah, ayah);
    idx += s.ayahCount;
  }
  return idx;
}

// Inclusive span length between two canonical-order positions, regardless of
// which direction the child actually memorized in (many Hifz programs work
// back-to-front, starting at Juz 30).
export function rangeAyahCount(
  fromSurah: number,
  fromAyah: number,
  toSurah: number,
  toAyah: number
): number {
  const from = absoluteAyahIndex(fromSurah, fromAyah);
  const to = absoluteAyahIndex(toSurah, toAyah);
  return Math.max(1, Math.abs(to - from) + 1);
}

export function juzForPosition(surah: number, ayah: number): Juz {
  const target = absoluteAyahIndex(surah, ayah);
  let current = JUZ_LIST[0];
  for (const j of JUZ_LIST) {
    if (absoluteAyahIndex(j.startSurah, j.startAyah) <= target) {
      current = j;
    } else {
      break;
    }
  }
  return current;
}

export function formatPosition(surah: number, ayah: number): string {
  const s = surahByNumber(surah);
  return `${s.name} (${s.number}) : ${ayah}`;
}

// Advances `span` ayahs forward from a Surah:Ayah position, rolling into
// subsequent surahs as needed. Used to suggest a session's end point.
export function advancePosition(
  surah: number,
  ayah: number,
  span: number
): { surah: number; ayah: number } {
  let s = Math.min(Math.max(surah, 1), SURAHS.length);
  let a = clampAyah(s, ayah) + Math.max(span, 0);
  while (a > surahByNumber(s).ayahCount && s < SURAHS.length) {
    a -= surahByNumber(s).ayahCount;
    s += 1;
  }
  return { surah: s, ayah: clampAyah(s, a) };
}
