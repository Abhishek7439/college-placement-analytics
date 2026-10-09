import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const adminLinks = [
  { to: "/admin/dashboard",   label: "Dashboard",   icon: "bi-speedometer2"         },
  { to: "/admin/departments", label: "Departments", icon: "bi-diagram-3"             },
  { to: "/admin/students",    label: "Students",    icon: "bi-people"                },
  { to: "/admin/companies",   label: "Companies",   icon: "bi-building"              },
  { to: "/admin/placements",  label: "Placements",  icon: "bi-briefcase"             },
  { to: "/admin/upload",      label: "Upload Data", icon: "bi-cloud-upload"          },
  { to: "/admin/reports",     label: "Reports",     icon: "bi-file-earmark-bar-graph"},
];

export default function AdminSidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const initials = admin?.username
    ? admin.username.slice(0, 2).toUpperCase()
    : "AD";

  return (
    <aside className="cpa-sidebar">
      {/* Header / Brand */}
      <div className="cpa-sidebar-header">
        <Link className="cpa-sidebar-brand" to="/admin/dashboard">
          <span className="cpa-sidebar-brand-icon">
            <i className="bi bi-mortarboard-fill" style={{ color: "#fff" }} />
          </span>
          <span>
            <div className="cpa-sidebar-brand-name">College Placement</div>
            <div className="cpa-sidebar-brand-sub">Analytics Portal</div>
          </span>
        </Link>
      </div>

      {/* Logged-in user chip */}
      {admin && (
        <div className="cpa-sidebar-user">
          <div className="cpa-sidebar-avatar">{initials}</div>
          <div>
            <div className="cpa-sidebar-username">{admin.username}</div>
            <div className="cpa-sidebar-role">Administrator</div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="cpa-sidebar-nav">
        <div className="cpa-sidebar-section-label">Main Menu</div>
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `cpa-nav-link${isActive ? " active" : ""}`}
          >
            <i className={`bi ${link.icon} icon`} />
            {link.label}
          </NavLink>
        ))}

        <div className="cpa-sidebar-section-label" style={{ marginTop: 16 }}>Public</div>
        <NavLink
          to="/"
          className="cpa-nav-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="bi bi-box-arrow-up-right icon" />
          View Dashboard
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="cpa-sidebar-footer">
        <button
          className="cpa-nav-link w-100 border-0 text-start"
          style={{ background: "transparent", cursor: "pointer" }}
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right icon" style={{ color: "#f87171" }} />
          <span style={{ color: "#f87171" }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
