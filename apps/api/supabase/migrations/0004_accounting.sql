-- 0004_accounting.sql
CREATE TABLE billing_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    tier_0_500_price NUMERIC(10, 2) DEFAULT 1000.00,
    tier_501_1000_price NUMERIC(10, 2) DEFAULT 900.00,
    tier_1001_plus_price NUMERIC(10, 2) DEFAULT 800.00,
    urgent_fee NUMERIC(10, 2) DEFAULT 500.00,
    ai_fee NUMERIC(10, 2) DEFAULT 200.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE physician_payout_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rank VARCHAR(50) UNIQUE NOT NULL, -- 'instructor', 'specialist', 'general'
    base_rate NUMERIC(10, 2) NOT NULL,
    night_multiplier NUMERIC(4, 2) DEFAULT 1.20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    billing_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'issued', 'paid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE physician_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    physician_id UUID REFERENCES physicians(id),
    payment_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'confirmed', 'paid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
