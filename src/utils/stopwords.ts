// Indonesian stopwords for filtering
export const INDONESIAN_STOPWORDS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'dengan', 'untuk', 'pada',
  'adalah', 'ada', 'oleh', 'sebagai', 'akan', 'dapat', 'atau', 'saya', 'tidak',
  'juga', 'dalam', 'telah', 'sudah', 'bila', 'jika', 'maka', 'karena', 'saat',
  'seperti', 'lebih', 'bisa', 'harus', 'ia', 'mereka', 'kami', 'kita', 'anda',
  'kamu', 'dia', 'nya', 'mu', 'ku', 'aku', 'ini', 'itu', 'tersebut',
  'sangat', 'sekali', 'hanya', 'antara', 'selalu', 'pernah', 'belum', 'masih',
  'banyak', 'sedikit', 'semua', 'setiap', 'beberapa', 'salah', 'suatu',
  'masing', 'bagian', 'lain', 'lainnya', 'demikian', 'begitu', 'sehingga',
  'hingga', 'sampai', 'sebelum', 'sesudah', 'selama', 'ketika', 'waktu',
  'tempat', 'dimana', 'kemana', 'darimana', 'mengapa', 'kenapa', 'bagaimana',
  'berapa', 'siapa', 'apa', 'kapan', 'mari', 'ayo', 'yuk', 'deh', 'dong',
  'sih', 'kok', 'lho', 'kan', 'kah', 'tah', 'pun', 'lah',
  // Common English stopwords (for mixed text)
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
  'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'now'
]);

export const MIN_WORD_LENGTH = 3;
export const MIN_CODE_FREQUENCY = 2;
