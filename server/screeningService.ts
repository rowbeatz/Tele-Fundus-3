import { Database } from "better-sqlite3";

export class ScreeningService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  getAllScreenings() {
    return this.db
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
  }

  getScreeningById(id: string) {
    const screening = this.db
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
      .get(id) as any;

    if (!screening) return null;

    const images = this.db
      .prepare("SELECT * FROM screening_images WHERE screening_id = ? ORDER BY eye_side DESC")
      .all(id);
    const messages = this.db
      .prepare(
        "SELECT * FROM screening_messages WHERE screening_id = ? ORDER BY created_at ASC",
      )
      .all(id);
    const reviews = this.db
      .prepare("SELECT * FROM reading_reviews WHERE screening_id = ? ORDER BY reviewed_at DESC")
      .all(id);

    return { ...screening, images, messages, reviews };
  }

  updateScreening(id: string, data: any, userId: string = "system") {
    let query = "UPDATE screenings SET updated_at = CURRENT_TIMESTAMP";
    const params: any[] = [];

    if (data.status) {
      query += ", status = ?";
      params.push(data.status);
    }
    if (data.physician_id !== undefined) {
      query += ", physician_id = ?";
      params.push(data.physician_id);
    }
    if (data.judgment_code !== undefined) {
      query += ", judgment_code = ?";
      params.push(data.judgment_code);
    }
    if (data.findings_right !== undefined) {
      query += ", findings_right = ?";
      params.push(data.findings_right);
    }
    if (data.findings_left !== undefined) {
      query += ", findings_left = ?";
      params.push(data.findings_left);
    }
    if (data.recommend_referral !== undefined) {
      query += ", recommend_referral = ?";
      params.push(data.recommend_referral ? 1 : 0);
    }
    if (data.recommend_retest !== undefined) {
      query += ", recommend_retest = ?";
      params.push(data.recommend_retest ? 1 : 0);
    }
    if (data.physician_comment !== undefined) {
      query += ", physician_comment = ?";
      params.push(data.physician_comment);
    }
    if (data.urgency_flag !== undefined) {
      query += ", urgency_flag = ?";
      params.push(data.urgency_flag);
    }

    query += " WHERE id = ?";
    params.push(id);

    return this.db.transaction(() => {
      const info = this.db.prepare(query).run(...params);
      
      // Log audit
      this.db.prepare(
        "INSERT INTO audit_logs (id, user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(`log-${Date.now()}`, userId, "UPDATE", "screenings", id, JSON.stringify(data));
      
      return info;
    })();
  }
}
