import { Router, type IRouter } from "express";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db, movementsTable, categoriesTable } from "@workspace/db";
import {
  GetDashboardSummaryQueryParams,
  GetDashboardSummaryResponse,
  GetMonthlyTrendResponse,
  GetByCategoryQueryParams,
  GetByCategoryResponse,
  GetRecentMovementsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getPeriodDates(period: string): { startDate: string | null; endDate: string | null } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  if (period === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    const startDate = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    return { startDate, endDate: today };
  }
  if (period === "month") {
    const startDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
    return { startDate, endDate: today };
  }
  if (period === "year") {
    const startDate = `${now.getFullYear()}-01-01`;
    return { startDate, endDate: today };
  }
  return { startDate: null, endDate: null };
}

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const params = GetDashboardSummaryQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }

  const period = params.data.period ?? "month";
  const { startDate, endDate } = getPeriodDates(period);

  const conditions = [];
  if (startDate) conditions.push(gte(movementsTable.date, startDate));
  if (endDate) conditions.push(lte(movementsTable.date, endDate));

  const baseQuery = db.select({
    type: movementsTable.type,
    amount: movementsTable.amount,
  }).from(movementsTable);

  const rows = conditions.length > 0
    ? await baseQuery.where(and(...conditions))
    : await baseQuery;

  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const row of rows) {
    const amount = parseFloat(row.amount);
    if (row.type === "income") {
      totalIncome += amount;
      incomeCount++;
    } else {
      totalExpense += amount;
      expenseCount++;
    }
  }

  const summary = {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    incomeCount,
    expenseCount,
    period,
  };

  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/dashboard/monthly-trend", async (_req, res): Promise<void> => {
  // Get last 6 months
  const months: { label: string; startDate: string; endDate: string }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const pad = (n: number) => String(n).padStart(2, "0");
    const lastDay = new Date(year, month, 0).getDate();
    months.push({
      label: `${year}-${pad(month)}`,
      startDate: `${year}-${pad(month)}-01`,
      endDate: `${year}-${pad(month)}-${pad(lastDay)}`,
    });
  }

  const allRows = await db
    .select({ type: movementsTable.type, amount: movementsTable.amount, date: movementsTable.date })
    .from(movementsTable)
    .where(
      and(
        gte(movementsTable.date, months[0].startDate),
        lte(movementsTable.date, months[months.length - 1].endDate)
      )
    );

  const trend = months.map(({ label, startDate, endDate }) => {
    let income = 0;
    let expense = 0;
    for (const row of allRows) {
      if (row.date >= startDate && row.date <= endDate) {
        const amount = parseFloat(row.amount);
        if (row.type === "income") income += amount;
        else expense += amount;
      }
    }
    return { month: label, income, expense };
  });

  res.json(GetMonthlyTrendResponse.parse(trend));
});

router.get("/dashboard/by-category", async (req, res): Promise<void> => {
  const params = GetByCategoryQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }

  const type = params.data.type ?? "expense";
  const period = params.data.period ?? "month";
  const { startDate, endDate } = getPeriodDates(period);

  const conditions = [eq(movementsTable.type, type)];
  if (startDate) conditions.push(gte(movementsTable.date, startDate));
  if (endDate) conditions.push(lte(movementsTable.date, endDate));

  const rows = await db
    .select({
      categoryId: movementsTable.categoryId,
      categoryName: categoriesTable.name,
      color: categoriesTable.color,
      amount: movementsTable.amount,
    })
    .from(movementsTable)
    .leftJoin(categoriesTable, eq(movementsTable.categoryId, categoriesTable.id))
    .where(and(...conditions));

  // Group by category
  const grouped: Record<string, { categoryId: number | null; categoryName: string; color: string; total: number; count: number }> = {};

  for (const row of rows) {
    const key = row.categoryId != null ? String(row.categoryId) : "uncategorized";
    if (!grouped[key]) {
      grouped[key] = {
        categoryId: row.categoryId,
        categoryName: row.categoryName ?? "Sin categoría",
        color: row.color ?? "#94a3b8",
        total: 0,
        count: 0,
      };
    }
    grouped[key].total += parseFloat(row.amount);
    grouped[key].count++;
  }

  const grandTotal = Object.values(grouped).reduce((acc, g) => acc + g.total, 0);

  const breakdown = Object.values(grouped).map((g) => ({
    ...g,
    percentage: grandTotal > 0 ? Math.round((g.total / grandTotal) * 100 * 100) / 100 : 0,
  }));

  res.json(GetByCategoryResponse.parse(breakdown));
});

router.get("/dashboard/recent", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: movementsTable.id,
      type: movementsTable.type,
      amount: movementsTable.amount,
      description: movementsTable.description,
      date: movementsTable.date,
      categoryId: movementsTable.categoryId,
      categoryName: categoriesTable.name,
      categoryColor: categoriesTable.color,
      notes: movementsTable.notes,
      createdAt: movementsTable.createdAt,
    })
    .from(movementsTable)
    .leftJoin(categoriesTable, eq(movementsTable.categoryId, categoriesTable.id))
    .orderBy(sql`${movementsTable.date} DESC, ${movementsTable.createdAt} DESC`)
    .limit(10);

  const movements = rows.map((row) => ({
    id: row.id,
    type: row.type,
    amount: parseFloat(row.amount),
    description: row.description,
    date: row.date,
    categoryId: row.categoryId ?? null,
    categoryName: row.categoryName ?? null,
    categoryColor: row.categoryColor ?? null,
    notes: row.notes ?? null,
    createdAt: row.createdAt.toISOString(),
  }));

  res.json(GetRecentMovementsResponse.parse(movements));
});

export default router;
