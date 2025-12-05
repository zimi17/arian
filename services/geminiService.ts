import { Code, Category, CoreTheory, Segment } from "../types";

// --- KONFIGURASI NLP LOKAL ---

const DEFAULT_STOPWORDS = new Set([
  "dan", "yang", "di", "itu", "dengan", "untuk", "adalah", "dari", "ini", "dalam", 
  "akan", "pada", "juga", "saya", "ke", "karena", "tersebut", "bisa", "ada", "mereka", 
  "kata", "atau", "saat", "oleh", "sudah", "sebagai", "tapi", "namun", "kita", "anda", 
  "dia", "kami", "apa", "tidak", "bukan", "jika", "kalau", "maka", "seperti", "tentang", 
  "secara", "menjadi", "sangat", "hal", "ketika", "para", "itu", "banyak", "sedang", 
  "apakah", "yaitu", "bagaimana", "mana", "masih", "lagi", "hanya", "kepada", "mengapa",
  "setiap", "bagi", "ia", "lalu", "dapat", "saja", "telah", "agar", "perlu", "pun",
  "harus", "ingin", "masalah", "terjadi", "melakukan", "memiliki", "satu", "dua", "tiga",
  "aku", "gue", "gw", "lu", "lo", "sama", "kok", "sih", "dong", "deh", "kan", "ni", "tu",
  "buat", "bikin", "biar", "kayak", "gitu", "gini", "banget", "cuma", "pas", "emang", "nya"
]);

const cleanText = (text: string): string => {
  return text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"']/g, " ") // Hapus tanda baca
    .replace(/\s{2,}/g, " "); // Hapus spasi ganda
};

// --- OPEN CODING (REAL N-GRAM EXTRACTION) ---
export const performOpenCoding = async (segments: Segment[], excludeKeywords: string[] = []): Promise<Code[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // UX Delay

  if (!segments || segments.length === 0) {
    throw new Error("Dataset kosong. Silakan unggah data JSON atau teks.");
  }

  const stopWords = new Set([...DEFAULT_STOPWORDS, ...excludeKeywords.map(k => k.toLowerCase())]);
  const codeMap: Record<string, { freq: number, segments: Set<string> }> = {};

  // Proses setiap segmen
  segments.forEach(seg => {
    const cleaned = cleanText(seg.text);
    const tokens = cleaned.split(" ").filter(t => t.length > 2); // Filter kata sangat pendek

    // 1. Unigrams (Kata tunggal yang bermakna)
    tokens.forEach(token => {
      if (!stopWords.has(token)) {
        if (!codeMap[token]) codeMap[token] = { freq: 0, segments: new Set() };
        codeMap[token].freq += 1;
        codeMap[token].segments.add(seg.id);
      }
    });

    // 2. Bigrams & Trigrams (Frasa) - Sangat penting untuk menangkap "takut rugi", "ikut ikutan"
    for (let i = 0; i < tokens.length - 1; i++) {
      // Bigram
      if (!stopWords.has(tokens[i]) && !stopWords.has(tokens[i+1])) {
        const bigram = `${tokens[i]} ${tokens[i+1]}`;
        if (!codeMap[bigram]) codeMap[bigram] = { freq: 0, segments: new Set() };
        codeMap[bigram].freq += 3; // Bobot lebih tinggi untuk frasa
        codeMap[bigram].segments.add(seg.id);
      }

      // Trigram
      if (i < tokens.length - 2) {
         if (!stopWords.has(tokens[i]) && !stopWords.has(tokens[i+1]) && !stopWords.has(tokens[i+2])) {
            const trigram = `${tokens[i]} ${tokens[i+1]} ${tokens[i+2]}`;
            if (!codeMap[trigram]) codeMap[trigram] = { freq: 0, segments: new Set() };
            codeMap[trigram].freq += 4; // Bobot tertinggi
            codeMap[trigram].segments.add(seg.id);
         }
      }
    }
  });

  // Filtering & Sorting
  // Hapus kode yang hanya muncul 1x (kecuali dataset sangat kecil)
  const minFreq = segments.length < 10 ? 1 : 2;

  const result = Object.entries(codeMap)
    .filter(([_, data]) => data.freq >= minFreq)
    .sort(([, a], [, b]) => b.freq - a.freq)
    .slice(0, 50) // Ambil top 50
    .map(([name, data], idx) => ({
      id: `code-${idx + 1}`,
      name: name,
      frequency: data.freq,
      segmentIds: Array.from(data.segments),
      description: `Konsep "${name}" teridentifikasi dalam ${data.segments.size} segmen data.`,
      memo: "", // Initialize memo as empty string
      tags: []  // Initialize tags as empty array
    }));

  if (result.length === 0) throw new Error("Tidak ditemukan pola kata yang signifikan. Coba kurangi kata yang dikecualikan.");
  return result;
};

// --- AXIAL CODING (CO-OCCURRENCE CLUSTERING) ---
export const performAxialCoding = async (codes: Code[], segments: Segment[]): Promise<Category[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (codes.length === 0) throw new Error("Tidak ada kode untuk dikelompokkan.");

  // 1. Bangun Matriks Co-occurrence
  // Jika dua kode muncul di set segmentIds yang sama (irisan), mereka berhubungan.
  const codeRelations: Record<string, Set<string>> = {}; // codeId -> Set of related codeIds

  for (let i = 0; i < codes.length; i++) {
    for (let j = i + 1; j < codes.length; j++) {
      const c1 = codes[i];
      const c2 = codes[j];
      
      // Hitung irisan segmentIds
      const intersection = c1.segmentIds.filter(id => c2.segmentIds.includes(id));
      
      // Ambang batas hubungan: Muncul bersama minimal di 1 segmen (karena dataset kecil), 
      // atau jika dataset besar bisa ditingkatkan.
      if (intersection.length > 0) {
        if (!codeRelations[c1.id]) codeRelations[c1.id] = new Set();
        if (!codeRelations[c2.id]) codeRelations[c2.id] = new Set();
        codeRelations[c1.id].add(c2.id);
        codeRelations[c2.id].add(c1.id);
      }
    }
  }

  // 2. Simple Clustering (Greedy Algorithm)
  // Ambil kode yang belum terkelompok, jadikan pusat, tarik semua temannya.
  const assignedCodeIds = new Set<string>();
  const categories: Category[] = [];
  let catCounter = 1;

  // Prioritaskan kode dengan frekuensi tinggi sebagai "Seed" kategori
  const sortedCodes = [...codes].sort((a,b) => b.frequency - a.frequency);

  // TAKSONOMI "SEED" (Opsional, untuk memandu clustering agar mirip scene.md jika pola ditemukan)
  // Jika algoritma menemukan kata kunci ini, ia akan mencoba membuat kategori dengan nama tersebut.
  const SEED_TOPICS: Record<string, string[]> = {
    "Pengaruh Sosial": ["teman", "komunitas", "influencer", "grup", "ajak", "ikut"],
    "Persepsi Risiko": ["takut", "rugi", "panik", "cemas", "hilang", "fomo", "aman"],
    "Literasi & Belajar": ["belajar", "youtube", "tiktok", "kelas", "paham", "baca"],
    "Praktik Investasi": ["aplikasi", "top-up", "chart", "modal", "jajan", "saham"],
    "Kearifan Lokal": ["orang tua", "keluarga", "nasihat", "hemat", "nabung", "gotong"]
  };

  // Coba bentuk kategori berdasarkan topik seed dulu
  for (const [topicName, keywords] of Object.entries(SEED_TOPICS)) {
    const matchingCodes = sortedCodes.filter(c => 
      !assignedCodeIds.has(c.id) && keywords.some(k => c.name.includes(k))
    );

    if (matchingCodes.length > 0) {
      // Ambil kode-kode ini dan teman-teman dekatnya
      const clusterCodes = new Set<string>();
      matchingCodes.forEach(c => {
        clusterCodes.add(c.id);
        assignedCodeIds.add(c.id);
        // Tarik relasi kuat
        const relations = codeRelations[c.id];
        if (relations) {
          relations.forEach(rId => {
            if (!assignedCodeIds.has(rId)) {
               clusterCodes.add(rId);
               assignedCodeIds.add(rId);
            }
          });
        }
      });

      categories.push({
        id: `cat-${catCounter++}`,
        name: topicName, // Nama kategori awal
        codeIds: Array.from(clusterCodes),
        description: `Kategori yang terbentuk dari pola kata kunci "${keywords[0]}" dan relasinya.`,
        connections: [],
        centrality: 0,
        memo: "", // Initialize memo as empty string
        tags: []  // Initialize tags as empty array
      });
    }
  }

  // Sisa kode yang belum masuk kategori (Emergent Categories)
  sortedCodes.forEach(code => {
    if (assignedCodeIds.has(code.id)) return;

    const clusterCodes = new Set<string>([code.id]);
    assignedCodeIds.add(code.id);

    // Cari teman
    const relations = codeRelations[code.id];
    if (relations) {
      relations.forEach(rId => {
        if (!assignedCodeIds.has(rId)) {
          clusterCodes.add(rId);
          assignedCodeIds.add(rId);
        }
      });
    }

    // Hanya buat kategori jika ada isinya
    if (clusterCodes.size > 0) {
      categories.push({
        id: `cat-${catCounter++}`,
        name: `Kategori: ${code.name}`, // Nama sementara dari kode dominan
        codeIds: Array.from(clusterCodes),
        description: "Kelompok konsep emergent berdasarkan kemunculan bersama.",
        connections: [],
        centrality: 0,
        memo: "", // Initialize memo as empty string
        tags: []  // Initialize tags as empty array
      });
    }
  });

  // 3. Hitung Koneksi Antar Kategori (Axial Linking) & Centrality
  // Kategori A terhubung ke B jika kode di A sering muncul bersama kode di B (lintas kategori)
  categories.forEach((catA, idx) => {
    let internalLinkStrength = 0;

    categories.forEach((catB, idxB) => {
      if (idx === idxB) return;
      
      let sharedSegments = 0;
      catA.codeIds.forEach(cA => {
        const codeA = codes.find(c => c.id === cA);
        catB.codeIds.forEach(cB => {
           const codeB = codes.find(c => c.id === cB);
           // Hitung irisan segmen
           if (codeA && codeB) {
             const intersection = codeA.segmentIds.filter(id => codeB.segmentIds.includes(id));
             sharedSegments += intersection.length;
           }
        });
      });

      if (sharedSegments > 0) {
        catA.connections.push(catB.id);
        internalLinkStrength += sharedSegments;
      }
    });

    // Kalkulasi Centrality (1-10)
    // Faktor: Jumlah Kode + Jumlah Koneksi + Kekuatan Link
    const rawScore = (catA.codeIds.length * 1) + (catA.connections.length * 1.5);
    catA.centrality = Math.min(10, Math.max(1, Math.ceil(rawScore / 3))); // Normalisasi kasar
  });

  return categories;
};

// --- SELECTIVE CODING (NARRATIVE GENERATION) ---
export const performSelectiveCoding = async (
  categories: Category[], 
  segments: Segment[], 
  codes: Code[],
  forcedCoreCategoryId?: string
): Promise<CoreTheory> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 1. Pilih Core Category
  let coreCat: Category;
  if (forcedCoreCategoryId) {
    coreCat = categories.find(c => c.id === forcedCoreCategoryId) || categories[0];
  } else {
    coreCat = categories.reduce((prev, curr) => (prev.centrality > curr.centrality ? prev : curr));
  }

  // 2. Kumpulkan Kutipan Asli (Audit Trail Integration)
  // Ambil semua segmen yang terkait dengan kode-kode di dalam Core Category
  const relevantSegmentIds = new Set<string>();
  coreCat.codeIds.forEach(cId => {
    const code = codes.find(c => c.id === cId);
    if (code) {
      code.segmentIds.forEach(sId => relevantSegmentIds.add(sId));
    }
  });

  const quotes = Array.from(relevantSegmentIds)
    .map(sId => segments.find(s => s.id === sId))
    .filter(Boolean)
    .slice(0, 3) // Ambil 3 kutipan teratas sebagai contoh
    .map(s => `"${s?.text}" (${s?.dataset || s?.platform || 'Data'})`);

  // 3. Susun Narasi
  const totalCodes = categories.reduce((acc, c) => acc + c.codeIds.length, 0);
  const dominance = Math.round((coreCat.codeIds.length / totalCodes) * 100);

  const narrative = `
    Dinamika Sentral: "${coreCat.name}"

    Berdasarkan analisis axial, kategori "${coreCat.name}" muncul sebagai fenomena sentral yang mengikat ${dominance}% dari total kode yang teridentifikasi dalam dataset. Kategori ini memiliki skor sentralitas ${coreCat.centrality}/10, menunjukkan posisinya sebagai titik temu dari berbagai kategori lain.

    Bukti Empiris:
    Fenomena ini tercermin kuat dalam ungkapan partisipan seperti:
    ${quotes.join('\n    ')}

    Sintesis Teoritis:
    "${coreCat.name}" bukan sekadar kumpulan kode, melainkan mekanisme adaptasi utama subjek penelitian. Keterhubungannya dengan kategori lain menunjukkan bahwa perubahan pada aspek ini akan berdampak sistemik pada keseluruhan perilaku subjek.
  `.trim().replace(/^\s+/gm, '');

  const hypothesis = `Semakin dominan "${coreCat.name}" dalam diskursus subjek, semakin kuat pola perilaku yang teramati pada kategori turunannya.`;

  return {
    coreCategory: coreCat.name,
    narrative: narrative,
    hypothesis: hypothesis,
    confidenceScore: coreCat.centrality >= 7 ? 'High' : 'Medium',
    confidenceRationale: `Didukung oleh ${coreCat.codeIds.length} kode unik dan ${relevantSegmentIds.size} segmen data mentah.`
  };
};