CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    fssai_number VARCHAR(14),
    address TEXT,
    capacity INTEGER,
    available_hours JSONB,
    service_areas TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE food_listings (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES users(id),
    food_type VARCHAR(100) NOT NULL,
    quantity DECIMAL NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_time_window JSONB,
    special_instructions TEXT,
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE food_claims (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES food_listings(id),
    claimer_id INTEGER REFERENCES users(id),
    claim_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pickup_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
);

-- Add created_at column to donations table
ALTER TABLE donations 
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP; 