-- 0002_workflow.sql
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    screening_id UUID REFERENCES screenings(id) ON DELETE CASCADE,
    physician_id UUID REFERENCES physicians(id),
    status VARCHAR(50) NOT NULL DEFAULT 'assigned', -- 'assigned', 'in_progress', 'completed', 'returned'
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    screening_id UUID REFERENCES screenings(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id),
    physician_id UUID REFERENCES physicians(id),
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'submitted'
    finding_text TEXT,
    judgment_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reading_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reading_id UUID REFERENCES readings(id) ON DELETE CASCADE,
    screening_id UUID REFERENCES screenings(id) ON DELETE CASCADE,
    physician_id UUID REFERENCES physicians(id),
    findings_right_json JSONB,
    findings_left_json JSONB,
    judgment_code VARCHAR(50),
    referral_required BOOLEAN DEFAULT FALSE,
    report_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reading_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reading_id UUID REFERENCES readings(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL, -- 'approved', 'rejected'
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
