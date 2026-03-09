import { Database } from "better-sqlite3";
import fs from "fs";
import { parse } from "csv-parse/sync";
import AdmZip from "adm-zip";
import path from "path";

export class ScreeningService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // ... existing methods ...

  async processBatch(csvPath: string, zipPath?: string) {
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      from_line: 1, // Skip the description line if it exists
    }) as any[];

    // If the first record looks like the description line (contains "患者ID"), skip it
    const filteredRecords = records[0]?.examinee_number === "患者ID" ? records.slice(1) : records;

    let zip: AdmZip | null = null;
    if (zipPath) {
      zip = new AdmZip(zipPath);
    }

    let count = 0;
    this.db.transaction(() => {
      for (const record of filteredRecords) {
        const examineeId = `pat-${Date.now()}-${count}`;
        const screeningId = `scr-${Date.now()}-${count}`;

        // Upsert examinee
        this.db.prepare(`
          INSERT INTO examinees (id, examinee_number, name, gender, birth_date, blood_pressure_systolic, blood_pressure_diastolic, has_diabetes, has_hypertension)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(examinee_number) DO UPDATE SET 
            name=excluded.name,
            gender=excluded.gender,
            birth_date=excluded.birth_date,
            blood_pressure_systolic=excluded.blood_pressure_systolic,
            blood_pressure_diastolic=excluded.blood_pressure_diastolic,
            has_diabetes=excluded.has_diabetes,
            has_hypertension=excluded.has_hypertension
        `).run(
          examineeId,
          record.examinee_number,
          record.name,
          record.gender,
          record.birth_date,
          record.blood_pressure_systolic || null,
          record.blood_pressure_diastolic || null,
          record.has_diabetes === "1" ? 1 : 0,
          record.has_hypertension === "1" ? 1 : 0
        );

        const actualExaminee = this.db
          .prepare("SELECT id FROM examinees WHERE examinee_number = ?")
          .get(record.examinee_number) as { id: string };

        this.db.prepare(`
          INSERT INTO screenings (id, examinee_id, organization_id, screening_date, urgency_flag, chief_complaint)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          screeningId,
          actualExaminee.id,
          record.organization_id || "org-1",
          record.screening_date,
          record.urgency_flag === "1" ? 1 : 0,
          record.chief_complaint
        );

        // Handle images from ZIP if provided
        if (zip) {
          const sides = ["R", "L"];
          for (const side of sides) {
            const fileName = `${record.examinee_number}_${side}.jpg`;
            const entry = zip.getEntry(fileName);
            if (entry) {
              // In a real app, we would save the file to storage (S3, etc.)
              // Here we'll just use a mock URL but acknowledge the file exists
              this.db.prepare(
                "INSERT INTO screening_images (id, screening_id, eye_side, url) VALUES (?, ?, ?, ?)"
              ).run(
                `img-${Date.now()}-${count}-${side}`,
                screeningId,
                side === "R" ? "right" : "left",
                `https://picsum.photos/seed/${record.examinee_number}_${side}/800/800`
              );
            }
          }
        }
        count++;
      }
    })();

    // Cleanup uploaded files
    fs.unlinkSync(csvPath);
    if (zipPath) fs.unlinkSync(zipPath);

    return count;
  }

  getAllScreenings(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = `
      SELECT s.*, e.name as patient_name, e.examinee_number, o.name as organization_name, ph.name as physician_name
      FROM screenings s
      JOIN examinees e ON s.examinee_id = e.id
      JOIN organizations o ON s.organization_id = o.id
      LEFT JOIN physicians ph ON s.physician_id = ph.id
    `;
    const conditions: string[] = [];
    const params: Array<string | number> = [];

    if (filters?.status) {
      conditions.push("s.status = ?");
      params.push(filters.status);
    }

    if (filters?.search) {
      conditions.push("(LOWER(e.name) LIKE ? OR LOWER(e.examinee_number) LIKE ? OR LOWER(o.name) LIKE ?)");
      const searchValue = `%${filters.search.toLowerCase()}%`;
      params.push(searchValue, searchValue, searchValue);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY s.created_at DESC";

    if (filters?.limit !== undefined) {
      query += " LIMIT ?";
      params.push(filters.limit);
    }

    if (filters?.offset !== undefined) {
      query += " OFFSET ?";
      params.push(filters.offset);
    }

    return this.db.prepare(query).all(...params);
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
        "INSERT INTO audit_logs (id, table_name, record_id, action, changed_by, changes) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(`log-${Date.now()}`, "screenings", id, "UPDATE", userId, JSON.stringify(data));
      
      return info;
    })();
  }
}
