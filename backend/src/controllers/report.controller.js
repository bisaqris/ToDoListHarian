import * as service from "../services/report.service.js";
import { success, error } from "../utils/response.js";

export const getMonthlyReport = async (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;

    if (month < 1 || month > 12) {
      return error(res, "Parameter month harus antara 1 dan 12", 400);
    }

    const report = await service.getOrGenerateMonthlyReport(
      req.user,
      year,
      month,
    );

    if (!report) {
      return success(
        res,
        {
          year,
          month,
          totalActiveDays: 0,
          avgCompletionPercentage: 0,
          totalTodos: 0,
          totalCompleted: 0,
          mostProductiveDay: null,
          leastProductiveDay: null,
          streakDays: 0,
          recommendations:
            "Belum ada data todo untuk bulan ini. Mulai tambahkan todo harianmu!",
          isEffective: false,
          dailyData: [],
        },
        200,
        "Laporan bulanan berhasil diambil",
      );
    }

    success(res, report, 200, "Laporan bulanan berhasil diambil");
  } catch (err) {
    console.error("[ReportController] getMonthlyReport error:", err);
    error(res, err.message, 500);
  }
};

export const getDailyRecaps = async (req, res) => {
  try {
    const now = new Date();
    const year = req.query.year || now.getFullYear();
    const month = req.query.month || null;

    const recaps = await service.getDailyRecaps(req.user, year, month);
    success(res, recaps, 200, "Data rekap harian berhasil diambil");
  } catch (err) {
    console.error("[ReportController] getDailyRecaps error:", err);
    error(res, err.message, 500);
  }
};

export const getUnfinishedYesterday = async (req, res) => {
  try {
    const todos = await service.getUnfinishedYesterday(req.user);
    success(
      res,
      todos,
      200,
      "Data todo belum selesai kemarin berhasil diambil",
    );
  } catch (err) {
    console.error("[ReportController] getUnfinishedYesterday error:", err);
    error(res, err.message, 500);
  }
};

export const triggerDailyRecap = async (req, res) => {
  try {
    const { date } = req.body;
    const result = await service.runDailyRecap(date || null);
    success(res, result, 200, "Daily recap berhasil dijalankan");
  } catch (err) {
    console.error("[ReportController] triggerDailyRecap error:", err);
    error(res, err.message, 500);
  }
};
