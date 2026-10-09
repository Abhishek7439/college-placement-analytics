import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/common/PublicNavbar";

export default function PublicLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <PublicNavbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <footer
        style={{
          background: "#0f172a",
          borderTop: "1px solid rgba(255,255,255,.06)",
          padding: "20px 32px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ color: "rgba(255,255,255,.45)", fontSize: 13 }}>
          © {new Date().getFullYear()} <span style={{ color: "rgba(255,255,255,.7)", fontWeight: 600 }}>College Placement Analytics</span>
          {" "}· All rights reserved
        </div>
        <div style={{ color: "rgba(255,255,255,.3)", fontSize: 12 }}>
          Real-time placement data for academic institutions
        </div>
      </footer>
    </div>
  );
}
