import { pool } from "../config/database.js";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const toLocalDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const todayStr = () => toLocalDateString(new Date());

const generateRecommendations = ({
  avgCompletion,
  totalTodos,
  rows,
  streakDays,
}) => {
  const tips = [];

  if (avgCompletion === 0) {
    tips.push(
      "Bulan ini belum ada todo yang tercatat. Mulailah dengan membuat 1-3 todo setiap hari untuk membangun kebiasaan produktif.",
    );
  } else if (avgCompletion < 40) {
    tips.push(
      "Tingkat penyelesaian todomu bulan ini masih di bawah 40%. Coba kurangi jumlah todo per hari agar target lebih realistis dan tidak overwhelmed.",
    );
  } else if (avgCompletion < 60) {
    tips.push(
      "Kamu sudah mulai aktif, namun masih ada ruang untuk berkembang. Fokus pada 3 todo paling penting setiap pagi sebelum menambah yang lain.",
    );
  } else if (avgCompletion < 80) {
    tips.push(
      "Produktivitasmu cukup baik! Kamu berhasil menyelesaikan lebih dari separuh todomu. Tingkatkan sedikit lagi untuk mencapai level optimal.",
    );
  } else {
    tips.push(
      "Luar biasa! Tingkat penyelesaian todomu sangat tinggi bulan ini. Kamu adalah pribadi yang sangat produktif dan disiplin.",
    );
  }

  const zeroDays = rows.filter(
    (r) => parseInt(r.total_todos ?? r.total ?? 0) === 0,
  ).length;
  if (zeroDays > 15) {
    tips.push(
      `Ada ${zeroDays} hari tanpa todo sama sekali bulan ini. Konsistensi adalah kunci — coba biasakan membuat minimal 1 todo setiap hari.`,
    );
  } else if (zeroDays > 7) {
    tips.push(
      `Terdapat ${zeroDays} hari tanpa aktivitas todo. Coba set pengingat harian agar kamu tidak melewatkan hari tanpa target.`,
    );
  }

  if (streakDays >= 7) {
    tips.push(
      `Keren! Kamu memiliki streak ${streakDays} hari berturut-turut menyelesaikan todo. Pertahankan momentum ini!`,
    );
  } else if (streakDays >= 3) {
    tips.push(
      `Streak-mu saat ini ${streakDays} hari. Teruskan sampai 7 hari untuk membangun kebiasaan yang kuat.`,
    );
  }

  if (totalTodos > 0) {
    const avgPerDay = (totalTodos / (rows.length || 1)).toFixed(1);
    if (parseFloat(avgPerDay) > 10) {
      tips.push(
        `Rata-rata ${avgPerDay} todo per hari terasa cukup banyak. Pertimbangkan untuk memprioritaskan dan memilih todo yang benar-benar penting.`,
      );
    }
  }

  return tips.join(" | ");
};

const calculateStreak = (rows) => {
  const sorted = [...rows].sort(
    (a, b) =>
      new Date(b.recap_date ?? b.date) - new Date(a.recap_date ?? a.date),
  );
  let streak = 0;
  for (const row of sorted) {
    if (parseInt(row.completed_todos ?? row.completed ?? 0) > 0) streak++;
    else break;
  }
  return streak;
};

// ─────────────────────────────────────────────
// LIVE DATA HARI INI (langsung dari tabel todos)
// ─────────────────────────────────────────────

/**
 * Baca langsung dari tabel todos untuk hari ini — tidak bergantung cron.
 * Digunakan untuk merge ke daily_recap agar kalender & chart selalu real-time.
 */
const getTodayLiveData = async (userId) => {
  const today = todayStr();

  const result = await pool.query(
    `SELECT id, title, description, status, completed, priority, category, due_date, due_time, created_at, updated_at
     FROM todos
     WHERE user_id = $1
       AND (
         due_date = $2
         OR (due_date IS NULL AND DATE(created_at AT TIME ZONE 'Asia/Jakarta') = $2)
       )`,
    [userId, today],
  );

  const todos = result.rows;
  const total = todos.length;
  const completedCount = todos.filter((t) => t.status === "completed").length;
  const unfinished = total - completedCount;
  const percentage =
    total > 0 ? parseFloat(((completedCount / total) * 100).toFixed(2)) : 0;

  return {
    date: today,
    total,
    completed: completedCount,
    unfinished,
    percentage,
    todoDetails: todos,
    isLive: true, // penanda bahwa ini data real-time, bukan dari daily_recap
  };
};

// ─────────────────────────────────────────────
// DAILY RECAP
// ─────────────────────────────────────────────

export const runDailyRecap = async (targetDate = null) => {
  const recapDate =
    targetDate || toLocalDateString(new Date(Date.now() - 86400000));
  console.log(`[DailyRecap] Running recap for date: ${recapDate}`);

  const usersResult = await pool.query(
    `SELECT id FROM users WHERE is_active = true`,
  );
  let successCount = 0;
  let errorCount = 0;

  for (const userRow of usersResult.rows) {
    try {
      await recapForUser(userRow.id, recapDate);
      successCount++;
    } catch (err) {
      console.error(`[DailyRecap] Error for user ${userRow.id}:`, err.message);
      errorCount++;
    }
  }

  console.log(
    `[DailyRecap] Done. Success: ${successCount}, Error: ${errorCount}`,
  );
  return { successCount, errorCount, recapDate };
};

export const recapForUser = async (userId, recapDate) => {
  const todosResult = await pool.query(
    `SELECT id, title, description, status, completed, priority, category, due_date, due_time, created_at, updated_at
     FROM todos
     WHERE user_id = $1
       AND (
         due_date = $2
         OR (due_date IS NULL AND DATE(created_at AT TIME ZONE 'Asia/Jakarta') = $2)
       )`,
    [userId, recapDate],
  );

  const todos = todosResult.rows;
  const total = todos.length;
  const completed = todos.filter((t) => t.status === "completed").length;
  const unfinished = total - completed;
  const percentage =
    total > 0 ? parseFloat(((completed / total) * 100).toFixed(2)) : 0;

  await pool.query(
    `INSERT INTO daily_recap
       (user_id, recap_date, total_todos, completed_todos, unfinished_todos, completion_percentage, todo_details)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (user_id, recap_date) DO UPDATE SET
       total_todos = EXCLUDED.total_todos,
       completed_todos = EXCLUDED.completed_todos,
       unfinished_todos = EXCLUDED.unfinished_todos,
       completion_percentage = EXCLUDED.completion_percentage,
       todo_details = EXCLUDED.todo_details`,
    [
      userId,
      recapDate,
      total,
      completed,
      unfinished,
      percentage,
      JSON.stringify(todos),
    ],
  );

  return { recapDate, total, completed, unfinished, percentage };
};

/**
 * Ambil rekap harian dari DB + inject live data hari ini.
 */
export const getDailyRecaps = async (user, year, month) => {
  const params = [user.id];
  let dateFilter = "";

  if (year && month) {
    params.push(year, month);
    dateFilter =
      "AND EXTRACT(YEAR FROM recap_date) = $2 AND EXTRACT(MONTH FROM recap_date) = $3";
  } else if (year) {
    params.push(year);
    dateFilter = "AND EXTRACT(YEAR FROM recap_date) = $2";
  }

  const result = await pool.query(
    `SELECT recap_date, total_todos, completed_todos, unfinished_todos, completion_percentage, todo_details
     FROM daily_recap
     WHERE user_id = $1 ${dateFilter}
     ORDER BY recap_date ASC`,
    params,
  );

  const rows = result.rows.map((r) => ({
    date: toLocalDateString(r.recap_date),
    total: parseInt(r.total_todos),
    completed: parseInt(r.completed_todos),
    unfinished: parseInt(r.unfinished_todos),
    percentage: parseFloat(r.completion_percentage),
    todoDetails: Array.isArray(r.todo_details) ? r.todo_details : [],
  }));

  // Inject live data hari ini jika bulan yang diminta adalah bulan sekarang
  const now = new Date();
  const reqYear = parseInt(year || now.getFullYear());
  const reqMonth = parseInt(month || now.getMonth() + 1);
  const isCurrentMonth =
    reqYear === now.getFullYear() && reqMonth === now.getMonth() + 1;

  if (isCurrentMonth) {
    const today = todayStr();
    const liveData = await getTodayLiveData(user.id);

    // Hapus entry hari ini dari rows (kalau ada dari cron sebelumnya) lalu ganti dengan live
    const filtered = rows.filter((r) => r.date !== today);
    filtered.push(liveData);
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    return filtered;
  }

  return rows;
};

// ─────────────────────────────────────────────
// MONTHLY REPORT
// ─────────────────────────────────────────────

export const generateMonthlyReport = async (user, year, month) => {
  // 1. Ambil daily_recap dari DB (hari-hari lalu)
  const recapsResult = await pool.query(
    `SELECT * FROM daily_recap
     WHERE user_id = $1
       AND EXTRACT(YEAR FROM recap_date) = $2
       AND EXTRACT(MONTH FROM recap_date) = $3
     ORDER BY recap_date ASC`,
    [user.id, year, month],
  );

  let rows = recapsResult.rows;

  // 2. Inject live data hari ini jika bulan sekarang
  const now = new Date();
  const isCurrentMonth =
    parseInt(year) === now.getFullYear() &&
    parseInt(month) === now.getMonth() + 1;

  let liveToday = null;
  if (isCurrentMonth) {
    liveToday = await getTodayLiveData(user.id);
    // Hapus baris hari ini dari rows DB (kalau ada), ganti dengan live
    const today = todayStr();
    rows = rows.filter((r) => toLocalDateString(r.recap_date) !== today);
  }

  // 3. Ambil todos langsung dari DB untuk metrik total bulan ini
  const todosResult = await pool.query(
    `SELECT id, title, status, completed, priority, category, due_date, created_at
     FROM todos
     WHERE user_id = $1
       AND (
         (EXTRACT(YEAR FROM due_date) = $2 AND EXTRACT(MONTH FROM due_date) = $3)
         OR (due_date IS NULL
             AND EXTRACT(YEAR FROM created_at AT TIME ZONE 'Asia/Jakarta') = $2
             AND EXTRACT(MONTH FROM created_at AT TIME ZONE 'Asia/Jakarta') = $3)
       )`,
    [user.id, year, month],
  );

  const allTodos = todosResult.rows;
  const totalTodos = allTodos.length;
  const totalCompleted = allTodos.filter(
    (t) => t.status === "completed",
  ).length;

  // 4. Gabungkan rows DB + live hari ini untuk hitung metrik harian
  const allDailyRows = [
    ...rows,
    ...(liveToday && liveToday.total > 0
      ? [
          {
            recap_date: liveToday.date,
            total_todos: liveToday.total,
            completed_todos: liveToday.completed,
            completion_percentage: liveToday.percentage,
          },
        ]
      : []),
  ];

  const activeDays = allDailyRows.filter(
    (r) => parseInt(r.total_todos ?? r.total ?? 0) > 0,
  );
  const totalActiveDays = activeDays.length;

  const avgCompletion =
    activeDays.length > 0
      ? parseFloat(
          (
            activeDays.reduce(
              (s, r) =>
                s + parseFloat(r.completion_percentage ?? r.percentage ?? 0),
              0,
            ) / activeDays.length
          ).toFixed(2),
        )
      : 0;

  const mostProductiveRow =
    allDailyRows.length > 0
      ? allDailyRows.reduce((best, r) =>
          parseFloat(r.completion_percentage ?? r.percentage ?? 0) >
          parseFloat(best.completion_percentage ?? best.percentage ?? 0)
            ? r
            : best,
        )
      : null;

  const leastProductiveRow =
    activeDays.length > 0
      ? activeDays.reduce((worst, r) =>
          parseFloat(r.completion_percentage ?? r.percentage ?? 0) <
          parseFloat(worst.completion_percentage ?? worst.percentage ?? 0)
            ? r
            : worst,
        )
      : null;

  const streakDays = calculateStreak(allDailyRows);
  const isEffective = avgCompletion >= 70;
  const recommendations = generateRecommendations({
    avgCompletion,
    totalTodos,
    totalCompleted,
    rows: allDailyRows,
    streakDays,
  });

  // 5. Simpan ke monthly_report (hanya untuk bulan lalu — bulan sekarang selalu fresh)
  if (!isCurrentMonth) {
    await pool.query(
      `INSERT INTO monthly_report
         (user_id, year, month, total_active_days, avg_completion_percentage,
          total_todos, total_completed, most_productive_day, least_productive_day,
          streak_days, recommendations, is_effective, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
       ON CONFLICT (user_id, year, month) DO UPDATE SET
         total_active_days = EXCLUDED.total_active_days,
         avg_completion_percentage = EXCLUDED.avg_completion_percentage,
         total_todos = EXCLUDED.total_todos,
         total_completed = EXCLUDED.total_completed,
         most_productive_day = EXCLUDED.most_productive_day,
         least_productive_day = EXCLUDED.least_productive_day,
         streak_days = EXCLUDED.streak_days,
         recommendations = EXCLUDED.recommendations,
         is_effective = EXCLUDED.is_effective,
         updated_at = NOW()`,
      [
        user.id,
        year,
        month,
        totalActiveDays,
        avgCompletion,
        totalTodos,
        totalCompleted,
        mostProductiveRow
          ? toLocalDateString(
              mostProductiveRow.recap_date ?? mostProductiveRow.date,
            )
          : null,
        leastProductiveRow
          ? toLocalDateString(
              leastProductiveRow.recap_date ?? leastProductiveRow.date,
            )
          : null,
        streakDays,
        recommendations,
        isEffective,
      ],
    );
  }

  // 6. Build dailyData untuk response (gabung DB + live)
  const dbDailyData = rows.map((r) => ({
    date: toLocalDateString(r.recap_date),
    total: parseInt(r.total_todos),
    completed: parseInt(r.completed_todos),
    unfinished: parseInt(r.unfinished_todos),
    percentage: parseFloat(r.completion_percentage),
    todoDetails: Array.isArray(r.todo_details) ? r.todo_details : [],
  }));

  const dailyData = liveToday
    ? [...dbDailyData, liveToday].sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      )
    : dbDailyData;

  return {
    year: parseInt(year),
    month: parseInt(month),
    totalActiveDays,
    avgCompletionPercentage: avgCompletion,
    totalTodos,
    totalCompleted,
    mostProductiveDay: mostProductiveRow
      ? toLocalDateString(
          mostProductiveRow.recap_date ?? mostProductiveRow.date,
        )
      : null,
    leastProductiveDay: leastProductiveRow
      ? toLocalDateString(
          leastProductiveRow.recap_date ?? leastProductiveRow.date,
        )
      : null,
    streakDays,
    recommendations,
    isEffective,
    dailyData,
  };
};

export const getOrGenerateMonthlyReport = async (user, year, month) => {
  const now = new Date();
  const isCurrentMonth =
    parseInt(year) === now.getFullYear() &&
    parseInt(month) === now.getMonth() + 1;

  // Bulan sekarang: selalu generate fresh (agar hari ini masuk)
  if (isCurrentMonth) {
    return generateMonthlyReport(user, year, month);
  }

  // Bulan lalu: coba dari cache DB
  const existing = await pool.query(
    `SELECT * FROM monthly_report WHERE user_id = $1 AND year = $2 AND month = $3`,
    [user.id, year, month],
  );

  if (!existing.rows[0]) {
    return generateMonthlyReport(user, year, month);
  }

  const r = existing.rows[0];
  const dailyData = await getDailyRecaps(user, year, month);

  return {
    year: r.year,
    month: r.month,
    totalActiveDays: r.total_active_days,
    avgCompletionPercentage: parseFloat(r.avg_completion_percentage),
    totalTodos: r.total_todos,
    totalCompleted: r.total_completed,
    mostProductiveDay: r.most_productive_day
      ? toLocalDateString(r.most_productive_day)
      : null,
    leastProductiveDay: r.least_productive_day
      ? toLocalDateString(r.least_productive_day)
      : null,
    streakDays: r.streak_days,
    recommendations: r.recommendations,
    isEffective: r.is_effective,
    dailyData,
  };
};

export const getUnfinishedYesterday = async (user) => {
  const yesterday = toLocalDateString(new Date(Date.now() - 86400000));

  const result = await pool.query(
    `SELECT t.*, c.code AS category_code, c.name AS category_name, s.name AS status_name
     FROM todos t
     LEFT JOIN categories c ON c.id = t.category_id
     LEFT JOIN todo_statuses s ON s.code = t.status
     WHERE t.user_id = $1
       AND t.status != 'completed'
       AND t.status != 'cancelled'
       AND (
         t.due_date = $2
         OR (t.due_date IS NULL AND DATE(t.created_at AT TIME ZONE 'Asia/Jakarta') = $2)
       )
     ORDER BY t.priority DESC, t.created_at ASC`,
    [user.id, yesterday],
  );

  return result.rows.map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    title: row.title,
    description: row.description,
    completed: row.completed,
    status: row.status,
    statusName: row.status_name || row.status,
    priority: row.priority,
    category: row.category_code || row.category,
    categoryName: row.category_name || row.category,
    dueDate: row.due_date ? toLocalDateString(row.due_date) : null,
    dueTime: row.due_time ? row.due_time.slice(0, 5) : "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isOverdue: true,
  }));
};
