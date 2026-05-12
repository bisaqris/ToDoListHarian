/**
 * TEKNIK KONSTRUKSI: TABLE-DRIVEN DESIGN / DATA-DRIVEN VALIDATION
 *
 * APA ITU?
 * Teknik ini memisahkan "Logika Validasi" (kode yang mengecek) dari "Aturan Validasi" (data/skema).
 * Alih-alih menggunakan tumpukan 'if-else' yang panjang untuk setiap field, kita menyimpan
 * aturan dalam sebuah tabel (Array of Objects) dan menggunakan satu fungsi loop untuk memprosesnya.
 *
 * FUNGSINYA:
 * 1. Maintainability: Jika ada field baru atau aturan berubah, kita cukup ubah array 'TODO_LIST_RULES'
 *    tanpa perlu menyentuh logika fungsi 'validateTodoData'.
 * 2. Reusability: Fungsi validator yang sama bisa digunakan untuk skema aturan yang berbeda.
 * 3. Readability: Aturan bisnis aplikasi terlihat jelas seperti dokumentasi dalam bentuk tabel.
 * 4. Scalability: Mencegah kode menjadi "Spaghetti Code" saat jumlah field bertambah banyak.
 */

// Table-driven: Metadata/Skema aturan untuk endpoint tertentu
export const TODO_LIST_RULES = [
  {
    field: "title", // Nama field yang divalidasi
    type: "string", // Harus bertipe data string
    required: true, // Wajib ada (tidak boleh kosong/null)
    maxLength: 200, // Panjang maksimal 200 karakter
  },
  {
    field: "description",
    type: "string",
    required: false, // Opsional
    maxLength: 1000, // Panjang maksimal 1000 karakter
  },
  {
    field: "completed",
    type: "boolean", // Harus true atau false
    required: false,
  },
  {
    field: "priority",
    type: "string",
    required: false,
    allowedValues: ["low", "medium", "high"], // Input harus salah satu dari nilai ini
  },
  {
    field: "category",
    type: "string",
    required: false,
    allowedValues: ["general", "work", "personal", "shopping", "health"],
  },
  {
    field: "dueDate",
    type: "string",
    required: false,
    isDate: true, // Menandakan field ini harus format tanggal yang valid
  },
];


/**
 * Fungsi ini berperan sebagai "Engine" atau mesin pemroses tabel di atas.
 * Ia tidak peduli apa nama field-nya, ia hanya mengikuti instruksi yang ada di tabel.
 */
export function validateTodoData(data, isUpdate = false) {
  // Cek apakah data ada, bertipe object, dan bukan array (karena array di JS dianggap object)
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(
      "Precondition violated: request body must be a non-null object",
    );
  }

  const errors = []; // Menampung list pesan error jika ditemukan

  // Melakukan perulangan untuk setiap aturan yang didefinisikan di TODO_LIST_RULES
  // Catatan: Di kode Anda tertulis TODO_FIELD_RULES, pastikan namanya sama dengan variabel di atas
  for (const rule of TODO_LIST_RULES) {
    const value = data[rule.field]; // Ambil nilai dari data berdasarkan field aturan

    // Cek apakah field tersebut ada isinya (bukan undefined, null, atau string kosong)
    const fieldPresent = value !== undefined && value !== null && value !== "";

    // Jika bukan operasi UPDATE (artinya CREATE) dan field wajib tapi tidak ada, catat error
    if (!isUpdate && rule.required && !fieldPresent) {
      errors.push(`Field '${rule.field}' is required`);
      continue; // Lewati pengecekan lainnya untuk field ini
    }

    // Jika field tidak ada isinya dan tidak wajib, lewati pengecekan tipe data
    if (!fieldPresent) continue;

    // --- Validasi Tipe BOOLEAN ---
    if (rule.type === "boolean") {
      if (typeof value !== "boolean") {
        errors.push(`Field '${rule.field}' must be a boolean (true/false)`);
        continue;
      }
    }
    // --- Validasi Tipe STRING ---
    else if (rule.type === "string") {
      if (typeof value !== "string") {
        errors.push(`Field '${rule.field}' must be a string`);
        continue;
      }
      // Cek panjang karakter maksimal
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(
          `Field '${rule.field}' must not exceed ${rule.maxLength} characters`,
        );
      }
      // Cek apakah nilai termasuk dalam daftar yang diperbolehkan (Enum)
      if (rule.allowedValues && !rule.allowedValues.includes(value)) {
        errors.push(
          `Field '${rule.field}' must be one of: ${rule.allowedValues.join(", ")}`,
        );
      }
      // Cek validitas format tanggal jika flag isDate bernilai true
      if (rule.isDate) {
        const parsed = Date.parse(value); // Mencoba memparsing string ke tanggal
        if (isNaN(parsed)) {
          // Jika hasilnya NaN, berarti format tanggal salah
          errors.push(`Field '${rule.field}' must be a valid ISO date string`);
        }
      }
    }
  }

  // Jika terdapat error di dalam array, lempar error object dengan status 400
  if (errors.length > 0) {
    const err = new Error("Validation failed: " + errors.join("; "));
    err.statusCode = 400; // Standar HTTP status untuk Client Error
    err.validationErrors = errors; // Lampirkan detail error agar bisa dibaca di frontend
    throw err;
  }

  return true; // Jika semua lolos, kembalikan true
}

export function validateId(id) {
  // Cek apakah ID ada, bertipe string, dan tidak hanya berisi spasi
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    const err = new Error(
      "Precondition violated: 'id' parameter must be a non-empty string",
    );
    err.statusCode = 400;
    throw err;
  }

  // Keamanan tambahan: Membatasi panjang ID untuk mencegah serangan tertentu (misal: DoS via string panjang)
  if (id.length > 1500) {
    const err = new Error("Precondition violated: 'id' parameter is too long");
    err.statusCode = 400;
    throw err;
  }

  return true;
}
