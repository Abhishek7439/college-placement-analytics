from ..extensions import db
from datetime import datetime


class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    roll_number = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey("departments.id"), nullable=False)
    batch_year = db.Column(db.SmallInteger, nullable=False)
    cgpa = db.Column(db.Numeric(4, 2))
    technical_score = db.Column(db.Float, default=70.0)
    coding_score = db.Column(db.Float, default=65.0)
    soft_skills_score = db.Column(db.Float, default=75.0)
    internships_count = db.Column(db.Integer, default=1)
    projects_count = db.Column(db.Integer, default=2)
    backlogs_count = db.Column(db.Integer, default=0)
    status = db.Column(
        db.Enum("placed", "unplaced", "opted_out"), default="unplaced"
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    placements = db.relationship("Placement", backref="student", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "roll_number": self.roll_number,
            "email": self.email,
            "department_id": self.department_id,
            "department": self.department.name if self.department else None,
            "batch_year": self.batch_year,
            "cgpa": float(self.cgpa) if self.cgpa else None,
            "technical_score": float(self.technical_score) if self.technical_score is not None else 70.0,
            "coding_score": float(self.coding_score) if self.coding_score is not None else 65.0,
            "soft_skills_score": float(self.soft_skills_score) if self.soft_skills_score is not None else 75.0,
            "internships_count": int(self.internships_count) if self.internships_count is not None else 0,
            "projects_count": int(self.projects_count) if self.projects_count is not None else 0,
            "backlogs_count": int(self.backlogs_count) if self.backlogs_count is not None else 0,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }
