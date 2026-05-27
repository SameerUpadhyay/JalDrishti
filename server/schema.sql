-- JalDrishti MySQL Database Schema & Seed Data

CREATE DATABASE IF NOT EXISTS jaldrishti;
USE jaldrishti;

-- Table structure for tankers
CREATE TABLE IF NOT EXISTS tankers (
  id VARCHAR(50) PRIMARY KEY,
  ward VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  eta VARCHAR(50),
  type VARCHAR(50) NOT NULL
);

-- Table structure for requests (citizen tanker requests)
CREATE TABLE IF NOT EXISTS requests (
  id VARCHAR(50) PRIMARY KEY,
  area VARCHAR(100) NOT NULL,
  volume INT NOT NULL,
  waitTime VARCHAR(50),
  priority VARCHAR(50),
  addressDetails TEXT,
  phone VARCHAR(50),
  status VARCHAR(50) NOT NULL,
  trackingId VARCHAR(50) UNIQUE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table structure for anomalies (complaints and sensor leaks)
CREATE TABLE IF NOT EXISTS anomalies (
  id VARCHAR(50) PRIMARY KEY,
  icon VARCHAR(100),
  type VARCHAR(150) NOT NULL,
  location VARCHAR(150) NOT NULL,
  time VARCHAR(50),
  severity VARCHAR(50) NOT NULL,
  severityColor VARCHAR(50) NOT NULL,
  trackingId VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for operators
CREATE TABLE IF NOT EXISTS operators (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  assignedTankerId VARCHAR(50)
);

-- Table structure for feedback
CREATE TABLE IF NOT EXISTS feedback (
  id VARCHAR(50) PRIMARY KEY,
  requestId VARCHAR(50) NOT NULL,
  rating INT NOT NULL,
  comments TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clean up existing data before seeding
DELETE FROM tankers;
DELETE FROM requests;
DELETE FROM anomalies;
DELETE FROM operators;
DELETE FROM feedback;

-- Seed data for tankers
INSERT INTO tankers (id, ward, status, eta, type) VALUES
('TK-402', 'Whitefield Sector 4', 'En Route', '14 mins', 'BWSSB'),
('TK-891', 'Sarjapur Main', 'En Route', '25 mins', 'Private'),
('TK-221', 'Bellandur', 'Delivering', NULL, 'BWSSB'),
('TK-554', 'HSR Layout', 'Available', NULL, 'Private'),
('TK-112', 'Koramangala', 'En Route', '5 mins', 'BWSSB'),
('TK-334', 'Indiranagar', 'En Route', '12 mins', 'Private'),
('TK-502', 'Electronic City', 'Delivering', NULL, 'BWSSB'),
('TK-761', 'JP Nagar', 'Available', NULL, 'Private'),
('TK-992', 'BTM Layout', 'En Route', '18 mins', 'BWSSB'),
('TK-105', 'Marathahalli', 'En Route', '22 mins', 'Private'),
('TK-218', 'Jayanagar', 'Available', NULL, 'BWSSB'),
('TK-441', 'Banashankari', 'Delivering', NULL, 'Private'),
('TK-653', 'Malleswaram', 'En Route', '8 mins', 'BWSSB'),
('TK-812', 'Hebbal', 'En Route', '30 mins', 'Private'),
('TK-094', 'Yelahanka', 'Available', NULL, 'BWSSB'),
('TK-322', 'Basavanagudi', 'Delivering', NULL, 'Private'),
('TK-567', 'Whitefield', 'En Route', '15 mins', 'BWSSB'),
('TK-789', 'Koramangala', 'Available', NULL, 'Private'),
('TK-901', 'HSR Layout', 'En Route', '20 mins', 'BWSSB'),
('TK-145', 'Bellandur', 'Delivering', NULL, 'Private');

-- Seed data for requests
INSERT INTO requests (id, area, volume, waitTime, priority, addressDetails, phone, status, trackingId) VALUES
('REQ-092', 'Electronic City Phase 1', 6000, '3h 12m', 'high', '', '', 'Pending', 'REQ-092'),
('REQ-093', 'Whitefield EPIP', 12000, '1h 45m', 'medium', '', '', 'Pending', 'REQ-093'),
('REQ-094', 'JP Nagar 7th Phase', 6000, '45m', 'low', '', '', 'Pending', 'REQ-094');

-- Seed data for anomalies
INSERT INTO anomalies (id, icon, type, location, time, severity, severityColor, trackingId) VALUES
('ALR-8392', '', 'Major Pipe Burst', 'Whitefield, Sensor S-03-02', '12 mins ago', 'Critical', '234, 67, 53', 'ALR-8392'),
('ALR-8391', '', 'Suspected Water Theft', 'Sarjapur, Near Main Valve', '2 hrs ago', 'High', '242, 153, 0', 'ALR-8391'),
('ALR-8388', '', 'Slow Leak Detected', 'Koramangala, Sector 4', '5 hrs ago', 'Medium', '161, 66, 244', 'ALR-8388'),
('ALR-8401', '', 'Pressure Drop', 'Indiranagar, 100ft Road', '20 mins ago', 'High', '242, 153, 0', 'ALR-8401'),
('ALR-8402', '', 'Line Rupture', 'Bellandur, ORR Junction', '45 mins ago', 'Critical', '234, 67, 53', 'ALR-8402'),
('ALR-8403', '', 'Valve Seepage', 'HSR Layout, Sector 2', '4 hrs ago', 'Low', '66, 133, 244', 'ALR-8403'),
('ALR-8404', '', 'Flow Rate Anomaly', 'Electronic City, Phase 1', '1 hr ago', 'High', '242, 153, 0', 'ALR-8404'),
('ALR-8405', '', 'Pressure Drop', 'Whitefield, EPIP Zone', '30 mins ago', 'High', '242, 153, 0', 'ALR-8405'),
('ALR-8406', '', 'Major Burst', 'Sarjapur, Wipro Tech Park', '15 mins ago', 'Critical', '234, 67, 53', 'ALR-8406'),
('ALR-8407', '', 'Continuous Leak', 'Koramangala, Sony World', '6 hrs ago', 'Medium', '161, 66, 244', 'ALR-8407'),
('ALR-8408', '', 'Bypass Suspected', 'Indiranagar, CMH Road', '3 hrs ago', 'High', '242, 153, 0', 'ALR-8408'),
('ALR-8409', '', 'Supply Interruption', 'Bellandur, Lake Road', '55 mins ago', 'High', '242, 153, 0', 'ALR-8409'),
('ALR-8410', '', 'Meter Reading Error', 'HSR Layout, Sector 7', '8 hrs ago', 'Low', '66, 133, 244', 'ALR-8410'),
('ALR-8411', '', 'Construction Damage', 'Electronic City, Phase 2', '10 mins ago', 'Critical', '234, 67, 53', 'ALR-8411'),
('ALR-8412', '', 'Pump Malfunction', 'Whitefield, Kadugodi', '1.5 hrs ago', 'High', '242, 153, 0', 'ALR-8412');

-- Seed data for operators
INSERT INTO operators (id, name, phone, status, assignedTankerId) VALUES
('OP-101', 'Rajesh Kumar', '+91 98765 43210', 'Active', 'TK-402'),
('OP-102', 'Amit Patel', '+91 87654 32109', 'Active', 'TK-891'),
('OP-103', 'Suresh Ray', '+91 76543 21098', 'On Duty', 'TK-221'),
('OP-104', 'Vijay Singh', '+91 65432 10987', 'Inactive', NULL),
('OP-105', 'Ramesh Gowda', '+91 95432 87654', 'Active', 'TK-112');

-- Seed data for feedback
INSERT INTO feedback (id, requestId, rating, comments) VALUES
('FB-501', 'REQ-092', 5, 'Excellent service, delivery was quick and driver was very helpful!'),
('FB-502', 'REQ-093', 4, 'Good delivery response, but water volume was slightly less than ordered.'),
('FB-503', 'REQ-094', 3, 'Water tanker arrived later than estimated, but overall satisfied.');
