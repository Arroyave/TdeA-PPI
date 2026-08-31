import { Router, type IRouter } from "express";
import { eq, and, gte, lte, like, or } from "drizzle-orm";
import { db, movementsTable, categoriesTable } from "@workspace/db";
import {
  CreateMovementBody,
  UpdateMovementBody,
  UpdateMovementParams,
  DeleteMovementParams,
  GetMovementParams,
  ListMovementsQueryParams,
  ListMovementsResponse,
  GetMovementResponse,
  UpdateMovementResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function buildMovementSelect() {
  return db
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
    .leftJoin(categoriesTable, eq(movementsTable.categoryId, categoriesTable.id));
}

function mapMovement(row: {
  id: number;
  type: string;
  amount: string;
  description: string;
  date: string;
  categoryId: number | null;
  categoryName: string | null;
  categoryColor: string | null;
  notes: string | null;
  createdAt: Date;
}) {
  return {
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
  };
}

router.get("/movements", async (req, res): Promise<void> => {
  const params = ListMovementsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }

  const { type, categoryId, startDate, endDate, search } = params.data;

  const conditions = [];
  if (type) conditions.push(eq(movementsTable.type, type));
  if (categoryId) conditions.push(eq(movementsTable.categoryId, categoryId));
  if (startDate) conditions.push(gte(movementsTable.date, startDate));
  if (endDate) conditions.push(lte(movementsTable.date, endDate));
  if (search) {
    conditions.push(
      or(
        like(movementsTable.description, `%${search}%`),
        like(movementsTable.notes, `%${search}%`)
      )
    );
  }

  const query = buildMovementSelect();
  const rows = conditions.length > 0
    ? await query.where(and(...conditions)).orderBy(movementsTable.date)
    : await query.orderBy(movementsTable.date);

  const movements = rows.map(mapMovement);
  res.json(ListMovementsResponse.parse(movements));
});

router.post("/movements", async (req, res): Promise<void> => {
  const parsed = CreateMovementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }

  const [inserted] = await db
    .insert(movementsTable)
    .values({
      type: parsed.data.type,
      amount: String(parsed.data.amount),
      description: parsed.data.description,
      date: parsed.data.date,
      categoryId: parsed.data.categoryId ?? null,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  const [row] = await buildMovementSelect().where(eq(movementsTable.id, inserted.id));
  res.status(201).json(GetMovementResponse.parse(mapMovement(row)));
});

router.get("/movements/:id", async (req, res): Promise<void> => {
  const params = GetMovementParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }

  const [row] = await buildMovementSelect().where(eq(movementsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ message: "Movement not found" });
    return;
  }
  res.json(GetMovementResponse.parse(mapMovement(row)));
});

router.put("/movements/:id", async (req, res): Promise<void> => {
  const params = UpdateMovementParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }

  const parsed = UpdateMovementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }

  await db
    .update(movementsTable)
    .set({
      type: parsed.data.type,
      amount: String(parsed.data.amount),
      description: parsed.data.description,
      date: parsed.data.date,
      categoryId: parsed.data.categoryId ?? null,
      notes: parsed.data.notes ?? null,
    })
    .where(eq(movementsTable.id, params.data.id));

  const [row] = await buildMovementSelect().where(eq(movementsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ message: "Movement not found" });
    return;
  }
  res.json(UpdateMovementResponse.parse(mapMovement(row)));
});

router.delete("/movements/:id", async (req, res): Promise<void> => {
  const params = DeleteMovementParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ message: params.error.message });
    return;
  }
  await db.delete(movementsTable).where(eq(movementsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
