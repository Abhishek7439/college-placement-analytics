import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const publicLinks = [
  { to: "/",            label: "Dashboard",     icon: "bi-speedometer2" },
  { to: "/departments", label: "Departments",   icon: "bi-diagram-3"    },
  { to: "/companies",   label: "Companies",     icon: "bi-building"     },
  { to: "/trends",      label: "Yearly Trends", icon: "bi-graph-up"     },
];

export default function PublicNavbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ zIndex: 1030 }}>
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand" to="/">
          <span className="brand-icon">
            <i className="bi bi-mortarboard-fill text-white" />
          </span>
          <span>
            <div style={{ lineHeight: 1.1 }}>College Placement</div>
            <div style={{ fontSize: 10, fontWeight: 400, opacity: .6, letterSpacing: "0.04em" }}>ANALYTICS PORTAL</div>
          </span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          style={{ boxShadow: "none" }}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${open ? "show" : ""}`} id="publicNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-1">
            {publicLinks.map((link) => (
              <li className="nav-item" key={link.to}>
                <Link
                  className={`nav-link d-flex align-items-center gap-1 ${pathname === link.to ? "active" : ""}`}
                  to={link.to}
                  onClick={() => setOpen(false)}
                >
                  <i className={`bi ${link.icon}`} style={{ fontSize: 13 }} />
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="nav-item ms-lg-2">
              <Link
                className="btn btn-sm px-3"
                to="/admin/login"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                }}
                onClick={() => setOpen(false)}
              >
                <i className="bi bi-shield-lock me-1" />
                Admin Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
