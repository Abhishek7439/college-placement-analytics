"""
Seed script — creates the DB tables, inserts default admin, departments,
and loads sample data if the database is fresh.
Run once: python seed.py
"""
import os
import sys
from app import create_app
from app.extensions import db
from app.models.admin import Admin
from app.models.department import Department
from app.models.student import Student
from app.models.placement import Placement
from app.utils.csv_parser import process_file


def seed(reset=False):
    app = create_app()
    with app.app_context():
        if reset:
            print("Resetting database...")
            db.drop_all()
        db.create_all()

        # 1. Admin
        if not Admin.query.filter_by(username="admin").first():
            admin = Admin(username="admin", email="admin@placement.edu")
            admin.set_password("Admin@1234")
            db.session.add(admin)
            db.session.commit()
            print("Default admin created  ->  username: admin  |  password: Admin@1234")
        else:
            print("Admin already exists.")

        # 2. Departments
        departments = [
            ("Computer Science", "CSE"),
            ("Information Technology", "IT"),
            ("Electronics", "ECE"),
            ("Mechanical", "MECH"),
            ("Civil", "CIVIL"),
            ("Electrical", "EEE"),
            ("Chemical", "CHEM"),
        ]
        dept_added = 0
        for name, code in departments:
            if not Department.query.filter_by(name=name).first():
                db.session.add(Department(name=name, code=code))
                dept_added += 1
        if dept_added > 0:
            db.session.commit()
            print(f"Seeded {dept_added} default departments.")
        else:
            print("Departments already seeded.")

        # 3. Sample Placements Data
        if Placement.query.count() == 0:
            csv_candidates = [
                os.path.abspath(os.path.join(os.path.dirname(__file__), "sample_data.csv")),
                os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_data.csv")),
            ]
            csv_path = next((p for p in csv_candidates if os.path.exists(p)), None)
            if csv_path:
                print(f"Importing sample data from {csv_path}...")
                res = process_file(csv_path, "csv")
                print(f"Sample data loaded: {res['stats']['inserted']} records inserted.")
            else:
                print("No sample_data.csv found to seed.")
        else:
            print("Placements already exist, skipping sample data import.")

        # 4. Unplaced & Opted-out Students for Statistical Diversity
        unplaced_count = Student.query.filter_by(status="unplaced").count()
        if unplaced_count == 0:
            print("Seeding unplaced and opted-out students for MFDA statistical analysis...")
            dept_map = {d.code: d.id for d in Department.query.all()}
            unplaced_data = [
                ("Aakash Varma", "CSE2021901", "aakash.v@college.edu", "CSE", 6.8, 58.0, 52.0, 68.0, 0, 1, 1, "unplaced"),
                ("Simran Kaur", "CSE2021902", "simran.k@college.edu", "CSE", 6.4, 52.0, 48.0, 64.0, 0, 1, 0, "unplaced"),
                ("Rajat Dixit", "CSE2021903", "rajat.d@college.edu", "CSE", 7.1, 62.0, 58.0, 70.0, 1, 2, 0, "unplaced"),
                ("Pooja Nair", "IT2021901", "pooja.n@college.edu", "IT", 6.9, 56.0, 50.0, 66.0, 0, 1, 1, "unplaced"),
                ("Abhay Dubey", "IT2021902", "abhay.d@college.edu", "IT", 6.2, 48.0, 45.0, 60.0, 0, 1, 2, "unplaced"),
                ("Kavita Rao", "IT2021903", "kavita.r@college.edu", "IT", 7.0, 60.0, 54.0, 72.0, 0, 2, 0, "unplaced"),
                ("Manish Soni", "ECE2021901", "manish.s@college.edu", "ECE", 6.6, 54.0, 48.0, 65.0, 0, 1, 1, "unplaced"),
                ("Shweta Sen", "ECE2021902", "shweta.s@college.edu", "ECE", 6.3, 50.0, 44.0, 62.0, 0, 1, 0, "unplaced"),
                ("Tarun Pillai", "ECE2021903", "tarun.p@college.edu", "ECE", 7.2, 64.0, 56.0, 74.0, 1, 2, 0, "unplaced"),
                ("Deepak Rawat", "MECH2021901", "deepak.r@college.edu", "MECH", 6.5, 52.0, 46.0, 66.0, 0, 1, 1, "unplaced"),
                ("Sonal Joshi", "MECH2021902", "sonal.j@college.edu", "MECH", 6.7, 55.0, 48.0, 68.0, 0, 2, 0, "unplaced"),
                ("Alok Bhatt", "MECH2021903", "alok.b@college.edu", "MECH", 6.1, 46.0, 42.0, 58.0, 0, 1, 2, "unplaced"),
                ("Harish Meena", "CIVIL2021901", "harish.m@college.edu", "CIVIL", 6.4, 48.0, 44.0, 60.0, 0, 1, 1, "unplaced"),
                ("Ankita Das", "CIVIL2021902", "ankita.d@college.edu", "CIVIL", 6.8, 54.0, 50.0, 64.0, 0, 1, 0, "unplaced"),
                ("Prateek Garg", "CIVIL2021903", "prateek.g@college.edu", "CIVIL", 6.0, 44.0, 40.0, 56.0, 0, 1, 2, "unplaced"),
                ("Geeta Verma", "EEE2021901", "geeta.v@college.edu", "EEE", 6.7, 56.0, 52.0, 68.0, 0, 1, 0, "unplaced"),
                ("Nitin Kumar", "EEE2021902", "nitin.k@college.edu", "EEE", 6.3, 50.0, 46.0, 62.0, 0, 1, 1, "unplaced"),
                ("Meenal Shah", "CHEM2021901", "meenal.s@college.edu", "CHEM", 6.9, 58.0, 50.0, 70.0, 0, 2, 0, "unplaced"),
                ("Kunal Sethi", "CHEM2021902", "kunal.s@college.edu", "CHEM", 6.2, 48.0, 44.0, 58.0, 0, 1, 1, "unplaced"),
                ("Devansh Ray", "CSE2021904", "devansh.r@college.edu", "CSE", 8.8, 88.0, 85.0, 84.0, 2, 3, 0, "opted_out"),
                ("Bhavya Patel", "ECE2021904", "bhavya.p@college.edu", "ECE", 8.6, 82.0, 80.0, 86.0, 1, 3, 0, "opted_out"),
                ("Siddharth Jain", "MECH2021904", "siddharth.j@college.edu", "MECH", 8.4, 78.0, 75.0, 82.0, 1, 2, 0, "opted_out"),
            ]
            for name, roll, email, dcode, cgpa, tech, coding, soft, intern, proj, backlogs, stat in unplaced_data:
                dept_id = dept_map.get(dcode, 1)
                st = Student(
                    name=name,
                    roll_number=roll,
                    email=email,
                    department_id=dept_id,
                    batch_year=2021,
                    cgpa=cgpa,
                    technical_score=tech,
                    coding_score=coding,
                    soft_skills_score=soft,
                    internships_count=intern,
                    projects_count=proj,
                    backlogs_count=backlogs,
                    status=stat
                )
                db.session.add(st)
            db.session.commit()
            print(f"Seeded {len(unplaced_data)} unplaced and opted-out students.")
        else:
            print("Unplaced students already seeded.")


if __name__ == "__main__":
    reset_db = "--reset" in sys.argv
    seed(reset=reset_db)
