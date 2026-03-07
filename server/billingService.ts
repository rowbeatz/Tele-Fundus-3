import { Database } from "better-sqlite3";

export class BillingService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  getBillingSummary() {
    // 1. Get all completed screenings
    const completed = this.db
      .prepare("SELECT * FROM screenings WHERE status = 'completed'")
      .all() as any[];

    const total_count = completed.length;

    // 2. Client Billing Logic (Volume Discount)
    let base_revenue = 0;
    if (total_count <= 500) {
      base_revenue = total_count * 1000;
    } else if (total_count <= 1000) {
      base_revenue = 500 * 1000 + (total_count - 500) * 900;
    } else {
      base_revenue = 500 * 1000 + 500 * 900 + (total_count - 1000) * 800;
    }

    const urgent_count = completed.filter((s) => s.urgency_flag).length;
    const urgent_revenue = urgent_count * 500;
    
    // Mock AI analysis count for now
    const ai_count = Math.floor(total_count * 0.3); // Assume 30% used AI
    const ai_revenue = ai_count * 200;

    const total_revenue = base_revenue + urgent_revenue + ai_revenue;

    // 3. Physician Payout Logic
    const physician_stats = this.db
      .prepare(
        `
      SELECT 
        p.id, 
        p.name, 
        p.rank, 
        COUNT(s.id) as count, 
        SUM(CASE WHEN s.urgency_flag = 1 THEN 1 ELSE 0 END) as urgent_count
      FROM physicians p
      JOIN screenings s ON s.physician_id = p.id
      WHERE s.status = 'completed'
      GROUP BY p.id
    `,
      )
      .all() as any[];

    const physician_payouts = physician_stats.map((p) => {
      let base_rate = 400; // General
      if (p.rank === '指導医') base_rate = 600;
      else if (p.rank === '専門医') base_rate = 500;

      // Mock night shift (20% of cases done at night)
      const night_count = Math.floor(p.count * 0.2);
      const regular_count = p.count - night_count;

      const regular_payout = regular_count * base_rate;
      const night_payout = night_count * (base_rate * 1.2);
      const total_payout = regular_payout + night_payout;

      return {
        id: p.id,
        name: p.name,
        rank: p.rank,
        count: p.count,
        base_rate,
        regular_count,
        night_count,
        payout: total_payout,
      };
    });

    const total_payout = physician_payouts.reduce(
      (acc: number, curr: any) => acc + curr.payout,
      0,
    );

    return {
      period: new Date().toISOString().slice(0, 7), // YYYY-MM
      client_billing: {
        total_count,
        base_revenue,
        urgent_count,
        urgent_revenue,
        ai_count,
        ai_revenue,
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
    };
  }

  finalizeBilling(screeningIds: string[]) {
    this.db.transaction(() => {
      for (const id of screeningIds) {
        this.db.prepare("UPDATE screenings SET status = 'confirmed' WHERE id = ?").run(id);
      }
    })();
    return { success: true };
  }
}
