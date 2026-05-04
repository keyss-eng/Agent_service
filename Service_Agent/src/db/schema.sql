DROP TABLE IF EXISTS services;

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