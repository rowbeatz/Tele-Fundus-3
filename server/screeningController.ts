import { Request, Response } from "express";
import { ScreeningService } from "./screeningService";
import { Database } from "better-sqlite3";
import { z } from "zod";

export class ScreeningController {
  private service: ScreeningService;

  constructor(db: Database) {
    this.service = new ScreeningService(db);
  }

  getAll = (req: Request, res: Response) => {
    const screenings = this.service.getAllScreenings();
    res.json(screenings);
  };

  getById = (req: Request, res: Response) => {
    const screening = this.service.getScreeningById(req.params.id);
    if (!screening) return res.status(404).json({ error: "Not found" });
    res.json(screening);
  };

  update = (req: Request, res: Response) => {
    const screeningUpdateSchema = z.object({
      status: z.string().optional(),
      physician_id: z.string().nullable().optional(),
      judgment_code: z.string().optional(),
      findings_right: z.string().optional(),
      findings_left: z.string().optional(),
      recommend_referral: z.union([z.boolean(), z.number()]).optional(),
      recommend_retest: z.union([z.boolean(), z.number()]).optional(),
      physician_comment: z.string().optional(),
      urgency_flag: z.number().optional(),
    });

    const result = screeningUpdateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    // TODO: Get actual userId from session/token
    const userId = "system";

    const info = this.service.updateScreening(req.params.id, result.data, userId);
    if (info.changes === 0) {
      return res.status(404).json({ error: "Screening not found" });
    }
    res.json({ success: true });
  };

  batchUpload = async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const csvFile = files["csv"]?.[0];
    const zipFile = files["zip"]?.[0];

    if (!csvFile) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    try {
      const count = await this.service.processBatch(csvFile.path, zipFile?.path);
      res.json({ success: true, count });
    } catch (error) {
      console.error("Batch processing error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal server error" });
    }
  };
}
