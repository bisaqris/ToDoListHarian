// ============================================================
// TEKNIK: Defensive Programming + Design by Contract (DbC)
// Controller bertugas menerima request HTTP, validasi input,
// panggil service, lalu kembalikan response ke client.
// ============================================================

// Ambil semua fungsi dari service layer — controller tidak boleh akses database langsung
// Separation of concerns: controller hanya koordinasi, service yang urus logiknya
import * as service from "../services/todo.service.js";

// [Code Reuse] Ambil fungsi success dan error dari utils
// Dipakai ulang di semua fungsi biar format response selalu konsisten
import { success, error } from "../utils/response.js";

// [DbC — Precondition] Ambil fungsi validasi
// validateId → cek ID dari URL, validateTodoData → cek body request
import { validateId, validateTodoData } from "../utils/validate.js";

// ── CREATE ───────────────────────────────────────────────────
// Fungsi Report Bulanan
export const getStats = async (req, res) => {
  try {
    const stats = await service.getMonthlyStats(req.user);
    success(res, stats, 200, "Monthly statistics retrieved successfully");
  } catch (error) {
    res.status(500).json({success: false, error: error.message});
  }
};

export const create = async (req, res) => {
  try {
    // [DbC — Precondition] Validasi body request dulu sebelum lanjut ke service
    // isUpdate=false artinya mode CREATE — field "title" wajib ada
    // Kalau tidak valid, langsung throw error dan lompat ke catch
    validateTodoData(req.body, false);

    // Kalau validasi lolos, baru lempar data ke service untuk disimpan ke Firestore
    const todo = await service.createTodo(req.body);

    // [DbC — Postcondition] Setelah service jalan, pastikan hasilnya sesuai kontrak
    // Service harus selalu return object dengan id — kalau tidak ada berarti ada bug di service
    if (!todo || !todo.id) {
      throw new Error("Postcondition violated: created todo must have an id");
    }

    // [Code Reuse] Kirim response sukses, status 201 = berhasil membuat data baru
    success(res, todo, 201);
  } catch (err) {
    // Ambil statusCode dari error kalau ada, kalau tidak default ke 400 (Bad Request)
    const code = err.statusCode || 400;

    // [Code Reuse] Kirim response error beserta list detail validasinya kalau ada
    // err.validationErrors berisi array field yang salah dari validate.js
    error(res, err.message, code, err.validationErrors || null);
  }
};

// ── GET ALL ──────────────────────────────────────────────────
export const getAll = async (req, res) => {
  try {
    // Minta service ambil semua todo dari Firestore
    const todos = await service.getTodos();

    // [DbC — Postcondition] Hasil getTodos harus selalu berupa array
    // Walau kosong sekalipun harusnya [], bukan null atau undefined
    // Kalau bukan array berarti ada yang salah di service layer
    if (!Array.isArray(todos)) {
      throw new Error("Postcondition violated: getTodos must return an array");
    }

    // [Code Reuse] Kirim semua data todo sebagai response
    success(res, todos);
  } catch (err) {
    // Kalau ada error di service (misal Firestore down), kirim status 500 (Server Error)
    error(res, err.message, 500);
  }
};

// ── GET BY ID ────────────────────────────────────────────────
export const getById = async (req, res) => {
  try {
    // [DbC — Precondition] Validasi ID dari URL dulu sebelum query ke Firestore
    // req.params.id = ID yang ada di URL, misal /api/todos/abc123 → id = "abc123"
    // Mencegah ID kosong, null, atau terlalu panjang masuk ke database
    validateId(req.params.id);

    // Minta service cari satu todo berdasarkan ID
    const todo = await service.getTodoById(req.params.id);

    // [Defensive Programming] Kalau service return null berarti todo tidak ditemukan
    // Kasih response 404 yang informatif daripada biarkan crash
    // Pakai return supaya kode di bawahnya tidak ikut jalan
    if (!todo) {
      return error(res, `Todo with id '${req.params.id}' not found`, 404);
    }

    // [Code Reuse] Kirim data todo yang ditemukan
    success(res, todo);
  } catch (err) {
    // Pakai statusCode dari error kalau ada (misal 400 dari validateId)
    // Kalau tidak ada, default ke 500
    const code = err.statusCode || 500;
    error(res, err.message, code);
  }
};

// ── UPDATE ───────────────────────────────────────────────────
export const update = async (req, res) => {
  try {
    // [DbC — Precondition] Validasi ID dari URL sebelum apapun dieksekusi
    validateId(req.params.id);

    // [DbC — Precondition] Validasi body request
    // isUpdate=true → mode UPDATE, semua field jadi opsional (boleh kirim sebagian saja)
    validateTodoData(req.body, true);

    // [Defensive Programming] Body tidak boleh kosong saat update
    // Object.keys(req.body).length === 0 artinya body-nya {} — tidak ada yang diupdate
    // Lebih baik tolak langsung daripada kirim request percuma ke Firestore
    if (Object.keys(req.body).length === 0) {
      return error(
        res,
        "Request body must contain at least one field to update",
        400,
      );
    }

    // Kalau semua validasi lolos, minta service update data di Firestore
    await service.updateTodo(req.params.id, req.body);

    // [Code Reuse] Kirim konfirmasi update berhasil — tidak perlu kirim data lengkapnya
    success(res, { message: "Todo updated" });
  } catch (err) {
    const code = err.statusCode || 400;
    // Sertakan detail validasi kalau ada (misal field yang salah tipe datanya)
    error(res, err.message, code, err.validationErrors || null);
  }
};

// ── TRANSITION STATUS ─────────────────────────────────────────
// [Automata] Endpoint khusus untuk pindah state todo
// Tidak sembarang update field — harus lewat state machine di service
// Contoh: PENDING → IN_PROGRESS → DONE
export const transitionStatus = async (req, res) => {
  try {
    // [Automata] Kirim ID todo, event/trigger perpindahan, dan user ke service
    // req.body.event = nama event yang memicu transisi (misal "start", "complete", "cancel")
    // req.user = info user yang login, untuk cek kepemilikan todo
    const todo = await service.transitionTodoStatus(
      req.params.id, // ID todo yang mau dipindah statenya
      req.body.event, // event yang memicu transisi state
      req.user, // siapa yang melakukan aksi ini
    );

    // [Defensive Programming] Kalau service return null, todo tidak ditemukan
    if (!todo) {
      return res.status(404).json({ success: false, error: "Todo not found" });
    }

    // [Code Reuse] Kirim todo dengan state yang sudah berubah
    // Response berisi state baru + data todo terbaru
    success(res, todo);
  } catch (error) {
    // Error bisa dari dua hal:
    // 1. Todo tidak ditemukan
    // 2. Transisi tidak valid (misal coba pindah dari DONE → PENDING yang tidak diizinkan)
    res.status(400).json({ success: false, error: error.message });
  }
};

// ── GET TRANSITIONS ───────────────────────────────────────────
// [Automata] Endpoint untuk lihat transisi/event apa saja yang tersedia dari state todo saat ini
// Berguna untuk frontend — biar tau tombol apa yang perlu ditampilkan
// Misal state PENDING → tampilkan tombol "Mulai" dan "Batalkan"
// Misal state DONE → tidak ada tombol (final state)
export const getTransitions = async (req, res) => {
  try {
    // [Automata] Minta service cek state todo sekarang
    // lalu return daftar event/transisi yang bisa dilakukan dari state tersebut
    // req.user dioper untuk cek kepemilikan todo
    const transitions = await service.getTodoStatusTransitions(
      req.params.id,
      req.user,
    );

    // [Defensive Programming] Kalau service return null, todo tidak ditemukan
    if (!transitions) {
      return res.status(404).json({ success: false, error: "Todo not found" });
    }

    // [Code Reuse] Kirim daftar transisi yang tersedia
    // Contoh response: { currentState: "PENDING", availableEvents: ["start", "cancel"] }
    success(res, transitions);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ── DELETE ───────────────────────────────────────────────────
export const remove = async (req, res) => {
  try {
    // [DbC — Precondition] Validasi ID dari URL dulu sebelum minta service hapus data
    // Nama fungsinya "remove" bukan "delete" karena delete adalah reserved keyword di JavaScript
    validateId(req.params.id);

    // Kalau ID valid, minta service hapus todo dari Firestore
    await service.deleteTodo(req.params.id);

    // [Code Reuse] Kirim konfirmasi bahwa todo berhasil dihapus
    success(res, { message: "Todo deleted" });
  } catch (err) {
    // Kalau todo tidak ditemukan, service akan throw error dengan statusCode 404
    // Kalau ada error lain (misal Firestore error), default ke 500
    const code = err.statusCode || 500;
    error(res, err.message, code);
  }
};
