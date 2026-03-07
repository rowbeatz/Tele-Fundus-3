import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { createServer as createViteServer } from "vite";
import { z } from "zod";
import { createApiRouter } from "./server/routes";

const db = new Database("telefundus.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL,
    changed_by TEXT,
    changes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TRIGGER IF NOT EXISTS update_screenings_updated_at
  AFTER UPDATE ON screenings
  BEGIN
    UPDATE screenings SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
  END;

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

  CREATE TABLE IF NOT EXISTS client_orders (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    order_date TEXT NOT NULL,
    status TEXT NOT NULL,
    total_amount INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(organization_id) REFERENCES organizations(id)
  );

  CREATE TABLE IF NOT EXISTS case_discussions (
    id TEXT PRIMARY KEY,
    screening_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(screening_id) REFERENCES screenings(id)
  );

  CREATE TABLE IF NOT EXISTS discussion_comments (
    id TEXT PRIMARY KEY,
    discussion_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(discussion_id) REFERENCES case_discussions(id)
  );

  CREATE TABLE IF NOT EXISTS billing_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_price INTEGER NOT NULL,
    volume_discount_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payout_tiers (
    id TEXT PRIMARY KEY,
    rank TEXT NOT NULL,
    base_rate INTEGER NOT NULL,
    night_multiplier REAL DEFAULT 1.2,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    permissions_json TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
  app.use("/api", createApiRouter(db));










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
