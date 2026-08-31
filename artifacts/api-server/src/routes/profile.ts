import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profileTable } from "@workspace/db";
import { UpdateProfileBody, GetProfileResponse, UpdateProfileResponse } from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrCreateProfile() {
  const profiles = await db.select().from(profileTable).limit(1);
  if (profiles.length > 0) return profiles[0];
  const [profile] = await db
    .insert(profileTable)
    .values({ name: "Mi Cuenta", type: "personal", currency: "USD" })
    .returning();
  return profile;
}

router.get("/profile", async (_req, res): Promise<void> => {
  const profile = await getOrCreateProfile();
  res.json(GetProfileResponse.parse(profile));
});

router.put("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  const existing = await getOrCreateProfile();
  const [updated] = await db
    .update(profileTable)
    .set(parsed.data)
    .where(eq(profileTable.id, existing.id))
    .returning();
  res.json(UpdateProfileResponse.parse(updated));
});

export default router;
