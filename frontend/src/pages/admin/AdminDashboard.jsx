import { useEffect, useState } from "react";
import { getDashboard } from "../../api";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/common/Loader";
import DoughnutChart from "../../components/charts/DoughnutChart";

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200 }}>

      {/* Page Header */}
      <div className="mb-5">
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Admin Dashboard
        </h2>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
          College Placement Analytics — System overview &amp; KPIs
        </p>
      </div>

      {data && (
        <>
          {/* Row 1 — student counts */}
          <div className="row g-3 mb-3">
            <div className="col-sm-6 col-xl-3">
              <StatCard title="Total Students"   value={data.total_students}   icon="bi-people-fill"      colorClass="primary" />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard title="Placed"           value={data.placed_students}  subtitle={`${data.placement_rate}% placement rate`} icon="bi-patch-check-fill" colorClass="success" />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard title="Unplaced"         value={data.unplaced_students} subtitle={`${data.opted_out_students} opted out`} icon="bi-person-x-fill" colorClass="danger" />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard title="Total Recruiters" value={data.total_recruiters} subtitle={`${data.total_placements} offers`} icon="bi-building-fill" colorClass="info" />
            </div>
          </div>

          {/* Row 2 — package KPIs */}
          <div className="row g-3 mb-5">
            <div className="col-sm-6 col-xl-3">
              <StatCard title="Avg Package"    value={`₹${data.avg_package_lpa} LPA`}    icon="bi-graph-up"               colorClass="primary"   />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard title="Median Package" value={`₹${data.median_package_lpa} LPA`} icon="bi-distribute-vertical"    colorClass="secondary" />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard title="Highest Package" value={`₹${data.max_package_lpa} LPA`}   icon="bi-arrow-up-circle-fill"   colorClass="success"   />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard title="Lowest Package"  value={`₹${data.min_package_lpa} LPA`}   icon="bi-arrow-down-circle-fill" colorClass="warning"   />
            </div>
          </div>

          {/* Charts row */}
          <div className="row g-3">
            <div className="col-md-4">
              <div className="cpa-card h-100">
                <div className="cpa-card-header">
                  <div className="cpa-card-title">Placement Status</div>
                  <div className="cpa-card-sub">Distribution of student placement outcomes</div>
                </div>
                <div className="cpa-card-body">
                  <DoughnutChart
                    labels={["Placed", "Unplaced", "Opted Out"]}
                    data={[data.placed_students, data.unplaced_students, data.opted_out_students]}
                    optionsOverride={{
                      plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 12 }, padding: 12 } } },
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="col-md-8">
              <div className="cpa-card h-100">
                <div className="cpa-card-header">
                  <div className="cpa-card-title">Complete KPI Overview</div>
                  <div className="cpa-card-sub">All placement metrics at a glance</div>
                </div>
                <div className="cpa-card-body">
                  <table className="table table-hover align-middle mb-0">
                    <tbody>
                      {[
                        ["Total Students",  data.total_students,              "#0f172a",  null],
                        ["Placed",          data.placed_students,             "#059669",  "bi-patch-check-fill"],
                        ["Unplaced",        data.unplaced_students,           "#dc2626",  "bi-person-x-fill"],
                        ["Opted Out",       data.opted_out_students,          "#64748b",  null],
                        ["Placement Rate",  `${data.placement_rate}%`,        "#2563eb",  null],
                        ["Total Offers",    data.total_placements,            "#0f172a",  null],
                        ["Total Recruiters",data.total_recruiters,            "#0891b2",  "bi-building"],
                        ["Avg Package",     `₹${data.avg_package_lpa} LPA`,  "#2563eb",  null],
                        ["Median Package",  `₹${data.median_package_lpa} LPA`,"#7c3aed", null],
                        ["Highest Package", `₹${data.max_package_lpa} LPA`,  "#059669",  "bi-arrow-up-short"],
                        ["Lowest Package",  `₹${data.min_package_lpa} LPA`,  "#d97706",  null],
                      ].map(([label, val, color, icon]) => (
                        <tr key={label}>
                          <td style={{ color: "#64748b", fontSize: 13 }}>
                            {icon && <i className={`bi ${icon} me-2`} style={{ color }} />}
                            {label}
                          </td>
                          <td className="text-end fw-semibold" style={{ color, fontSize: 13 }}>{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
