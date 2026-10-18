import csv
import random
import os

random.seed(42)

departments = [
    ("Computer Science", "CSE"),
    ("Information Technology", "IT"),
    ("Electronics", "ECE"),
    ("Mechanical", "MECH"),
    ("Civil", "CIVIL"),
    ("Electrical", "EEE"),
    ("Chemical", "CHEM"),
]

companies_by_dept = {
    "Computer Science": [
        ("Google", "IT", "Bangalore", "Software Engineer", (28.0, 38.0)),
        ("Microsoft", "IT", "Hyderabad", "Software Engineer", (25.0, 34.0)),
        ("Amazon", "IT", "Hyderabad", "SDE-1", (24.0, 32.0)),
        ("Adobe", "IT", "Noida", "Member of Tech Staff", (18.0, 26.0)),
        ("TCS", "IT", "Mumbai", "System Engineer", (6.5, 9.0)),
        ("Infosys", "IT", "Bangalore", "Specialist Programmer", (7.0, 9.5)),
        ("Flipkart", "IT", "Bangalore", "Software Developer", (18.0, 26.0)),
        ("Oracle", "IT", "Bangalore", "Cloud Engineer", (14.0, 20.0)),
    ],
    "Information Technology": [
        ("Capgemini", "IT", "Pune", "Senior Analyst", (6.5, 8.5)),
        ("Accenture", "IT", "Bangalore", "Advanced App Analyst", (8.0, 11.0)),
        ("Cognizant", "IT", "Chennai", "Programmer Analyst", (6.5, 8.5)),
        ("Zoho", "IT", "Chennai", "Member Technical Staff", (9.0, 14.0)),
        ("IBM", "IT", "Bangalore", "Software Developer", (10.0, 15.0)),
        ("Cisco", "IT", "Bangalore", "Network Engineer", (16.0, 22.0)),
        ("Salesforce", "IT", "Hyderabad", "MTS Developer", (22.0, 30.0)),
    ],
    "Electronics": [
        ("Qualcomm", "Core Electronics", "Hyderabad", "Hardware Engineer", (18.0, 25.0)),
        ("Intel", "Core Electronics", "Bangalore", "SoC Design Engineer", (19.0, 26.0)),
        ("Texas Instruments", "Core Electronics", "Bangalore", "Analog Design Engineer", (18.0, 24.0)),
        ("Samsung", "Core Electronics", "Noida", "Embedded Engineer", (13.0, 17.0)),
        ("Siemens", "Core Electronics", "Bangalore", "Firmware Engineer", (10.0, 14.0)),
        ("Bosch", "Core Electronics", "Pune", "Automotive Systems Engineer", (8.5, 12.0)),
    ],
    "Mechanical": [
        ("Tata Motors", "Manufacturing", "Pune", "Design Engineer Trainee", (7.0, 9.5)),
        ("Mahindra & Mahindra", "Manufacturing", "Mumbai", "R&D Engineer", (7.5, 10.0)),
        ("Caterpillar", "Manufacturing", "Bangalore", "Associate Engineer", (10.0, 14.0)),
        ("Cummins", "Manufacturing", "Pune", "Applications Engineer", (8.5, 12.0)),
        ("Larsen & Toubro", "Manufacturing", "Mumbai", "Graduate Engineer", (7.0, 9.0)),
        ("BHEL", "Manufacturing", "Hyderabad", "Engineer Trainee", (6.5, 8.5)),
    ],
    "Civil": [
        ("L&T Construction", "Infrastructure", "Chennai", "Civil Site Engineer", (6.5, 8.5)),
        ("Shapoorji Pallonji", "Infrastructure", "Mumbai", "Planning Engineer", (6.0, 8.0)),
        ("Afcons Infrastructure", "Infrastructure", "Delhi", "Design Engineer", (6.5, 9.0)),
        ("Tata Projects", "Infrastructure", "Hyderabad", "Project Engineer", (7.0, 9.5)),
        ("Gammon India", "Infrastructure", "Mumbai", "Site Supervisor", (5.5, 7.5)),
    ],
    "Electrical": [
        ("Schneider Electric", "Power Systems", "Bangalore", "Power Systems Engineer", (8.0, 12.0)),
        ("ABB", "Power Systems", "Bangalore", "Control Systems Engineer", (9.0, 13.0)),
        ("Alstom", "Power Systems", "Chennai", "Electrical Design Engineer", (7.5, 10.5)),
        ("Havells", "Manufacturing", "Noida", "Product Engineer", (6.5, 9.0)),
        ("L&T Power", "Power Systems", "Vadodara", "Junior Engineer", (6.5, 8.5)),
    ],
    "Chemical": [
        ("Reliance Industries", "Petrochemicals", "Jamnagar", "Process Engineer", (8.5, 13.0)),
        ("Tata Chemicals", "Chemicals", "Mumbai", "Operations Engineer", (7.5, 10.5)),
        ("BASF", "Chemicals", "Navi Mumbai", "R&D Associate", (8.0, 11.5)),
        ("Asian Paints", "Chemicals", "Mumbai", "Production Engineer", (9.0, 14.0)),
        ("Hindustan Petroleum", "Petrochemicals", "Visakhapatnam", "Process Trainee", (8.0, 12.0)),
    ]
}

first_names = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
    "Shaurya", "Atharva", "Dhruv", "Kabir", "Rudra", "Ananya", "Diya", "Gauri", "Pari", "Anika",
    "Navya", "Rhea", "Avani", "Isha", "Manya", "Tanvi", "Saanvi", "Aadya", "Kiara", "Prisha",
    "Rohan", "Sneha", "Karan", "Pooja", "Vikram", "Divya", "Suresh", "Neha", "Rahul", "Meera",
    "Sanjay", "Preethi", "Nikhil", "Rishika", "Tanmay", "Aparna", "Gaurav", "Shreya", "Rishi", "Nandini",
    "Saurabh", "Priyanka", "Akash", "Kritika", "Deepak", "Swati", "Manish", "Aditi", "Harsh", "Simran",
    "Varun", "Bhavna", "Abhishek", "Ritika", "Kartik", "Shalini", "Mayank", "Pallavi", "Naveen", "Archana",
    "Sachin", "Monika", "Yash", "Anjali", "Alok", "Rashmi", "Tarun", "Payal", "Pranav", "Sunita",
    "Rajesh", "Kavita", "Dinesh", "Komal", "Amit", "Sapna", "Sunil", "Juhi", "Hemant", "Garima"
]

last_names = [
    "Sharma", "Verma", "Gupta", "Mehta", "Singh", "Rao", "Joshi", "Nair", "Menon", "Kumar",
    "Agarwal", "Bose", "Pillai", "Tiwari", "Reddy", "Iyer", "Raj", "Desai", "Shah", "Kulkarni",
    "Mishra", "Das", "Banerjee", "Pandey", "Ghosh", "Jain", "Yadav", "Patel", "Chauhan", "Bhatia",
    "Saxena", "Malhotra", "Kapoor", "Chopra", "Dutta", "Sengupta", "Chatterjee", "Mukherjee", "Roy", "Sen"
]

# Generate 100 placed student rows
placed_rows = []
used_emails = set()
used_rolls = set()

count = 0
for dept_name, dept_code in departments:
    target_count = 15 if dept_name in ["Computer Science", "Information Technology", "Electronics"] else 11
    dept_comps = companies_by_dept[dept_name]

    for _ in range(target_count):
        count += 1
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        name = f"{fn} {ln}"
        
        roll_num = f"{dept_code}2021{count:03d}"
        email = f"{fn.lower()}.{ln.lower()}{count}@college.edu"
        
        batch_year = 2021
        cgpa = round(random.gauss(8.3, 0.7), 2)
        cgpa = max(6.5, min(9.9, cgpa))
        
        tech_score = round(random.gauss(50 + cgpa * 3.5, 6), 1)
        tech_score = max(55.0, min(99.0, tech_score))
        
        coding_score = round(random.gauss(tech_score - 2, 7), 1)
        coding_score = max(50.0, min(99.0, coding_score))
        
        soft_skills = round(random.gauss(76, 8), 1)
        soft_skills = max(58.0, min(98.0, soft_skills))
        
        internships = random.choices([0, 1, 2, 3], weights=[0.12, 0.48, 0.30, 0.10])[0]
        projects = random.choices([1, 2, 3, 4], weights=[0.15, 0.45, 0.30, 0.10])[0]
        backlogs = 0 if cgpa >= 7.5 else random.choices([0, 1], weights=[0.8, 0.2])[0]
        
        # Select company
        comp_name, sector, loc, role, (min_p, max_p) = random.choice(dept_comps)
        
        # Package correlated with CGPA, tech, internships
        base_factor = (cgpa - 6.5) / 3.4
        package = min_p + base_factor * (max_p - min_p) + (internships * 1.5) + (projects * 0.4) + random.uniform(-1.0, 1.5)
        package = round(max(min_p, min(max_p + 4.0, package)), 2)
        
        offer_year = random.choices([2023, 2024, 2025], weights=[0.20, 0.55, 0.25])[0]
        offer_month = random.randint(1, 6)
        offer_day = random.randint(1, 28)
        offer_date = f"{offer_year}-{offer_month:02d}-{offer_day:02d}"
        
        placed_rows.append({
            "student_name": name,
            "roll_number": roll_num,
            "email": email,
            "department": dept_name,
            "batch_year": batch_year,
            "cgpa": cgpa,
            "technical_score": tech_score,
            "coding_score": coding_score,
            "soft_skills_score": soft_skills,
            "internships_count": internships,
            "projects_count": projects,
            "backlogs_count": backlogs,
            "company_name": comp_name,
            "sector": sector,
            "location": loc,
            "package_lpa": package,
            "role": role,
            "offer_date": offer_date,
            "year": offer_year,
        })

# Write to sample_data.csv
fieldnames = [
    "student_name", "roll_number", "email", "department", "batch_year", "cgpa",
    "technical_score", "coding_score", "soft_skills_score", "internships_count", "projects_count", "backlogs_count",
    "company_name", "sector", "location", "package_lpa", "role", "offer_date", "year"
]

csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_data.csv"))
with open(csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(placed_rows)

print(f"Wrote {len(placed_rows)} enriched placement records to {csv_path}")
