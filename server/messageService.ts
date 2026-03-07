import { Database } from "better-sqlite3";

export class MessageService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  addMessage(screeningId: string, data: any) {
    const { sender, content } = data;
    const msgId = `msg-${Date.now()}`;
    this.db.prepare(
      "INSERT INTO screening_messages (id, screening_id, sender, content) VALUES (?, ?, ?, ?)",
    ).run(msgId, screeningId, sender, content);

    return this.db
      .prepare("SELECT * FROM screening_messages WHERE id = ?")
      .get(msgId);
  }
}
