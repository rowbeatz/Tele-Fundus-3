-- 0001_clinical_data.sql
CREATE TABLE examinees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    examinee_number VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(20),
    birth_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, examinee_number)
);

CREATE TABLE client_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    order_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE screenings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_order_id UUID REFERENCES client_orders(id),
    examinee_id UUID REFERENCES examinees(id),
    screening_date DATE NOT NULL,
    urgency_flag BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'registered', -- 'registered', 'assigned', 'reading', 'qc', 'completed'
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    has_diabetes BOOLEAN,
    smoking_status VARCHAR(50),
    chief_complaint TEXT,
    symptoms_json JSONB,
    ophthalmic_exam_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    screening_id UUID REFERENCES screenings(id) ON DELETE CASCADE,
    eye_side VARCHAR(10) NOT NULL, -- 'right', 'left'
    image_type VARCHAR(50) NOT NULL, -- 'color', 'oct', etc.
    storage_key VARCHAR(500) NOT NULL,
    sha256_hash VARCHAR(64),
    annotations_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
