DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS bookings;

-- Services Table
CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT
);

INSERT INTO services (name, category, price, description) VALUES
('Premium Home Cleaning', 'Cleaning', 1499, 'Deep cleaning of entire home including bathroom and kitchen'),
('AC Servicing & Repair', 'Repair', 999, 'Comprehensive AC cleaning, gas check, and cooling repair'),
('Plumbing Consultation', 'Plumbing', 499, 'Expert fixing for leaks, pipe blocks, and sink issues'),
('Electrical Wiring Repair', 'Electric', 799, 'Safe electrical troubleshooting and switch replacements');

-- Conversations Table (For AI Memory)
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT NOT NULL,
  service_id INTEGER NOT NULL,
  booking_date TEXT NOT NULL,
  booking_time TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);