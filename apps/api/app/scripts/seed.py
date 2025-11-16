"""Seed script for populating sample data."""
import asyncio
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.db.models import Employer, Job, Category, JobCategory, Application
from app.core.security import get_password_hash
import uuid
import random


async def seed():
    """Seed database with sample data."""
    async with AsyncSessionLocal() as db:
        # Create multiple employers
        employers_data = [
            {
                "company_name": "TechCorp Solutions",
                "email": "demo@example.com",
                "password": "demo123",
                "contact_info": {"phone": "+1234567890", "website": "https://techcorp.example.com"},
            },
            {
                "company_name": "Design Studio Pro",
                "email": "hr@designstudio.com",
                "password": "demo123",
                "contact_info": {"phone": "+1987654321", "website": "https://designstudio.com"},
            },
            {
                "company_name": "CloudScale Inc",
                "email": "careers@cloudscale.io",
                "password": "demo123",
                "contact_info": {"phone": "+1555123456", "website": "https://cloudscale.io"},
            },
            {
                "company_name": "DataFlow Systems",
                "email": "jobs@dataflow.com",
                "password": "demo123",
                "contact_info": {"phone": "+1444555666", "website": "https://dataflow.com"},
            },
            {
                "company_name": "StartupHub Ventures",
                "email": "team@startuphub.com",
                "password": "demo123",
                "contact_info": {"phone": "+1777888999", "website": "https://startuphub.com"},
            },
            {
                "company_name": "FinanceTech Global",
                "email": "recruiting@financetech.com",
                "password": "demo123",
                "contact_info": {"phone": "+1222333444", "website": "https://financetech.com"},
            },
            {
                "company_name": "HealthCare Innovations",
                "email": "hr@healthcare.io",
                "password": "demo123",
                "contact_info": {"phone": "+1999888777", "website": "https://healthcare.io"},
            },
        ]

        employers = {}
        for emp_data in employers_data:
            result = await db.execute(select(Employer).where(Employer.email == emp_data["email"]))
            employer = result.scalar_one_or_none()

            if not employer:
                employer = Employer(
                    id=uuid.uuid4(),
                    company_name=emp_data["company_name"],
                    email=emp_data["email"],
                    password_hash=get_password_hash(emp_data["password"]),
                    contact_info=emp_data["contact_info"],
                )
                db.add(employer)
                await db.flush()
                print(f"Created employer: {employer.company_name}")
            employers[emp_data["email"]] = employer

        # Create more categories
        categories_data = [
            {"name": "Engineering", "description": "Software engineering and development"},
            {"name": "Design", "description": "UI/UX and graphic design"},
            {"name": "Marketing", "description": "Marketing and communications"},
            {"name": "Sales", "description": "Sales and business development"},
            {"name": "Product Management", "description": "Product strategy and management"},
            {"name": "Data Science", "description": "Data analysis and machine learning"},
            {"name": "DevOps", "description": "Infrastructure and deployment"},
            {"name": "QA/Testing", "description": "Quality assurance and testing"},
            {"name": "Customer Success", "description": "Customer support and success"},
            {"name": "Finance", "description": "Financial analysis and accounting"},
            {"name": "HR/Recruiting", "description": "Human resources and talent acquisition"},
            {"name": "Operations", "description": "Business operations and management"},
        ]

        categories = {}
        for cat_data in categories_data:
            result = await db.execute(select(Category).where(Category.name == cat_data["name"]))
            category = result.scalar_one_or_none()
            if not category:
                category = Category(
                    id=uuid.uuid4(),
                    name=cat_data["name"],
                    description=cat_data["description"],
                )
                db.add(category)
                await db.flush()
            categories[cat_data["name"]] = category
            print(f"Created/Found category: {category.name}")

        # Create many more jobs
        jobs_data = [
            # TechCorp Solutions jobs
            {
                "employer_email": "demo@example.com",
                "title": "Senior Software Engineer",
                "description_md": "We are looking for an experienced software engineer to join our backend team. You'll work on building scalable APIs and microservices using modern technologies.",
                "requirements_md": "- 5+ years of software development experience\n- Strong Python/FastAPI knowledge\n- Experience with PostgreSQL and Redis\n- Understanding of microservices architecture\n- Bachelor's degree in Computer Science or equivalent",
                "location": "Remote",
                "salary_min": 120000,
                "salary_max": 180000,
                "status": "published",
                "tags": ["python", "fastapi", "postgresql", "remote", "backend"],
                "categories": ["Engineering"],
            },
            {
                "employer_email": "demo@example.com",
                "title": "Frontend Developer",
                "description_md": "Join our frontend team to build beautiful and responsive user interfaces. You'll work with React, TypeScript, and modern CSS frameworks.",
                "requirements_md": "- 3+ years of frontend development\n- Strong React and TypeScript skills\n- Experience with Next.js\n- Knowledge of CSS-in-JS solutions\n- Portfolio of previous work",
                "location": "San Francisco, CA",
                "salary_min": 100000,
                "salary_max": 150000,
                "status": "published",
                "tags": ["react", "typescript", "nextjs", "frontend"],
                "categories": ["Engineering"],
            },
            {
                "employer_email": "demo@example.com",
                "title": "DevOps Engineer",
                "description_md": "Help us scale our infrastructure and improve our deployment pipelines. You'll work with AWS, Docker, Kubernetes, and CI/CD tools.",
                "requirements_md": "- 4+ years of DevOps experience\n- Strong AWS knowledge\n- Experience with Kubernetes and Docker\n- CI/CD pipeline expertise\n- Infrastructure as Code (Terraform/CloudFormation)",
                "location": "Remote",
                "salary_min": 130000,
                "salary_max": 170000,
                "status": "published",
                "tags": ["aws", "kubernetes", "docker", "devops", "ci-cd"],
                "categories": ["DevOps"],
            },
            # Design Studio Pro jobs
            {
                "employer_email": "hr@designstudio.com",
                "title": "Senior UI/UX Designer",
                "description_md": "Lead design initiatives for our client projects. Create intuitive and beautiful user experiences across web and mobile platforms.",
                "requirements_md": "- 5+ years of UI/UX design experience\n- Strong portfolio demonstrating design skills\n- Proficiency in Figma, Sketch, or Adobe XD\n- Understanding of user research methods\n- Experience with design systems",
                "location": "New York, NY",
                "salary_min": 110000,
                "salary_max": 150000,
                "status": "published",
                "tags": ["ui", "ux", "design", "figma", "user-research"],
                "categories": ["Design"],
            },
            {
                "employer_email": "hr@designstudio.com",
                "title": "Product Designer",
                "description_md": "Work closely with product managers and engineers to design features that users love. You'll own the design process from research to implementation.",
                "requirements_md": "- 3+ years of product design experience\n- Strong visual and interaction design skills\n- Experience with prototyping tools\n- Ability to work in a fast-paced environment\n- Portfolio required",
                "location": "Remote",
                "salary_min": 90000,
                "salary_max": 130000,
                "status": "published",
                "tags": ["product-design", "prototyping", "user-experience"],
                "categories": ["Design", "Product Management"],
            },
            # CloudScale Inc jobs
            {
                "employer_email": "careers@cloudscale.io",
                "title": "Cloud Solutions Architect",
                "description_md": "Design and implement cloud infrastructure solutions for enterprise clients. Help migrate legacy systems to modern cloud platforms.",
                "requirements_md": "- 7+ years of cloud architecture experience\n- AWS/Azure/GCP certifications preferred\n- Experience with large-scale migrations\n- Strong communication and client-facing skills\n- Bachelor's degree in related field",
                "location": "Seattle, WA",
                "salary_min": 150000,
                "salary_max": 200000,
                "status": "published",
                "tags": ["aws", "cloud", "architecture", "enterprise"],
                "categories": ["DevOps", "Engineering"],
            },
            {
                "employer_email": "careers@cloudscale.io",
                "title": "Site Reliability Engineer",
                "description_md": "Ensure our cloud infrastructure is reliable, scalable, and performant. You'll be on-call and work on automation and monitoring.",
                "requirements_md": "- 4+ years of SRE or DevOps experience\n- Strong scripting skills (Python, Bash)\n- Experience with monitoring tools (Prometheus, Grafana)\n- On-call experience\n- Incident response and post-mortem experience",
                "location": "Remote",
                "salary_min": 140000,
                "salary_max": 180000,
                "status": "published",
                "tags": ["sre", "monitoring", "automation", "reliability"],
                "categories": ["DevOps"],
            },
            # DataFlow Systems jobs
            {
                "employer_email": "jobs@dataflow.com",
                "title": "Senior Data Engineer",
                "description_md": "Build and maintain our data pipelines and infrastructure. Work with large-scale data processing systems and help enable data-driven decisions.",
                "requirements_md": "- 5+ years of data engineering experience\n- Strong Python and SQL skills\n- Experience with Spark, Airflow, or similar\n- Knowledge of data warehousing (Snowflake, BigQuery)\n- Understanding of ETL/ELT processes",
                "location": "Boston, MA",
                "salary_min": 130000,
                "salary_max": 170000,
                "status": "published",
                "tags": ["data-engineering", "python", "spark", "etl", "sql"],
                "categories": ["Data Science", "Engineering"],
            },
            {
                "employer_email": "jobs@dataflow.com",
                "title": "Machine Learning Engineer",
                "description_md": "Develop and deploy machine learning models at scale. Work on recommendation systems, predictive analytics, and NLP applications.",
                "requirements_md": "- 4+ years of ML engineering experience\n- Strong Python and ML frameworks (TensorFlow, PyTorch)\n- Experience with MLOps and model deployment\n- Understanding of distributed systems\n- Master's degree in related field preferred",
                "location": "Remote",
                "salary_min": 140000,
                "salary_max": 190000,
                "status": "published",
                "tags": ["machine-learning", "python", "tensorflow", "pytorch", "mlops"],
                "categories": ["Data Science"],
            },
            {
                "employer_email": "jobs@dataflow.com",
                "title": "Data Scientist",
                "description_md": "Analyze complex datasets to extract insights and build predictive models. Work closely with business stakeholders to solve real-world problems.",
                "requirements_md": "- 3+ years of data science experience\n- Strong statistical and analytical skills\n- Proficiency in Python/R and SQL\n- Experience with visualization tools\n- Master's or PhD in Statistics, Math, or related field",
                "location": "Boston, MA",
                "salary_min": 110000,
                "salary_max": 150000,
                "status": "published",
                "tags": ["data-science", "statistics", "python", "analytics"],
                "categories": ["Data Science"],
            },
            # StartupHub Ventures jobs
            {
                "employer_email": "team@startuphub.com",
                "title": "Product Manager",
                "description_md": "Lead product strategy and execution for our platform. Work with engineering, design, and business teams to ship features that matter.",
                "requirements_md": "- 4+ years of product management experience\n- Strong analytical and communication skills\n- Experience with agile methodologies\n- Technical background preferred\n- Experience with B2B SaaS products",
                "location": "Austin, TX",
                "salary_min": 120000,
                "salary_max": 160000,
                "status": "published",
                "tags": ["product-management", "strategy", "saas", "agile"],
                "categories": ["Product Management"],
            },
            {
                "employer_email": "team@startuphub.com",
                "title": "Full Stack Engineer",
                "description_md": "Build end-to-end features for our platform. You'll work on both frontend and backend, making a real impact on our product.",
                "requirements_md": "- 3+ years of full stack development\n- React and Node.js experience\n- Database design skills\n- Ability to work in a fast-paced startup environment\n- Strong problem-solving skills",
                "location": "Austin, TX",
                "salary_min": 100000,
                "salary_max": 140000,
                "status": "published",
                "tags": ["fullstack", "react", "nodejs", "startup"],
                "categories": ["Engineering"],
            },
            {
                "employer_email": "team@startuphub.com",
                "title": "Marketing Manager",
                "description_md": "Lead our marketing efforts to grow brand awareness and acquire customers. You'll manage campaigns, content, and partnerships.",
                "requirements_md": "- 5+ years of marketing experience\n- Digital marketing expertise\n- Experience with marketing automation tools\n- Strong analytical skills\n- B2B SaaS marketing experience preferred",
                "location": "Remote",
                "salary_min": 90000,
                "salary_max": 130000,
                "status": "published",
                "tags": ["marketing", "digital-marketing", "saas", "growth"],
                "categories": ["Marketing"],
            },
            # FinanceTech Global jobs
            {
                "employer_email": "recruiting@financetech.com",
                "title": "Senior Backend Engineer",
                "description_md": "Build secure and scalable financial systems. You'll work on payment processing, transaction systems, and financial APIs.",
                "requirements_md": "- 6+ years of backend development\n- Strong Java or Go experience\n- Experience with financial systems preferred\n- Understanding of security best practices\n- Experience with distributed systems",
                "location": "New York, NY",
                "salary_min": 150000,
                "salary_max": 200000,
                "status": "published",
                "tags": ["backend", "java", "go", "fintech", "payments"],
                "categories": ["Engineering"],
            },
            {
                "employer_email": "recruiting@financetech.com",
                "title": "Security Engineer",
                "description_md": "Protect our systems and customer data. You'll conduct security audits, implement security controls, and respond to incidents.",
                "requirements_md": "- 5+ years of security engineering experience\n- Strong understanding of security principles\n- Experience with penetration testing\n- Knowledge of compliance (SOC2, PCI-DSS)\n- Security certifications preferred",
                "location": "Remote",
                "salary_min": 140000,
                "salary_max": 180000,
                "status": "published",
                "tags": ["security", "cybersecurity", "compliance", "penetration-testing"],
                "categories": ["Engineering"],
            },
            {
                "employer_email": "recruiting@financetech.com",
                "title": "Financial Analyst",
                "description_md": "Analyze financial data and market trends to support business decisions. Create reports and models for stakeholders.",
                "requirements_md": "- 3+ years of financial analysis experience\n- Strong Excel and SQL skills\n- Understanding of financial markets\n- Bachelor's degree in Finance, Economics, or related field\n- CFA or similar certification preferred",
                "location": "New York, NY",
                "salary_min": 80000,
                "salary_max": 120000,
                "status": "published",
                "tags": ["finance", "analysis", "excel", "sql", "financial-modeling"],
                "categories": ["Finance"],
            },
            # HealthCare Innovations jobs
            {
                "employer_email": "hr@healthcare.io",
                "title": "Healthcare Data Analyst",
                "description_md": "Analyze healthcare data to improve patient outcomes and operational efficiency. Work with clinical and administrative data.",
                "requirements_md": "- 3+ years of healthcare data analysis\n- Strong SQL and Python skills\n- Understanding of healthcare systems (HL7, FHIR)\n- Experience with healthcare regulations (HIPAA)\n- Bachelor's degree in related field",
                "location": "Chicago, IL",
                "salary_min": 85000,
                "salary_max": 115000,
                "status": "published",
                "tags": ["healthcare", "data-analysis", "sql", "hipaa"],
                "categories": ["Data Science"],
            },
            {
                "employer_email": "hr@healthcare.io",
                "title": "QA Automation Engineer",
                "description_md": "Build and maintain automated test suites for our healthcare platform. Ensure quality and reliability of our software.",
                "requirements_md": "- 4+ years of QA automation experience\n- Strong Selenium/Cypress skills\n- Experience with test frameworks (Jest, pytest)\n- Understanding of CI/CD integration\n- Healthcare domain knowledge preferred",
                "location": "Remote",
                "salary_min": 95000,
                "salary_max": 125000,
                "status": "published",
                "tags": ["qa", "automation", "testing", "selenium", "cypress"],
                "categories": ["QA/Testing"],
            },
            # More diverse jobs
            {
                "employer_email": "demo@example.com",
                "title": "Sales Development Representative",
                "description_md": "Generate leads and qualify prospects for our sales team. You'll be the first point of contact for potential customers.",
                "requirements_md": "- 1+ years of sales or customer service experience\n- Strong communication skills\n- Ability to work in a fast-paced environment\n- CRM experience preferred\n- Bachelor's degree preferred",
                "location": "Remote",
                "salary_min": 50000,
                "salary_max": 70000,
                "status": "published",
                "tags": ["sales", "sdr", "lead-generation", "crm"],
                "categories": ["Sales"],
            },
            {
                "employer_email": "hr@designstudio.com",
                "title": "Graphic Designer",
                "description_md": "Create visual designs for marketing materials, websites, and brand assets. Work with the marketing and product teams.",
                "requirements_md": "- 2+ years of graphic design experience\n- Proficiency in Adobe Creative Suite\n- Strong portfolio\n- Understanding of branding principles\n- Bachelor's degree in Design or related field",
                "location": "Los Angeles, CA",
                "salary_min": 60000,
                "salary_max": 85000,
                "status": "published",
                "tags": ["graphic-design", "adobe", "branding", "marketing"],
                "categories": ["Design", "Marketing"],
            },
            {
                "employer_email": "careers@cloudscale.io",
                "title": "Customer Success Manager",
                "description_md": "Help our customers achieve success with our platform. Build relationships, onboard new customers, and ensure satisfaction.",
                "requirements_md": "- 3+ years of customer success experience\n- Strong communication and relationship-building skills\n- Technical aptitude\n- Experience with SaaS products\n- Ability to travel occasionally",
                "location": "Remote",
                "salary_min": 70000,
                "salary_max": 95000,
                "status": "published",
                "tags": ["customer-success", "saas", "account-management"],
                "categories": ["Customer Success"],
            },
            {
                "employer_email": "jobs@dataflow.com",
                "title": "Business Intelligence Analyst",
                "description_md": "Create dashboards and reports to help business stakeholders make data-driven decisions. Work with various data sources.",
                "requirements_md": "- 3+ years of BI experience\n- Strong SQL skills\n- Experience with BI tools (Tableau, Power BI, Looker)\n- Understanding of data modeling\n- Business acumen",
                "location": "Remote",
                "salary_min": 85000,
                "salary_max": 115000,
                "status": "published",
                "tags": ["business-intelligence", "tableau", "sql", "analytics"],
                "categories": ["Data Science"],
            },
            {
                "employer_email": "team@startuphub.com",
                "title": "Content Marketing Manager",
                "description_md": "Develop and execute content strategy to attract and engage our target audience. Create blog posts, guides, and other content.",
                "requirements_md": "- 4+ years of content marketing experience\n- Strong writing and editing skills\n- SEO knowledge\n- Experience with content management systems\n- Portfolio of published work",
                "location": "Remote",
                "salary_min": 75000,
                "salary_max": 105000,
                "status": "published",
                "tags": ["content-marketing", "seo", "writing", "blogging"],
                "categories": ["Marketing"],
            },
            {
                "employer_email": "recruiting@financetech.com",
                "title": "Account Executive",
                "description_md": "Manage relationships with enterprise clients and close large deals. You'll work with C-level executives and navigate complex sales cycles.",
                "requirements_md": "- 5+ years of enterprise sales experience\n- Track record of closing large deals\n- Experience with financial services clients\n- Strong negotiation skills\n- Ability to travel",
                "location": "New York, NY",
                "salary_min": 100000,
                "salary_max": 200000,
                "status": "published",
                "tags": ["sales", "enterprise", "account-executive", "fintech"],
                "categories": ["Sales"],
            },
            {
                "employer_email": "hr@healthcare.io",
                "title": "Operations Manager",
                "description_md": "Oversee day-to-day operations and ensure smooth business processes. Work on process improvement and team coordination.",
                "requirements_md": "- 5+ years of operations management experience\n- Strong organizational and leadership skills\n- Experience with process improvement\n- Healthcare industry knowledge preferred\n- MBA preferred",
                "location": "Chicago, IL",
                "salary_min": 90000,
                "salary_max": 130000,
                "status": "published",
                "tags": ["operations", "management", "process-improvement"],
                "categories": ["Operations"],
            },
            # Draft jobs
            {
                "employer_email": "demo@example.com",
                "title": "Junior Software Engineer",
                "description_md": "We're looking for a junior engineer to join our team. Great opportunity to learn and grow in a supportive environment.",
                "requirements_md": "- 1-2 years of software development experience\n- Strong fundamentals in programming\n- Eagerness to learn\n- Computer Science degree or bootcamp completion",
                "location": "Remote",
                "salary_min": 70000,
                "salary_max": 90000,
                "status": "draft",
                "tags": ["junior", "entry-level", "python", "javascript"],
                "categories": ["Engineering"],
            },
            {
                "employer_email": "hr@designstudio.com",
                "title": "Marketing Coordinator",
                "description_md": "Support our marketing team with campaigns, events, and content creation. Great entry-level opportunity.",
                "requirements_md": "- 1+ years of marketing experience or internship\n- Strong communication skills\n- Social media experience\n- Bachelor's degree in Marketing or related field",
                "location": "New York, NY",
                "salary_min": 45000,
                "salary_max": 60000,
                "status": "draft",
                "tags": ["marketing", "entry-level", "social-media", "coordinator"],
                "categories": ["Marketing"],
            },
            # Closed jobs
            {
                "employer_email": "careers@cloudscale.io",
                "title": "Technical Writer",
                "description_md": "Create technical documentation for our products and APIs. Help developers understand and use our platform effectively.",
                "requirements_md": "- 3+ years of technical writing experience\n- Strong writing and editing skills\n- Technical background\n- Experience with API documentation\n- Portfolio of technical writing samples",
                "location": "Remote",
                "salary_min": 80000,
                "salary_max": 110000,
                "status": "closed",
                "tags": ["technical-writing", "documentation", "api"],
                "categories": ["Engineering"],
            },
        ]

        created_jobs = []
        for job_data in jobs_data:
            employer = employers[job_data["employer_email"]]
            result = await db.execute(
                select(Job).where(
                    Job.title == job_data["title"], Job.employer_id == employer.id
                )
            )
            job = result.scalar_one_or_none()

            if not job:
                job = Job(
                    id=uuid.uuid4(),
                    employer_id=employer.id,
                    title=job_data["title"],
                    description_md=job_data["description_md"],
                    requirements_md=job_data["requirements_md"],
                    location=job_data["location"],
                    salary_min=job_data["salary_min"],
                    salary_max=job_data["salary_max"],
                    status=job_data["status"],
                    tags=job_data["tags"],
                )
                db.add(job)
                await db.flush()

                # Link categories
                for cat_name in job_data["categories"]:
                    category = categories[cat_name]
                    job_category = JobCategory(job_id=job.id, category_id=category.id)
                    db.add(job_category)

                created_jobs.append(job)
                print(f"Created job: {job.title} at {employer.company_name}")

        await db.flush()

        # Create some sample applications
        application_statuses = ["new", "screening", "interview", "offer", "hired", "rejected"]
        applicant_names = [
            "John Smith", "Sarah Johnson", "Michael Chen", "Emily Davis", "David Wilson",
            "Jessica Martinez", "Robert Taylor", "Amanda Brown", "James Anderson", "Lisa Garcia",
            "Christopher Lee", "Michelle White", "Daniel Harris", "Jennifer Thompson", "Matthew Moore",
        ]
        applicant_emails = [
            "john.smith@email.com", "sarah.j@email.com", "mchen@email.com", "emily.davis@email.com",
            "dwilson@email.com", "jessica.m@email.com", "rtaylor@email.com", "amanda.b@email.com",
            "janderson@email.com", "lisa.g@email.com", "chris.lee@email.com", "michelle.w@email.com",
            "daniel.h@email.com", "jen.thompson@email.com", "matt.moore@email.com",
        ]

        # Create applications for some published jobs
        published_jobs = [job for job in created_jobs if job.status == "published"]
        if published_jobs:
            for i in range(min(25, len(published_jobs) * 3)):  # Up to 3 applications per job
                job = random.choice(published_jobs)
                applicant_idx = i % len(applicant_names)
                
                application = Application(
                    id=uuid.uuid4(),
                    employer_id=job.employer_id,
                    job_id=job.id,
                    applicant_name=applicant_names[applicant_idx],
                    applicant_email=applicant_emails[applicant_idx],
                    cover_letter_md=f"I am very interested in the {job.title} position at your company. I believe my skills and experience align well with your requirements.",
                    status=random.choice(application_statuses),
                    notes=random.choice([
                        None,
                        "Strong technical background",
                        "Good cultural fit",
                        "Needs more experience",
                        "Excellent communication skills",
                    ]),
                )
                db.add(application)
                print(f"Created application from {application.applicant_name} for {job.title}")

        await db.commit()
        print(f"\nDatabase seeded successfully!")
        print(f"- {len(employers)} employers")
        print(f"- {len(categories)} categories")
        print(f"- {len(created_jobs)} jobs")
        print(f"- {min(25, len(published_jobs) * 3)} applications")


if __name__ == "__main__":
    asyncio.run(seed())

