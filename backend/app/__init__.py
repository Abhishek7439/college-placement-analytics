from flask import Flask, jsonify, send_from_directory
from .config import get_config
from .extensions import db, jwt, cors, migrate


def create_app(config_class=None):
    app = Flask(__name__)

    cfg = config_class or get_config()
    app.config.from_object(cfg)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)

    # CORS: use origins from config (env-driven for production)
    cors_origins = app.config.get("CORS_ORIGINS", ["*"])
    supports_creds = False if ("*" in cors_origins or cors_origins == ["*"]) else True
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": cors_origins}},
        supports_credentials=supports_creds,
    )
    migrate.init_app(app, db)

    # Ensure upload / report directories exist
    import os
    os.makedirs(app.config["UPLOAD_FOLDER"],  exist_ok=True)
    os.makedirs(app.config["REPORTS_FOLDER"], exist_ok=True)

    # Register blueprints
    from .routes.auth        import auth_bp
    from .routes.students    import students_bp
    from .routes.departments import departments_bp
    from .routes.companies   import companies_bp
    from .routes.placements  import placements_bp
    from .routes.analytics   import analytics_bp
    from .routes.uploads     import uploads_bp
    from .routes.reports     import reports_bp
    from .routes.mfda        import mfda_bp

    app.register_blueprint(auth_bp,        url_prefix="/api/auth")
    app.register_blueprint(students_bp,    url_prefix="/api/students")
    app.register_blueprint(departments_bp, url_prefix="/api/departments")
    app.register_blueprint(companies_bp,   url_prefix="/api/companies")
    app.register_blueprint(placements_bp,  url_prefix="/api/placements")
    app.register_blueprint(analytics_bp,   url_prefix="/api/analytics")
    app.register_blueprint(uploads_bp,     url_prefix="/api/upload")
    app.register_blueprint(reports_bp,     url_prefix="/api/reports")
    app.register_blueprint(mfda_bp,        url_prefix="/api/mfda")

    # Serve React SPA in production if frontend/dist exists
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
    if os.path.exists(frontend_dist):
        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_spa(path):
            if path.startswith("api"):
                return jsonify({"error": "Endpoint not found"}), 404
            target = os.path.join(frontend_dist, path)
            if path and os.path.exists(target) and os.path.isfile(target):
                return send_from_directory(frontend_dist, path)
            return send_from_directory(frontend_dist, "index.html")

    return app
