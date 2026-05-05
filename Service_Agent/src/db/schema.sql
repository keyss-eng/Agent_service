-- Cleanup
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS otps;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS bookings;

-- 1. Users Table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. OTPs Table
CREATE TABLE otps (
  email TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

-- 3. Services Table
CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT
);

-- 4. Conversations Table (AI History)
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bookings Table
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT NOT NULL,
  service_id INTEGER NOT NULL,
  booking_date TEXT NOT NULL,
  booking_time TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 🧹 CLEANING
INSERT INTO services (name, category, price, description) VALUES
('Full Home Deep Cleaning', 'Cleaning', 1999, 'Complete deep cleaning of all rooms, windows, and balconies'),
('Kitchen Deep Cleaning', 'Cleaning', 999, 'Oil & grease removal from tiles, chimney, and cabinets'),
('Bathroom Deep Cleaning', 'Cleaning', 399, 'Intense cleaning of floor, tiles, taps, and toilet'),
('Sofa & Carpet Cleaning', 'Cleaning', 799, 'Vacuuming and shampoo wash for sofas and carpets'),
('Water Tank Cleaning', 'Cleaning', 549, 'Hygienic cleaning of overhead water tanks');

-- ❄️ REPAIR (AC & APPLIANCES)
INSERT INTO services (name, category, price, description) VALUES
('Split AC Servicing', 'Repair', 599, 'Deep jet wash cleaning and gas pressure check'),
('Window AC Servicing', 'Repair', 449, 'Complete dry/wet cleaning of window units'),
('AC Gas Charging', 'Repair', 2499, 'Full gas refill with leakage repair'),
('AC Installation', 'Repair', 1299, 'Professional mounting and copper pipe fitting'),
('Fridge/RO Repair', 'Repair', 349, 'Inspection and fix for cooling or water issues');

-- 🔌 ELECTRIC
INSERT INTO services (name, category, price, description) VALUES
('Switch & Socket Repair', 'Electric', 129, 'Repairing faulty switches and power points'),
('Fan Installation/Repair', 'Electric', 199, 'Mounting new fan or fixing capacitor issues'),
('MCB Replacement', 'Electric', 399, 'Solving power tripping issues by replacing MCB'),
('Full Home Wiring Check', 'Electric', 799, 'Safety inspection of all house wiring'),
('Inverter Installation', 'Electric', 899, 'Setup of new inverter and battery system');

-- 🚰 PLUMBING
INSERT INTO services (name, category, price, description) VALUES
('Tap & Leakage Repair', 'Plumbing', 149, 'Fixing dripping taps and pipeline leaks'),
('Blocked Drain Clearing', 'Plumbing', 349, 'Cleaning of clogged sink, toilet, or drain pipes'),
('Toilet/Flush Repair', 'Plumbing', 399, 'Fixing flush tank leakage or handle problems'),
('Motor/Pump Repair', 'Plumbing', 499, 'Troubleshooting water pump and meter issues'),
('New Fitting Installation', 'Plumbing', 599, 'Installation of sinks, mixers, or washbasins');