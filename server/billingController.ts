import { Request, Response } from "express";
import { BillingService } from "./billingService";
import { Database } from "better-sqlite3";

export class BillingController {
  private service: BillingService;

  constructor(db: Database) {
    this.service = new BillingService(db);
  }

  getSummary = (req: Request, res: Response) => {
    const summary = this.service.getBillingSummary();
    res.json(summary);
  };

  finalize = (req: Request, res: Response) => {
    const { screening_ids } = req.body;
    const result = this.service.finalizeBilling(screening_ids);
    res.json(result);
  };
}
