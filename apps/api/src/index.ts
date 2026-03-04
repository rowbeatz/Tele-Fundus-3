import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();

// --- Mock Database ---
let mockPhysicians = [
  { id: 'p-1', name: '田中 医師', rank: '指導医' },
  { id: 'p-2', name: '鈴木 医師', rank: '専門医' },
  { id: 'p-3', name: '佐藤 医師', rank: '一般医' },
];

let mockScreenings = [
  {
    id: 's-1001',
    examinee_number: 'EX-2024-001',
    name: '山田 太郎',
    gender: 'male',
    birth_date: '1965-04-12',
    screening_date: '2024-10-20',
    status: 'registered',
    urgency_flag: true,
    chief_complaint: '右目の霞み',
    physician_id: null,
    report: null,
    images: [
      { id: 'img-1', eye_side: 'right', url: 'https://picsum.photos/seed/eye_right/800/800' },
      { id: 'img-2', eye_side: 'left', url: 'https://picsum.photos/seed/eye_left/800/800' }
    ],
    messages: [
      { id: 'm-1', sender: 'Client', content: '至急での読影をお願いします。', created_at: '2024-10-20T10:00:00Z' }
    ]
  },
  {
    id: 's-1002',
    examinee_number: 'EX-2024-002',
    name: '佐藤 花子',
    gender: 'female',
    birth_date: '1970-08-25',
    screening_date: '2024-10-21',
    status: 'assigned',
    urgency_flag: false,
    chief_complaint: '特になし（健診）',
    physician_id: 'p-1',
    report: null,
    images: [
      { id: 'img-3', eye_side: 'right', url: 'https://picsum.photos/seed/eye_right2/800/800' },
      { id: 'img-4', eye_side: 'left', url: 'https://picsum.photos/seed/eye_left2/800/800' }
    ],
    messages: []
  },
  {
    id: 's-1003',
    examinee_number: 'EX-2024-003',
    name: '高橋 一郎',
    gender: 'male',
    birth_date: '1955-11-03',
    screening_date: '2024-10-22',
    status: 'reading_completed',
    urgency_flag: false,
    chief_complaint: '飛蚊症',
    physician_id: 'p-2',
    report: {
      judgment_code: 'B',
      findings_right: '網膜に軽度の出血痕あり。',
      findings_left: '特記事項なし。'
    },
    images: [
      { id: 'img-5', eye_side: 'right', url: 'https://picsum.photos/seed/eye_right3/800/800' },
      { id: 'img-6', eye_side: 'left', url: 'https://picsum.photos/seed/eye_left3/800/800' }
    ],
    messages: []
  },
  // Add some completed mock data for billing
  ...Array.from({ length: 550 }).map((_, i) => ({
    id: `s-c-${i}`,
    examinee_number: `EX-C-${i}`,
    name: `完了 患者${i}`,
    gender: 'male',
    birth_date: '1980-01-01',
    screening_date: '2024-10-01',
    status: 'completed',
    urgency_flag: i % 10 === 0, // 10% are urgent
    chief_complaint: '',
    physician_id: i % 3 === 0 ? 'p-1' : i % 3 === 1 ? 'p-2' : 'p-3',
    report: { judgment_code: 'A', findings_right: '', findings_left: '' },
    images: [],
    messages: []
  }))
];

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', service: 'Tele-Fundus API' });
});

// 0. Physicians API
app.get('/api/physicians', (c) => {
  return c.json({ data: mockPhysicians });
});

// 1. Screenings API (List & Create)
app.get('/api/screenings', (c) => {
  return c.json({ data: mockScreenings });
});

app.post('/api/screenings', async (c) => {
  const body = await c.req.json();
  const newScreening = {
    id: `s-${Date.now()}`,
    ...body,
    status: 'registered',
    images: [
      { id: `img-${Date.now()}-1`, eye_side: 'right', url: 'https://picsum.photos/seed/new_right/800/800' },
      { id: `img-${Date.now()}-2`, eye_side: 'left', url: 'https://picsum.photos/seed/new_left/800/800' }
    ],
    messages: []
  };
  mockScreenings.push(newScreening);
  return c.json({ status: 'success', data: newScreening });
});

// 2. Viewer Data API (Unified endpoint for ReadingAgent)
app.get('/api/viewer-data/:id', (c) => {
  const id = c.req.param('id');
  const screening = mockScreenings.find(s => s.id === id);
  if (!screening) return c.json({ error: 'Not found' }, 404);
  
  return c.json({
    data: {
      screening,
      past_reports: [], // Mock past reports
      reading_status: screening.status
    }
  });
});

// 3. Communication API
app.post('/api/communication/:id/messages', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const screening = mockScreenings.find(s => s.id === id);
  
  if (!screening) return c.json({ error: 'Not found' }, 404);
  if (!body.content || body.content.trim() === '') {
    return c.json({ error: 'Message content cannot be empty' }, 400);
  }

  const newMessage = {
    id: `m-${Date.now()}`,
    sender: body.sender || 'Physician',
    content: body.content,
    created_at: new Date().toISOString()
  };
  
  screening.messages.push(newMessage);
  return c.json({ status: 'success', data: newMessage });
});

// 4. Workflow APIs (Assignment, Report, QC)
app.post('/api/screenings/:id/assign', async (c) => {
  const id = c.req.param('id');
  const { physician_id } = await c.req.json();
  const screening = mockScreenings.find(s => s.id === id);
  if (!screening) return c.json({ error: 'Not found' }, 404);
  
  screening.status = 'assigned';
  screening.physician_id = physician_id;
  return c.json({ status: 'success', data: screening });
});

app.post('/api/screenings/:id/report', async (c) => {
  const id = c.req.param('id');
  const report = await c.req.json();
  const screening = mockScreenings.find(s => s.id === id);
  if (!screening) return c.json({ error: 'Not found' }, 404);
  
  screening.status = 'reading_completed';
  screening.report = report;
  return c.json({ status: 'success', data: screening });
});

app.post('/api/screenings/:id/qc', async (c) => {
  const id = c.req.param('id');
  const { action, feedback } = await c.req.json();
  const screening = mockScreenings.find(s => s.id === id);
  if (!screening) return c.json({ error: 'Not found' }, 404);
  
  if (action === 'approve') {
    screening.status = 'completed';
  } else if (action === 'reject') {
    screening.status = 'assigned'; // 差し戻し（再読影へ）
    screening.messages.push({
      id: `m-${Date.now()}`,
      sender: 'QC Operator',
      content: `【QC差し戻し】${feedback}`,
      created_at: new Date().toISOString()
    });
  }
  return c.json({ status: 'success', data: screening });
});

// 5. Billing API (BillingAgent)
app.get('/api/billing/summary', (c) => {
  const completedScreenings = mockScreenings.filter(s => s.status === 'completed');
  const totalCount = completedScreenings.length;
  
  // Client Billing Logic (Tiered Pricing)
  let baseRevenue = 0;
  if (totalCount <= 500) {
    baseRevenue = totalCount * 1000;
  } else if (totalCount <= 1000) {
    baseRevenue = (500 * 1000) + ((totalCount - 500) * 900);
  } else {
    baseRevenue = (500 * 1000) + (500 * 900) + ((totalCount - 1000) * 800);
  }

  const urgentCount = completedScreenings.filter(s => s.urgency_flag).length;
  const urgentRevenue = urgentCount * 500;
  const totalRevenue = baseRevenue + urgentRevenue;

  // Physician Payout Logic
  let totalPayout = 0;
  const physicianStats = mockPhysicians.map(p => {
    const pScreenings = completedScreenings.filter(s => s.physician_id === p.id);
    const count = pScreenings.length;
    let unitPrice = 400; // 一般医
    if (p.rank === '指導医') unitPrice = 600;
    if (p.rank === '専門医') unitPrice = 500;

    const payout = count * unitPrice;
    totalPayout += payout;

    return {
      physician_id: p.id,
      name: p.name,
      rank: p.rank,
      count,
      unitPrice,
      payout
    };
  });

  const grossMargin = totalRevenue - totalPayout;

  return c.json({
    data: {
      period: '2024-10',
      client_billing: {
        total_count: totalCount,
        base_revenue: baseRevenue,
        urgent_count: urgentCount,
        urgent_revenue: urgentRevenue,
        total_revenue: totalRevenue
      },
      physician_payouts: {
        total_payout: totalPayout,
        details: physicianStats
      },
      financial_summary: {
        gross_margin: grossMargin,
        margin_rate: totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0
      }
    }
  });
});

// RootAgent orchestration endpoint
app.post('/api/agent/orchestrate', async (c) => {
    const body = await c.req.json();
    return c.json({ status: 'success', data: body });
});

export default app;
