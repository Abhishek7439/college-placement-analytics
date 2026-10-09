import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/common/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <AdminSidebar />
      <div className="flex-grow-1 overflow-auto" style={{ minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}
