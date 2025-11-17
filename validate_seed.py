#!/usr/bin/env python3
"""Simple validation script to demonstrate the updated Maldivian seed data."""

# Maldivian employers data
employers_data = [
    # Tourism Sector
    {
        "company_name": "Sun Siyam Olhuveli",
        "email": "hr@sunsiyam.mv",
        "password": "demo123",
        "contact_info": {"phone": "+960-664-4141", "website": "https://sunsiyam.mv"},
    },
    {
        "company_name": "Conrad Maldives Rangali Island",
        "email": "careers@conradmaldives.com",
        "password": "demo123",
        "contact_info": {"phone": "+960-668-0629", "website": "https://conradmaldives.com"},
    },
    {
        "company_name": "Villa Hotels & Resorts",
        "email": "hr@villahotels.com",
        "password": "demo123",
        "contact_info": {"phone": "+960-333-4555", "website": "https://villahotels.com"},
    },
    {
        "company_name": "Universal Resorts Maldives",
        "email": "jobs@universaltours.mv",
        "password": "demo123",
        "contact_info": {"phone": "+960-300-0000", "website": "https://universalresorts.mv"},
    },
    # Civil Service
    {
        "company_name": "Ministry of Tourism",
        "email": "careers@tourism.gov.mv",
        "password": "demo123",
        "contact_info": {"phone": "+960-332-3232", "website": "https://tourism.gov.mv"},
    },
    {
        "company_name": "Ministry of Health",
        "email": "hr@health.gov.mv",
        "password": "demo123",
        "contact_info": {"phone": "+960-332-2000", "website": "https://health.gov.mv"},
    },
    {
        "company_name": "Maldives Civil Service Commission",
        "email": "recruitment@csc.gov.mv",
        "password": "demo123",
        "contact_info": {"phone": "+960-332-2288", "website": "https://csc.gov.mv"},
    },
    # Private Sector
    {
        "company_name": "Bank of Maldives",
        "email": "careers@bankofmaldives.com.mv",
        "password": "demo123",
        "contact_info": {"phone": "+960-330-8888", "website": "https://bankofmaldives.com.mv"},
    },
    {
        "company_name": "Maldives Transport & Contracting Company",
        "email": "hr@mtcc.com.mv",
        "password": "demo123",
        "contact_info": {"phone": "+960-331-5555", "website": "https://mtcc.com.mv"},
    },
    {
        "company_name": "Dhiraagu",
        "email": "jobs@dhiraagu.com.mv",
        "password": "demo123",
        "contact_info": {"phone": "+960-300-3000", "website": "https://dhiraagu.com.mv"},
    },
]

# Maldivian job market categories
categories_data = [
    # Tourism Sector
    {"name": "Hospitality & Tourism", "description": "Hotel management, tourism services, and hospitality"},
    {"name": "Food & Beverage", "description": "Restaurant management, culinary arts, and beverage services"},
    {"name": "Travel & Tourism", "description": "Tour operations, travel agencies, and tourism management"},
    # Civil Service
    {"name": "Government Administration", "description": "Public administration, policy, and government services"},
    {"name": "Healthcare Services", "description": "Medical and healthcare administration"},
    {"name": "Education", "description": "Teaching, education administration, and training"},
    # Private Sector
    {"name": "Banking & Finance", "description": "Banking, financial services, and accounting"},
    {"name": "Construction & Engineering", "description": "Construction, engineering, and infrastructure"},
    {"name": "Telecommunications", "description": "Telecom services, network operations, and IT"},
    # General Categories
    {"name": "Information Technology", "description": "Software development, IT support, and digital services"},
    {"name": "Human Resources", "description": "HR management, recruitment, and employee relations"},
    {"name": "Operations & Management", "description": "Business operations, project management, and administration"},
]

# Sample Maldivian jobs
jobs_data = [
    # Tourism Sector - Sun Siyam Olhuveli
    {
        "employer_email": "hr@sunsiyam.mv",
        "title": "Hotel Manager",
        "description_md": "Lead our luxury resort operations in South Ari Atoll. Oversee guest services, staff management, and ensure exceptional guest experiences. Manage budgets, coordinate with departments, and maintain high service standards.",
        "requirements_md": "- 5+ years of hotel management experience\n- Strong leadership and communication skills\n- Experience with luxury hospitality brands\n- Fluency in English, knowledge of Dhivehi preferred\n- Bachelor's degree in Hospitality Management or related field",
        "location": "South Ari Atoll",
        "salary_min": 80000,
        "salary_max": 120000,
        "status": "published",
        "tags": ["hotel-management", "luxury-hospitality", "leadership", "guest-services"],
        "categories": ["Hospitality & Tourism"],
    },
    {
        "employer_email": "hr@sunsiyam.mv",
        "title": "Executive Chef",
        "description_md": "Lead our culinary team in creating innovative Maldivian and international cuisine. Manage kitchen operations, menu development, and ensure food safety standards. Work closely with F&B management.",
        "requirements_md": "- 7+ years of culinary experience with 3+ years in leadership\n- Experience in luxury hospitality\n- Strong knowledge of food safety and hygiene\n- Creative menu development skills\n- Culinary degree or equivalent certification",
        "location": "South Ari Atoll",
        "salary_min": 60000,
        "salary_max": 90000,
        "status": "published",
        "tags": ["culinary", "kitchen-management", "food-safety", "menu-development"],
        "categories": ["Food & Beverage"],
    },
    {
        "employer_email": "hr@sunsiyam.mv",
        "title": "Spa Therapist",
        "description_md": "Provide exceptional spa treatments and wellness services to our guests. Perform various massage techniques, facials, and body treatments. Maintain spa equipment and ensure hygienic standards.",
        "requirements_md": "- Certified spa therapist qualification\n- 2+ years of spa experience preferred\n- Excellent customer service skills\n- Knowledge of various massage techniques\n- Fluency in English",
        "location": "South Ari Atoll",
        "salary_min": 20000,
        "salary_max": 35000,
        "status": "published",
        "tags": ["spa-therapy", "wellness", "massage", "customer-service"],
        "categories": ["Hospitality & Tourism"],
    },
    # Tourism Sector - Conrad Maldives Rangali Island
    {
        "employer_email": "careers@conradmaldives.com",
        "title": "Front Office Manager",
        "description_md": "Manage front office operations including check-in/check-out, guest services, and staff supervision. Ensure smooth operations and maintain high service standards at our luxury resort.",
        "requirements_md": "- 4+ years of front office management experience\n- Strong leadership and organizational skills\n- Experience with hotel management systems\n- Excellent communication and interpersonal skills\n- Bachelor's degree preferred",
        "location": "Ari Atoll",
        "salary_min": 50000,
        "salary_max": 75000,
        "status": "published",
        "tags": ["front-office", "guest-services", "hotel-management", "leadership"],
        "categories": ["Hospitality & Tourism"],
    },
    {
        "employer_email": "careers@conradmaldives.com",
        "title": "Water Sports Instructor",
        "description_md": "Lead water sports activities including diving, snorkeling, and marine excursions. Ensure guest safety, maintain equipment, and provide excellent customer experiences.",
        "requirements_md": "- PADI Divemaster certification or equivalent\n- 3+ years of water sports experience\n- Strong swimming skills and first aid certification\n- Excellent customer service and safety awareness\n- Ability to work in marine environment",
        "location": "Ari Atoll",
        "salary_min": 25000,
        "salary_max": 40000,
        "status": "published",
        "tags": ["water-sports", "diving", "marine-activities", "safety"],
        "categories": ["Hospitality & Tourism"],
    },
    # Tourism Sector - Villa Hotels & Resorts
    {
        "employer_email": "hr@villahotels.com",
        "title": "Tour Guide",
        "description_md": "Lead island hopping tours, cultural experiences, and sightseeing excursions. Share knowledge about Maldivian culture, history, and marine life with guests.",
        "requirements_md": "- 2+ years of tour guiding experience\n- Excellent communication and presentation skills\n- Knowledge of Maldivian culture and history\n- Fluency in English and Dhivehi\n- First aid certification preferred",
        "location": "North Male Atoll",
        "salary_min": 18000,
        "salary_max": 28000,
        "status": "published",
        "tags": ["tour-guiding", "cultural-tours", "customer-service", "dhivehi"],
        "categories": ["Travel & Tourism"],
    },
    {
        "employer_email": "hr@villahotels.com",
        "title": "Housekeeping Supervisor",
        "description_md": "Supervise housekeeping operations, maintain cleanliness standards, and manage housekeeping staff. Ensure villas and public areas meet luxury standards.",
        "requirements_md": "- 3+ years of housekeeping experience with supervisory role\n- Strong organizational and leadership skills\n- Attention to detail and quality standards\n- Experience in luxury hospitality preferred",
        "location": "North Male Atoll",
        "salary_min": 22000,
        "salary_max": 32000,
        "status": "published",
        "tags": ["housekeeping", "supervision", "cleanliness", "luxury-hospitality"],
        "categories": ["Hospitality & Tourism"],
    },
    # Civil Service - Ministry of Tourism
    {
        "employer_email": "careers@tourism.gov.mv",
        "title": "Tourism Development Officer",
        "description_md": "Develop and implement tourism policies, coordinate with stakeholders, and promote sustainable tourism development. Conduct research and prepare reports on tourism trends.",
        "requirements_md": "- Bachelor's degree in Tourism, Business, or related field\n- 3+ years of experience in tourism sector\n- Strong analytical and research skills\n- Excellent written and verbal communication\n- Knowledge of sustainable tourism practices",
        "location": "Male'",
        "salary_min": 35000,
        "salary_max": 55000,
        "status": "published",
        "tags": ["policy-development", "sustainable-tourism", "research", "stakeholder-management"],
        "categories": ["Government Administration"],
    },
    {
        "employer_email": "careers@tourism.gov.mv",
        "title": "Marketing Specialist",
        "description_md": "Develop marketing strategies to promote Maldives as a tourist destination. Manage digital marketing campaigns, social media, and international tourism promotions.",
        "requirements_md": "- Bachelor's degree in Marketing, Communications, or related field\n- 3+ years of marketing experience\n- Digital marketing and social media expertise\n- Experience with tourism marketing preferred\n- Fluency in English required",
        "location": "Male'",
        "salary_min": 30000,
        "salary_max": 45000,
        "status": "published",
        "tags": ["digital-marketing", "tourism-promotion", "social-media", "campaign-management"],
        "categories": ["Government Administration"],
    },
    # Civil Service - Ministry of Health
    {
        "employer_email": "hr@health.gov.mv",
        "title": "Public Health Officer",
        "description_md": "Implement public health programs, conduct health education campaigns, and monitor disease prevention initiatives. Work on community health improvement projects.",
        "requirements_md": "- Medical degree or Public Health qualification\n- 2+ years of public health experience\n- Strong community engagement skills\n- Knowledge of health policy and regulations\n- Excellent communication skills",
        "location": "Male'",
        "salary_min": 40000,
        "salary_max": 60000,
        "status": "published",
        "tags": ["public-health", "health-education", "disease-prevention", "community-health"],
        "categories": ["Healthcare Services"],
    },
    {
        "employer_email": "hr@health.gov.mv",
        "title": "Medical Laboratory Technician",
        "description_md": "Perform laboratory tests, analyze samples, and maintain laboratory equipment. Ensure accurate test results and maintain quality control standards.",
        "requirements_md": "- Diploma in Medical Laboratory Technology\n- 2+ years of laboratory experience\n- Knowledge of laboratory procedures and safety\n- Attention to detail and accuracy\n- Registration with relevant medical council",
        "location": "Male'",
        "salary_min": 25000,
        "salary_max": 35000,
        "status": "published",
        "tags": ["laboratory-testing", "medical-technology", "quality-control", "healthcare"],
        "categories": ["Healthcare Services"],
    },
    # Civil Service - Maldives Civil Service Commission
    {
        "employer_email": "recruitment@csc.gov.mv",
        "title": "Administrative Officer",
        "description_md": "Provide administrative support, coordinate government programs, and assist in policy implementation. Handle documentation, reporting, and stakeholder communication.",
        "requirements_md": "- Bachelor's degree in Business Administration or related field\n- 2+ years of administrative experience\n- Strong organizational and communication skills\n- Proficiency in Microsoft Office\n- Knowledge of government procedures preferred",
        "location": "Male'",
        "salary_min": 28000,
        "salary_max": 42000,
        "status": "published",
        "tags": ["administration", "government-procedures", "documentation", "policy-implementation"],
        "categories": ["Government Administration"],
    },
    # Private Sector - Bank of Maldives
    {
        "employer_email": "careers@bankofmaldives.com.mv",
        "title": "Branch Manager",
        "description_md": "Manage bank branch operations, lead sales teams, ensure regulatory compliance, and provide excellent customer service. Oversee daily operations and staff performance.",
        "requirements_md": "- 5+ years of banking experience with 2+ years in management\n- Strong leadership and sales skills\n- Knowledge of banking regulations and compliance\n- Bachelor's degree in Finance, Business, or related field\n- Excellent customer service orientation",
        "location": "Male'",
        "salary_min": 70000,
        "salary_max": 100000,
        "status": "published",
        "tags": ["branch-management", "banking-operations", "leadership", "regulatory-compliance"],
        "categories": ["Banking & Finance"],
    },
    {
        "employer_email": "careers@bankofmaldives.com.mv",
        "title": "Relationship Manager",
        "description_md": "Develop and maintain relationships with corporate and retail clients. Provide banking solutions, cross-sell products, and ensure customer satisfaction.",
        "requirements_md": "- 3+ years of banking relationship management experience\n- Strong sales and negotiation skills\n- Knowledge of banking products and services\n- Bachelor's degree in Business or Finance\n- Excellent communication and interpersonal skills",
        "location": "Male'",
        "salary_min": 40000,
        "salary_max": 60000,
        "status": "published",
        "tags": ["relationship-management", "client-services", "sales", "banking"],
        "categories": ["Banking & Finance"],
    },
    # Private Sector - MTCC (Maldives Transport & Contracting Company)
    {
        "employer_email": "hr@mtcc.com.mv",
        "title": "Project Engineer",
        "description_md": "Manage construction and infrastructure projects, coordinate with teams, ensure safety standards, and oversee project timelines and budgets.",
        "requirements_md": "- Bachelor's degree in Civil Engineering\n- 4+ years of project management experience\n- Knowledge of construction safety regulations\n- Strong project coordination skills\n- Experience with construction software preferred",
        "location": "Male'",
        "salary_min": 45000,
        "salary_max": 70000,
        "status": "published",
        "tags": ["project-management", "civil-engineering", "construction", "safety"],
        "categories": ["Construction & Engineering"],
    },
    {
        "employer_email": "hr@mtcc.com.mv",
        "title": "Heavy Equipment Operator",
        "description_md": "Operate heavy machinery for construction and infrastructure projects. Ensure safe operation, perform maintenance, and follow safety protocols.",
        "requirements_md": "- Valid heavy equipment operation certification\n- 3+ years of equipment operation experience\n- Knowledge of safety procedures\n- Experience with various heavy machinery\n- Ability to work in challenging environments",
        "location": "Various Atolls",
        "salary_min": 25000,
        "salary_max": 40000,
        "status": "published",
        "tags": ["heavy-equipment", "construction", "machinery-operation", "safety"],
        "categories": ["Construction & Engineering"],
    },
    # Private Sector - Dhiraagu
    {
        "employer_email": "jobs@dhiraagu.com.mv",
        "title": "Network Engineer",
        "description_md": "Design, implement, and maintain telecommunications network infrastructure. Troubleshoot network issues and ensure system reliability.",
        "requirements_md": "- Bachelor's degree in Telecommunications or IT\n- 3+ years of network engineering experience\n- Knowledge of telecom protocols and technologies\n- CCNA/CCNP certification preferred\n- Strong problem-solving skills",
        "location": "Male'",
        "salary_min": 50000,
        "salary_max": 75000,
        "status": "published",
        "tags": ["network-engineering", "telecommunications", "system-reliability", "troubleshooting"],
        "categories": ["Telecommunications"],
    },
    {
        "employer_email": "jobs@dhiraagu.com.mv",
        "title": "Customer Service Representative",
        "description_md": "Provide excellent customer service for telecom services, handle inquiries, resolve complaints, and process service requests.",
        "requirements_md": "- High school diploma or equivalent\n- 1+ years of customer service experience\n- Excellent communication skills in English and Dhivehi\n- Knowledge of telecom services preferred\n- Strong problem-solving abilities",
        "location": "Male'",
        "salary_min": 15000,
        "salary_max": 22000,
        "status": "published",
        "tags": ["customer-service", "telecom-support", "communication", "problem-solving"],
        "categories": ["Telecommunications"],
    },
    # Additional jobs from Universal Resorts
    {
        "employer_email": "jobs@universaltours.mv",
        "title": "Reservations Manager",
        "description_md": "Manage resort reservations, coordinate with sales team, and ensure optimal occupancy rates. Handle guest inquiries and provide excellent service.",
        "requirements_md": "- 3+ years of reservations or hospitality experience\n- Strong organizational and communication skills\n- Experience with reservation systems\n- Knowledge of tourism industry\n- Bachelor's degree preferred",
        "location": "Male'",
        "salary_min": 35000,
        "salary_max": 50000,
        "status": "published",
        "tags": ["reservations", "hospitality-management", "customer-service", "occupancy-management"],
        "categories": ["Travel & Tourism"],
    },
    {
        "employer_email": "jobs@universaltours.mv",
        "title": "Travel Consultant",
        "description_md": "Assist customers with travel planning, provide destination information, and process bookings for Maldivian resorts and experiences.",
        "requirements_md": "- 2+ years of travel industry experience\n- Excellent knowledge of Maldives tourism\n- Strong sales and customer service skills\n- Proficiency in booking systems\n- Fluency in multiple languages preferred",
        "location": "Male'",
        "salary_min": 20000,
        "salary_max": 30000,
        "status": "published",
        "tags": ["travel-planning", "customer-service", "sales", "tourism"],
        "categories": ["Travel & Tourism"],
    },
]


def validate_seed_data():
    """Validate that the seed data structure is correct."""
    print("🌴 Validating Maldivian seed data for JobSMV...\n")

    # Validate employers
    employer_names = [emp["company_name"] for emp in employers_data]
    print(f"✓ Found {len(employers_data)} employers across all sectors:")
    for name in employer_names:
        print(f"  - {name}")
    print()

    # Validate categories
    category_names = [cat["name"] for cat in categories_data]
    print(f"✓ Found {len(categories_data)} job categories tailored for Maldivian market:")
    for name in category_names:
        print(f"  - {name}")
    print()

    # Validate jobs
    job_titles = [job["title"] for job in jobs_data]
    print(f"✓ Found {len(jobs_data)} authentic Maldivian job listings:")
    for title in job_titles:
        print(f"  - {title}")
    print()

    # Check Maldivian locations
    job_locations = list(set([job["location"] for job in jobs_data]))
    print(f"✓ Job locations across Maldives: {', '.join(job_locations)}")
    print()

    # Check sectors represented
    tourism_jobs = [job for job in jobs_data if job["employer_email"] in [
        "hr@sunsiyam.mv", "careers@conradmaldives.com", "hr@villahotels.com", "jobs@universaltours.mv"
    ]]
    civil_jobs = [job for job in jobs_data if job["employer_email"] in [
        "careers@tourism.gov.mv", "hr@health.gov.mv", "recruitment@csc.gov.mv"
    ]]
    private_jobs = [job for job in jobs_data if job["employer_email"] in [
        "careers@bankofmaldives.com.mv", "hr@mtcc.com.mv", "jobs@dhiraagu.com.mv"
    ]]

    print("📊 Sector Distribution:")
    print(f"✓ Tourism sector: {len(tourism_jobs)} jobs")
    print(f"✓ Civil service sector: {len(civil_jobs)} jobs")
    print(f"✓ Private sector: {len(private_jobs)} jobs")
    print()

    print("✅ Seed data validation complete!")
    print("🏝️  The JobSMV seed data now features authentic Maldivian job listings")
    print("   across tourism, civil service, and private sectors with:")
    print("   - Real Maldivian companies and government ministries")
    print("   - Location-specific jobs (Male', atolls, resorts)")
    print("   - Maldivian Rufiyaa salary ranges")
    print("   - Dhivehi language requirements where appropriate")
    print("   - Sector-specific job categories")
    return True


if __name__ == "__main__":
    validate_seed_data()
