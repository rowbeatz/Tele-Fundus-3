import { Request, Response } from "express";
import { QcReviewService } from "./qcReviewService";
import { Database } from "better-sqlite3";

export class QcReviewController {
  private service: QcReviewService;

  constructor(db: Database) {
    this.service = new QcReviewService(db);
  }

  create = (req: Request, res: Response) => {
    const result = this.service.createReview(req.params.id, req.body);
    res.json({ success: true, id: result.id });
  };
}
