import os
from flask import Blueprint, request, jsonify, send_file, current_app
from ..extensions import db
from ..models.report import Report
from ..utils.decorators import admin_required
from ..utils.report_generator import generate_pdf_report
from flask_jwt_extended import get_jwt_identity

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("", methods=["GET"])
@admin_required
def list_reports():
    reports = Report.query.order_by(Report.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reports]), 200


@reports_bp.route("/generate", methods=["POST"])
@admin_required
def generate_report():
    data = request.get_json()
    if not data.get("title") or not data.get("report_type"):
        return jsonify({"error": "title and report_type are required"}), 400

    admin_id = int(get_jwt_identity())
    reports_folder = os.path.abspath(current_app.config["REPORTS_FOLDER"])
    os.makedirs(reports_folder, exist_ok=True)

    report = Report(
        title=data["title"],
        report_type=data["report_type"],
        generated_by=admin_id,
        filters_used=data.get("filters", {}),
    )
    db.session.add(report)
    db.session.flush()  # get report.id before commit

    try:
        file_path = generate_pdf_report(report, reports_folder)
        report.file_path = os.path.abspath(file_path)
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Report generation failed: {str(e)}"}), 500

    db.session.commit()
    return jsonify(report.to_dict()), 201


@reports_bp.route("/<int:report_id>/download", methods=["GET"])
@admin_required
def download_report(report_id):
    report = Report.query.get_or_404(report_id)
    if not report.file_path:
        return jsonify({"error": "Report file not found"}), 404

    # Resolve absolute path
    abs_path = os.path.abspath(report.file_path)
    if not os.path.exists(abs_path):
        # Fallback check inside REPORTS_FOLDER
        reports_folder = os.path.abspath(current_app.config["REPORTS_FOLDER"])
        candidate = os.path.join(reports_folder, os.path.basename(report.file_path))
        if os.path.exists(candidate):
            abs_path = candidate
        else:
            return jsonify({"error": f"Report file not found on server at {report.file_path}"}), 404

    safe_title = "".join(c for c in (report.title or "report") if c.isalnum() or c in (" ", "_", "-")).strip().replace(" ", "_")
    download_filename = f"{safe_title}.pdf" if not safe_title.endswith(".pdf") else safe_title

    return send_file(
        abs_path,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=download_filename,
    )

