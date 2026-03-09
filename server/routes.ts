import { Router } from "express";
import { Database } from "better-sqlite3";
import { z } from "zod";
import multer from "multer";
import { ScreeningController } from "./screeningController";
import { QcReviewController } from "./qcReviewController";
import { MessageController } from "./messageController";
import { BillingController } from "./billingController";

const upload = multer({ dest: "uploads/" });

export function createApiRouter(db: Database) {
  const router = Router();
  const screeningController = new ScreeningController(db);
  const qcReviewController = new QcReviewController(db);
  const messageController = new MessageController(db);
  const billingController = new BillingController(db);

  // 1. Dashboard Stats
  router.get("/stats", (req, res) => {
    const total = db
      .prepare("SELECT COUNT(*) as count FROM screenings")
      .get() as { count: number };
    const unassigned = db
      .prepare(
        "SELECT COUNT(*) as count FROM screenings WHERE status IN ('registered', 'submitted')",
      )
      .get() as { count: number };
    const reading = db
      .prepare(
        "SELECT COUNT(*) as count FROM screenings WHERE status = 'assigned'",
      )
      .get() as { count: number };
    const qc = db
      .prepare(
        "SELECT COUNT(*) as count FROM screenings WHERE status = 'reading_completed'",
      )
      .get() as { count: number };
    const completed = db
      .prepare(
        "SELECT COUNT(*) as count FROM screenings WHERE status IN ('completed', 'confirmed')",
      )
      .get() as { count: number };
    const urgent = db
      .prepare("SELECT COUNT(*) as count FROM screenings WHERE urgency_flag = 1")
      .get() as { count: number };
    const physicians = db
      .prepare("SELECT COUNT(*) as count FROM physicians")
      .get() as { count: number };

    res.json({
      total: total.count,
      unassigned: unassigned.count,
      reading: reading.count,
      qc: qc.count,
      completed: completed.count,
      urgent: urgent.count,
      physicians: physicians.count,
    });
  });

  // 2. Screenings List
  router.get("/screenings", screeningController.getAll);

  // 3. Create Screening (Registration)
  router.post("/screenings", (req, res) => {
    const {
      examinee_number,
      name,
      gender,
      birth_date,
      screening_date,
      urgency_flag,
      chief_complaint,
      organization_id,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      has_diabetes,
      has_hypertension,
    } = req.body;

    const examineeId = `pat-${Date.now()}`;
    const screeningId = `scr-${Date.now()}`;

    db.transaction(() => {
      // Upsert examinee
      db.prepare(
        `
        INSERT INTO examinees (id, examinee_number, name, gender, birth_date, blood_pressure_systolic, blood_pressure_diastolic, has_diabetes, has_hypertension)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(examinee_number) DO UPDATE SET 
          name=excluded.name,
          blood_pressure_systolic=excluded.blood_pressure_systolic,
          blood_pressure_diastolic=excluded.blood_pressure_diastolic,
          has_diabetes=excluded.has_diabetes,
          has_hypertension=excluded.has_hypertension
      `,
      ).run(
        examineeId,
        examinee_number,
        name,
        gender,
        birth_date,
        blood_pressure_systolic || null,
        blood_pressure_diastolic || null,
        has_diabetes ? 1 : 0,
        has_hypertension ? 1 : 0,
      );

      // Get actual examinee ID if it existed
      const actualExaminee = db
        .prepare("SELECT id FROM examinees WHERE examinee_number = ?")
        .get(examinee_number) as { id: string };

      db.prepare(
        `
        INSERT INTO screenings (id, examinee_id, organization_id, screening_date, urgency_flag, chief_complaint)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      ).run(
        screeningId,
        actualExaminee.id,
        organization_id || "org-1",
        screening_date,
        urgency_flag ? 1 : 0,
        chief_complaint,
      );

      // Add mock images
      const insertImg = db.prepare(
        "INSERT INTO screening_images (id, screening_id, eye_side, url) VALUES (?, ?, ?, ?)",
      );
      insertImg.run(
        `img-${Date.now()}-R`,
        screeningId,
        "right",
        "https://picsum.photos/seed/eye_right/800/800",
      );
      insertImg.run(
        `img-${Date.now()}-L`,
        screeningId,
        "left",
        "https://picsum.photos/seed/eye_left/800/800",
      );
    })();

    res.json({ success: true, id: screeningId });
  });

  // Batch Upload
  router.post(
    "/screenings/batch",
    upload.fields([{ name: "csv", maxCount: 1 }, { name: "zip", maxCount: 1 }]),
    screeningController.batchUpload
  );

  // 4. Get Single Screening (Viewer)
  router.get("/screenings/:id", screeningController.getById);

  // 5. Update Screening (Report / Assign / QC)
  router.patch("/screenings/:id", screeningController.update);

  // 5.1 QC Review
  router.post("/screenings/:id/reviews", qcReviewController.create);

  // 6. Add Message
  router.post("/screenings/:id/messages", messageController.add);

  // 7. Get Physicians
  router.get("/physicians", (req, res) => {
    const physicians = db.prepare("SELECT * FROM physicians").all();
    res.json(physicians);
  });

  // 7.1 Add Physician
  router.post("/physicians", (req, res) => {
    const { name, rank, base_rate } = req.body;
    const id = `phy-${Date.now()}`;
    db.prepare("INSERT INTO physicians (id, name, rank, base_rate) VALUES (?, ?, ?, ?)")
      .run(id, name, rank, base_rate);
    res.json({ success: true, id });
  });

  // 8. Get Organizations
  router.get("/organizations", (req, res) => {
    const orgs = db.prepare("SELECT * FROM organizations").all();
    res.json(orgs);
  });

  // 9. Billing Summary
  router.get("/billing", billingController.getSummary);

  // 9.1 Finalize Billing
  router.post("/billing/finalize", billingController.finalize);

  return router;
}
