import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { createServer as createViteServer } from "vite";
import { z } from "zod";

const db = new Database("telefundus.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_price INTEGER DEFAULT 800
  );

  CREATE TABLE IF NOT EXISTS physicians (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rank TEXT NOT NULL,
    base_rate INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS examinees (
    id TEXT PRIMARY KEY,
    examinee_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    gender TEXT,
    birth_date TEXT,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    has_diabetes INTEGER DEFAULT 0,
    has_hypertension INTEGER DEFAULT 0,
    has_dyslipidemia INTEGER DEFAULT 0,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS screenings (
    id TEXT PRIMARY KEY,
    examinee_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    physician_id TEXT,
    screening_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted',
    urgency_flag INTEGER DEFAULT 0,
    chief_complaint TEXT,
    judgment_code TEXT,
    findings_right TEXT,
    findings_left TEXT,
    recommend_referral INTEGER DEFAULT 0,
    recommend_retest INTEGER DEFAULT 0,
    physician_comment TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(examinee_id) REFERENCES examinees(id),
    FOREIGN KEY(organization_id) REFERENCES organizations(id),
    FOREIGN KEY(physician_id) REFERENCES physicians(id)
  );

  CREATE TABLE IF NOT EXISTS reading_reviews (
    id TEXT PRIMARY KEY,
    screening_id TEXT NOT NULL,
    reviewer_id TEXT,
    checklist_json TEXT,
    review_comment TEXT,
    result TEXT, -- approved/rejected
    reviewed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(screening_id) REFERENCES screenings(id)
  );

  CREATE TABLE IF NOT EXISTS screening_images (
    id TEXT PRIMARY KEY,
    screening_id TEXT NOT NULL,
    eye_side TEXT NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY(screening_id) REFERENCES screenings(id)
  );

  CREATE TABLE IF NOT EXISTS screening_messages (
    id TEXT PRIMARY KEY,
    screening_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(screening_id) REFERENCES screenings(id)
  );
`);

// Seed Initial Data if empty
const orgCount = db
  .prepare("SELECT COUNT(*) as count FROM organizations")
  .get() as { count: number };
if (orgCount.count === 0) {
  const insertOrg = db.prepare(
    "INSERT INTO organizations (id, name, base_price) VALUES (?, ?, ?)",
  );
  insertOrg.run("org-1", "東京第一健診センター", 1000);
  insertOrg.run("org-2", "新宿メディカルクリニック", 900);

  const insertPhysician = db.prepare(
    "INSERT INTO physicians (id, name, rank, base_rate) VALUES (?, ?, ?, ?)",
  );
  insertPhysician.run("phy-1", "田中 太郎 (指導医)", "指導医", 600);
  insertPhysician.run("phy-2", "鈴木 花子 (専門医)", "専門医", 500);
  insertPhysician.run("phy-3", "佐藤 次郎 (一般医)", "一般医", 400);

  // Seed sample examinees and screenings
  const insertExaminee = db.prepare("INSERT INTO examinees (id, examinee_number, name, gender, birth_date, blood_pressure_systolic, blood_pressure_diastolic, has_diabetes, has_hypertension) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  insertExaminee.run("pat-1", "PT-2024-001", "山田 太郎", "male", "1980-05-15", 135, 85, 1, 1);
  insertExaminee.run("pat-2", "PT-2024-002", "佐藤 花子", "female", "1992-11-20", 118, 76, 0, 0);
  insertExaminee.run("pat-3", "PT-2024-003", "鈴木 一郎", "male", "1975-03-10", 145, 92, 0, 1);

  const insertScreening = db.prepare("INSERT INTO screenings (id, examinee_id, organization_id, physician_id, screening_date, status, urgency_flag, chief_complaint, judgment_code, findings_right, findings_left, recommend_referral, recommend_retest) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  insertScreening.run("scr-1", "pat-1", "org-1", null, "2024-10-25", "submitted", 1, "飛蚊症", null, null, null, 0, 0);
  insertScreening.run("scr-2", "pat-2", "org-2", "phy-1", "2024-10-26", "assigned", 0, "健康診断", null, null, null, 0, 0);
  insertScreening.run("scr-3", "pat-3", "org-1", "phy-2", "2024-10-24", "completed", 0, "糖尿病網膜症の経過観察", "B", "軽度の出血あり", "異常なし", 0, 1);

  const insertImage = db.prepare("INSERT INTO screening_images (id, screening_id, eye_side, url) VALUES (?, ?, ?, ?)");
  insertImage.run("img-1-r", "scr-1", "right", "https://picsum.photos/seed/fundus1/800/800");
  insertImage.run("img-1-l", "scr-1", "left", "https://picsum.photos/seed/fundus2/800/800");
  insertImage.run("img-2-r", "scr-2", "right", "https://picsum.photos/seed/fundus3/800/800");
  insertImage.run("img-2-l", "scr-2", "left", "https://picsum.photos/seed/fundus4/800/800");
  insertImage.run("img-3-r", "scr-3", "right", "https://picsum.photos/seed/fundus5/800/800");
  insertImage.run("img-3-l", "scr-3", "left", "https://picsum.photos/seed/fundus6/800/800");
}

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  // 1. Dashboard Stats
  app.get("/api/stats", (req, res) => {
    const total = db
      .prepare("SELECT COUNT(*) as count FROM screenings")
      .get() as { count: number };
    const pending = db
      .prepare(
        "SELECT COUNT(*) as count FROM screenings WHERE status IN ('submitted', 'draft', 'saved')",
      )
      .get() as { count: number };
    const completed = db
      .prepare(
        "SELECT COUNT(*) as count FROM screenings WHERE status IN ('completed', 'confirmed')",
      )
      .get() as { count: number };
    const physicians = db
      .prepare("SELECT COUNT(*) as count FROM physicians")
      .get() as { count: number };

    res.json({
      total: total.count,
      pending: pending.count,
      completed: completed.count,
      physicians: physicians.count,
    });
  });

  // 2. Screenings List
  app.get("/api/screenings", (req, res) => {
    const screenings = db
      .prepare(
        `
      SELECT s.*, e.name as patient_name, e.examinee_number, o.name as organization_name, ph.name as physician_name
      FROM screenings s
      JOIN examinees e ON s.examinee_id = e.id
      JOIN organizations o ON s.organization_id = o.id
      LEFT JOIN physicians ph ON s.physician_id = ph.id
      ORDER BY s.created_at DESC
    `,
      )
      .all();
    res.json(screenings);
  });

  // 3. Create Screening (Registration)
  app.post("/api/screenings", (req, res) => {
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

  // 4. Get Single Screening (Viewer)
  app.get("/api/screenings/:id", (req, res) => {
    const screening = db
      .prepare(
        `
      SELECT s.*, e.name as patient_name, e.examinee_number, e.gender, e.birth_date, 
             e.blood_pressure_systolic, e.blood_pressure_diastolic, e.has_diabetes, e.has_hypertension,
             o.name as organization_name
      FROM screenings s
      JOIN examinees e ON s.examinee_id = e.id
      JOIN organizations o ON s.organization_id = o.id
      WHERE s.id = ?
    `,
      )
      .get(req.params.id) as any;

    if (!screening) return res.status(404).json({ error: "Not found" });

    const images = db
      .prepare("SELECT * FROM screening_images WHERE screening_id = ?")
      .all(req.params.id);
    const messages = db
      .prepare(
        "SELECT * FROM screening_messages WHERE screening_id = ? ORDER BY created_at ASC",
      )
      .all(req.params.id);
    const reviews = db
      .prepare("SELECT * FROM reading_reviews WHERE screening_id = ? ORDER BY reviewed_at DESC")
      .all(req.params.id);

    res.json({ ...screening, images, messages, reviews });
  });

  // 5. Update Screening (Report / Assign / QC)
  app.patch("/api/screenings/:id", (req, res) => {
    const {
      status,
      physician_id,
      judgment_code,
      findings_right,
      findings_left,
      recommend_referral,
      recommend_retest,
      physician_comment,
    } = req.body;

    let query = "UPDATE screenings SET updated_at = CURRENT_TIMESTAMP";
    const params: any[] = [];

    if (status) {
      query += ", status = ?";
      params.push(status);
    }
    if (physician_id !== undefined) {
      query += ", physician_id = ?";
      params.push(physician_id);
    }
    if (judgment_code !== undefined) {
      query += ", judgment_code = ?";
      params.push(judgment_code);
    }
    if (findings_right !== undefined) {
      query += ", findings_right = ?";
      params.push(findings_right);
    }
    if (findings_left !== undefined) {
      query += ", findings_left = ?";
      params.push(findings_left);
    }
    if (recommend_referral !== undefined) {
      query += ", recommend_referral = ?";
      params.push(recommend_referral ? 1 : 0);
    }
    if (recommend_retest !== undefined) {
      query += ", recommend_retest = ?";
      params.push(recommend_retest ? 1 : 0);
    }
    if (physician_comment !== undefined) {
      query += ", physician_comment = ?";
      params.push(physician_comment);
    }

    query += " WHERE id = ?";
    params.push(req.params.id);

    db.prepare(query).run(...params);
    res.json({ success: true });
  });

  // 5.1 QC Review
  app.post("/api/screenings/:id/reviews", (req, res) => {
    const { reviewer_id, checklist_json, review_comment, result } = req.body;
    const reviewId = `rev-${Date.now()}`;

    db.transaction(() => {
      db.prepare(
        `INSERT INTO reading_reviews (id, screening_id, reviewer_id, checklist_json, review_comment, result)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(reviewId, req.params.id, reviewer_id, JSON.stringify(checklist_json), review_comment, result);

      // Update screening status based on QC result
      const newStatus = result === 'approved' ? 'completed' : 'rejected';
      db.prepare("UPDATE screenings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(newStatus, req.params.id);
    })();

    res.json({ success: true, id: reviewId });
  });

  // 6. Add Message
  app.post("/api/screenings/:id/messages", (req, res) => {
    const { sender, content } = req.body;
    const msgId = `msg-${Date.now()}`;
    db.prepare(
      "INSERT INTO screening_messages (id, screening_id, sender, content) VALUES (?, ?, ?, ?)",
    ).run(msgId, req.params.id, sender, content);

    const newMsg = db
      .prepare("SELECT * FROM screening_messages WHERE id = ?")
      .get(msgId);
    res.json(newMsg);
  });

  // 7. Get Physicians
  app.get("/api/physicians", (req, res) => {
    const physicians = db.prepare("SELECT * FROM physicians").all();
    res.json(physicians);
  });

  // 8. Get Organizations
  app.get("/api/organizations", (req, res) => {
    const orgs = db.prepare("SELECT * FROM organizations").all();
    res.json(orgs);
  });

  // 9. Billing Summary
  app.get("/api/billing", (req, res) => {
    const completed = db
      .prepare("SELECT * FROM screenings WHERE status = 'completed'")
      .all() as any[];

    // Simple mock logic for billing
    const total_revenue =
      completed.length * 1000 +
      completed.filter((s) => s.urgency_flag).length * 500;

    const physician_payouts = db
      .prepare(
        `
      SELECT p.id, p.name, p.rank, COUNT(s.id) as count, p.base_rate as unitPrice, COUNT(s.id) * p.base_rate as payout
      FROM physicians p
      JOIN screenings s ON s.physician_id = p.id
      WHERE s.status = 'completed'
      GROUP BY p.id
    `,
      )
      .all() as any[];

    const total_payout = physician_payouts.reduce(
      (acc: number, curr: any) => acc + Number(curr.payout),
      0,
    ) as number;

    res.json({
      period: "2024-10",
      client_billing: {
        total_count: completed.length,
        base_revenue: completed.length * 1000,
        urgent_count: completed.filter((s) => s.urgency_flag).length,
        urgent_revenue: completed.filter((s) => s.urgency_flag).length * 500,
        total_revenue,
      },
      physician_payouts: {
        total_payout,
        details: physician_payouts,
      },
      financial_summary: {
        gross_margin: total_revenue - total_payout,
        margin_rate:
          total_revenue > 0
            ? ((total_revenue - total_payout) / total_revenue) * 100
            : 0,
      },
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
