#!/usr/bin/env python3
"""Simple database seeding demonstration with Maldivian data."""

import sqlite3
import os

# Remove existing database if it exists
db_path = 'demo_jobsmv.db'
if os.path.exists(db_path):
    os.remove(db_path)

# Create database and tables
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create tables
cursor.execute('''
CREATE TABLE employer (
    id TEXT PRIMARY KEY,
    company_name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    contact_info TEXT
)
''')

cursor.execute('''
CREATE TABLE category (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE,
    description TEXT
)
''')

cursor.execute('''
CREATE TABLE job (
    id TEXT PRIMARY KEY,
    employer_id TEXT,
    title TEXT,
    description_md TEXT,
    requirements_md TEXT,
    location TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    status TEXT,
    tags TEXT,
    FOREIGN KEY (employer_id) REFERENCES employer (id)
)
''')

cursor.execute('''
CREATE TABLE job_category (
    job_id TEXT,
    category_id TEXT,
    FOREIGN KEY (job_id) REFERENCES job (id),
    FOREIGN KEY (category_id) REFERENCES category (id),
    PRIMARY KEY (job_id, category_id)
)
''')

# Seed data - Maldivian companies
employers = [
    ('emp-001', 'Sun Siyam Olhuveli', 'hr@sunsiyam.mv', 'hashed_password', '{"phone": "+960-664-4141", "website": "https://sunsiyam.mv"}'),
    ('emp-002', 'Conrad Maldives Rangali Island', 'careers@conradmaldives.com', 'hashed_password', '{"phone": "+960-668-0629", "website": "https://conradmaldives.com"}'),
    ('emp-003', 'Ministry of Tourism', 'careers@tourism.gov.mv', 'hashed_password', '{"phone": "+960-332-3232", "website": "https://tourism.gov.mv"}'),
    ('emp-004', 'Ministry of Health', 'hr@health.gov.mv', 'hashed_password', '{"phone": "+960-332-2000", "website": "https://health.gov.mv"}'),
    ('emp-005', 'Bank of Maldives', 'careers@bankofmaldives.com.mv', 'hashed_password', '{"phone": "+960-330-8888", "website": "https://bankofmaldives.com.mv"}'),
    ('emp-006', 'Dhiraagu', 'jobs@dhiraagu.com.mv', 'hashed_password', '{"phone": "+960-300-3000", "website": "https://dhiraagu.com.mv"}'),
]

categories = [
    ('cat-001', 'Hospitality & Tourism', 'Hotel management, tourism services, and hospitality'),
    ('cat-002', 'Government Administration', 'Public administration, policy, and government services'),
    ('cat-003', 'Healthcare Services', 'Medical and healthcare administration'),
    ('cat-004', 'Banking & Finance', 'Banking, financial services, and accounting'),
    ('cat-005', 'Telecommunications', 'Telecom services, network operations, and IT'),
]

jobs = [
    ('job-001', 'emp-001', 'Hotel Manager', 'Lead luxury resort operations in South Ari Atoll', '5+ years hotel management experience, leadership skills', 'South Ari Atoll', 80000, 120000, 'published', '["hotel-management", "luxury-hospitality", "leadership"]'),
    ('job-002', 'emp-001', 'Executive Chef', 'Lead culinary team at luxury resort', '7+ years culinary experience, food safety knowledge', 'South Ari Atoll', 60000, 90000, 'published', '["culinary", "kitchen-management", "food-safety"]'),
    ('job-003', 'emp-002', 'Front Office Manager', 'Manage resort front office operations', '4+ years hospitality management experience', 'Ari Atoll', 50000, 75000, 'published', '["front-office", "guest-services", "hospitality"]'),
    ('job-004', 'emp-003', 'Tourism Development Officer', 'Develop tourism policies and programs', '3+ years tourism sector experience, analytical skills', "Male'", 35000, 55000, 'published', '["policy-development", "sustainable-tourism", "research"]'),
    ('job-005', 'emp-004', 'Public Health Officer', 'Implement public health programs', 'Medical degree, 2+ years public health experience', "Male'", 40000, 60000, 'published', '["public-health", "health-education", "community-health"]'),
    ('job-006', 'emp-005', 'Branch Manager', 'Manage bank branch operations and sales', '5+ years banking experience, leadership skills', "Male'", 70000, 100000, 'published', '["branch-management", "banking-operations", "leadership"]'),
    ('job-007', 'emp-006', 'Network Engineer', 'Design and maintain telecom network infrastructure', '3+ years network engineering experience', "Male'", 50000, 75000, 'published', '["network-engineering", "telecommunications", "infrastructure"]'),
    ('job-008', 'emp-001', 'Spa Therapist', 'Provide spa treatments and wellness services', 'Certified spa therapist, 2+ years experience', 'South Ari Atoll', 20000, 35000, 'draft', '["spa-therapy", "wellness", "customer-service"]'),
]

# Insert data
cursor.executemany('INSERT INTO employer VALUES (?, ?, ?, ?, ?)', employers)
cursor.executemany('INSERT INTO category VALUES (?, ?, ?)', categories)
cursor.executemany('INSERT INTO job VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', jobs)

# Add job-category relationships
job_categories = [
    ('job-001', 'cat-001'),  # Hotel Manager -> Hospitality & Tourism
    ('job-002', 'cat-001'),  # Executive Chef -> Hospitality & Tourism
    ('job-003', 'cat-001'),  # Front Office Manager -> Hospitality & Tourism
    ('job-004', 'cat-002'),  # Tourism Development Officer -> Government Administration
    ('job-005', 'cat-003'),  # Public Health Officer -> Healthcare Services
    ('job-006', 'cat-004'),  # Branch Manager -> Banking & Finance
    ('job-007', 'cat-005'),  # Network Engineer -> Telecommunications
    ('job-008', 'cat-001'),  # Spa Therapist -> Hospitality & Tourism
]

cursor.executemany('INSERT INTO job_category VALUES (?, ?)', job_categories)

conn.commit()

# Display results
print("*** MALDIVIAN JOB DATABASE SUCCESFULLY SEEDED! ***")
print("=" * 55)

print(f"Employers created: {cursor.execute('SELECT COUNT(*) FROM employer').fetchone()[0]}")
print(f"Categories created: {cursor.execute('SELECT COUNT(*) FROM category').fetchone()[0]}")
print(f"Jobs created: {cursor.execute('SELECT COUNT(*) FROM job').fetchone()[0]}")

print("\n*** SEEDED MALDIVIAN COMPANIES ***")
for row in cursor.execute('SELECT company_name FROM employer ORDER BY company_name'):
    print(f"  - {row[0]}")

print("\n*** SAMPLE JOB LISTINGS ***")
query = '''
SELECT j.title, e.company_name, j.location, j.salary_min, j.salary_max, j.status
FROM job j
JOIN employer e ON j.employer_id = e.id
ORDER BY j.title
'''
for row in cursor.execute(query):
    title, company, location, min_salary, max_salary, status = row
    salary_range = f"MVR {min_salary:,} - {max_salary:,}"
    print(f"  • {title}")
    print(f"    {company} | {location} | {salary_range} | {status.capitalize()}")
    print()

print("*** SECTOR BREAKDOWN ***")
sector_query = '''
SELECT
    CASE
        WHEN e.email LIKE '%.gov.mv' THEN 'Civil Service'
        WHEN e.company_name LIKE '%Hotel%' OR e.company_name LIKE '%Sun Siyam%' OR e.company_name LIKE '%Conrad%' THEN 'Tourism'
        ELSE 'Private Sector'
    END as sector,
    COUNT(*) as job_count
FROM job j
JOIN employer e ON j.employer_id = e.id
GROUP BY sector
ORDER BY job_count DESC
'''

for row in cursor.execute(sector_query):
    sector, count = row
    print(f"  {sector}: {count} jobs")

conn.close()

print("\n*** SEEDING COMPLETE ***")
print("The database now contains authentic Maldivian job listings!")
print("=" * 55)
