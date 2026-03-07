import { Database } from "better-sqlite3";

export class QcReviewService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  createReview(screeningId: string, data: any) {
    const reviewId = `rev-${Date.now()}`;
    const { reviewer_id, checklist_json, review_comment, result } = data;

    this.db.transaction(() => {
      this.db.prepare(
        `INSERT INTO reading_reviews (id, screening_id, reviewer_id, checklist_json, review_comment, result)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(reviewId, screeningId, reviewer_id, JSON.stringify(checklist_json), review_comment, result);

      // Update screening status based on QC result
      const newStatus = result === 'approved' ? 'completed' : 'assigned';
      this.db.prepare("UPDATE screenings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(newStatus, screeningId);
    })();

    return { id: reviewId };
  }
}
