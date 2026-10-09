import { useEffect, useMemo, useState } from "react";
import { getDepartmentAnalytics, getDepartmentTrends } from "../../api";
import BarChart from "../../components/charts/BarChart";
import LineChart from "../../components/charts/LineChart";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/common/StatCard";

// ── palette shared across charts ─────────────────────────────────────────────
const PALETTE = [
  "#0d6efd", "#198754", "#ffc107", "#dc3545",
  "#0dcaf0", "#6f42c1", "#fd7e14", "#20c997",
  "#6610f2", "#d63384", "#0dcaf0", "#adb5bd",
];

// ── tiny helpers ──────────────────────────────────────────────────────────────

function rateBadge(rate) {
  const cls =
    rate >= 75 ? "bg-success" :
    rate >= 50 ? "bg-warning text-dark" :
    "bg-danger";
  return <span className={`badge ${cls}`}>{rate}%</span>;
}

function SectionHead({ title, subtitle }) {
  return (
    <div className="mb-3">
      <h5 className="fw-bold mb-0" style={{ color: "#1a2332" }}>{title}</h5>
      {subtitle && <p className="text-muted small mb-0 mt-1">{subtitle}</p>}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function DepartmentAnalytics() {
  const [stats,    setStats]    = useState([]);   // per-dept snapshot (filterable by year)
  const [trends,   setTrends]   = useState([]);   // full (year × dept) series
  const [year,     setYear]     = useState("");
  const [loading,  setLoading]  = useState(true);
  const [activeDept, setActiveDept] = useState(null); // dept selected in trend drill-down

  // ── fetch both endpoints in one round-trip ────────────────────────────────
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDepartmentAnalytics(year ? { year } : {}),
      getDepartmentTrends(),
    ])
      .then(([snapRes, trendRes]) => {
        setStats(snapRes.data);
        setTrends(trendRes.data);
        // default active dept = first in list
        if (snapRes.data.length > 0 && !activeDept) {
          setActiveDept(snapRes.data[0].department);
        }
      })
      .finally(() => setLoading(false));
  }, [year]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── top-level KPIs (aggregate across all departments) ────────────────────
  const topKpi = useMemo(() => {
    if (!stats.length) return null;
    const totalStudents = stats.reduce((s, d) => s + d.total_students, 0);
    const placed        = stats.reduce((s, d) => s + d.placed, 0);
    const maxPkg        = Math.max(...stats.map((d) => d.max_package_lpa));
    const avgPkg        = stats.reduce((s, d) => s + d.avg_package_lpa, 0) / stats.length;
    return {
      totalStudents,
      placed,
      rate: totalStudents ? round2(placed / totalStudents * 100) : 0,
      maxPkg,
      avgPkg: round2(avgPkg),
      depts: stats.length,
    };
  }, [stats]);

  // ── chart series (snapshot) ───────────────────────────────────────────────
  const labels    = stats.map((d) => d.department);
  const placed    = stats.map((d) => d.placed);
  const unplaced  = stats.map((d) => d.unplaced);
  const rateArr   = stats.map((d) => d.placement_rate);
  const avgPkgArr = stats.map((d) => d.avg_package_lpa);
  const maxPkgArr = stats.map((d) => d.max_package_lpa);

  // ── trend line data for selected department ───────────────────────────────
  const deptList = useMemo(() =>
    [...new Set(trends.map((t) => t.department))].sort(), [trends]);

  const trendForDept = useMemo(() => {
    const rows = trends.filter((t) => t.department === activeDept);
    return {
      years:   rows.map((r) => String(r.year)),
      placed:  rows.map((r) => r.placed_students),
      avgPkg:  rows.map((r) => r.avg_package_lpa),
      maxPkg:  rows.map((r) => r.max_package_lpa),
    };
  }, [trends, activeDept]);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh" }}>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div className="cpa-page-header">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3" style={{ maxWidth: 1400, margin: "0 auto", position: "relative" }}>
          <div>
            <h1>Department Analytics</h1>
            <p>Placement performance broken down by academic department</p>
          </div>
          {/* Year filter */}
          <div className="cpa-filter-pill cpa-page-header-actions">
            <i className="bi bi-funnel" style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }} />
            <input
              type="number"
              placeholder="All years"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            {year && (
              <button
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "rgba(255,255,255,.5)", lineHeight: 1 }}
                onClick={() => setYear("")}
              >
                <i className="bi bi-x-lg" style={{ fontSize: 12 }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : stats.length === 0 ? (
        <div className="cpa-empty-state"><i className="bi bi-diagram-3" />No department data available.</div>
      ) : (
        <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>

          {/* ── KPI summary strip ──────────────────────────────────────────── */}
          {topKpi && (
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-4 col-xl-2">
                <StatCard title="Departments"     value={topKpi.depts}                       icon="bi-diagram-3-fill"     colorClass="primary"   />
              </div>
              <div className="col-6 col-md-4 col-xl-2">
                <StatCard title="Total Students"  value={topKpi.totalStudents.toLocaleString()} icon="bi-people-fill"     colorClass="info"      />
              </div>
              <div className="col-6 col-md-4 col-xl-2">
                <StatCard title="Placed Students" value={topKpi.placed.toLocaleString()}     icon="bi-patch-check-fill"   colorClass="success"   subtitle={`${topKpi.rate}% overall`} />
              </div>
              <div className="col-6 col-md-4 col-xl-2">
                <StatCard title="Placement Rate"  value={`${topKpi.rate}%`}                  icon="bi-percent"            colorClass="success"   />
              </div>
              <div className="col-6 col-md-4 col-xl-2">
                <StatCard title="Avg Package"     value={`₹${topKpi.avgPkg}`}                icon="bi-graph-up"           colorClass="primary"   subtitle="LPA (dept avg)" />
              </div>
              <div className="col-6 col-md-4 col-xl-2">
                <StatCard title="Highest Package" value={`₹${topKpi.maxPkg}`}                icon="bi-arrow-up-circle-fill" colorClass="warning" subtitle="LPA (peak)" />
              </div>
            </div>
          )}

          {/* ── Row 1: Placed vs Unplaced + Placement % ────────────────────── */}
          <div className="row g-3 mb-3">
            <div className="col-md-7">
              <div className="cpa-card h-100">
                <div className="cpa-card-header">
                  <div className="cpa-card-title">Placed vs Unplaced by Department</div>
                  <div className="cpa-card-sub">{year ? `Filtered to ${year}` : "All years combined"}</div>
                </div>
                <div className="cpa-card-body">
                  <BarChart
                    labels={labels}
                    datasets={[
                      { label: "Placed",   data: placed,   backgroundColor: "rgba(25,135,84,.75)",  borderRadius: 4, borderSkipped: false },
                      { label: "Unplaced", data: unplaced, backgroundColor: "rgba(220,53,69,.65)",  borderRadius: 4, borderSkipped: false },
                    ]}
                    optionsOverride={{
                      scales: {
                        x: { stacked: false, grid: { display: false } },
                        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,.04)" } },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="col-md-5">
              <div className="cpa-card h-100">
                <div className="cpa-card-header">
                  <div className="cpa-card-title">Placement Percentage</div>
                  <div className="cpa-card-sub">% of students placed per department</div>
                </div>
                <div className="cpa-card-body">
                  <BarChart
                    labels={labels}
                    datasets={[{
                      label: "Placement %",
                      data: rateArr,
                      backgroundColor: rateArr.map((r) =>
                        r >= 75 ? "rgba(25,135,84,.75)" :
                        r >= 50 ? "rgba(255,193,7,.8)"  :
                                  "rgba(220,53,69,.7)"
                      ),
                      borderRadius: 5,
                      borderSkipped: false,
                    }]}
                    optionsOverride={{
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { min: 0, max: 100, grid: { color: "rgba(0,0,0,.04)" },
                             ticks: { callback: (v) => `${v}%` } },
                        x: { grid: { display: false } },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 2: Avg Package + Highest Package ───────────────────────── */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <div className="cpa-card h-100">
                <div className="cpa-card-header">
                  <div className="cpa-card-title">Average Package by Department</div>
                  <div className="cpa-card-sub">Mean placement package (LPA)</div>
                </div>
                <div className="cpa-card-body">
                  <BarChart
                    labels={labels}
                    datasets={[{
                      label: "Avg LPA",
                      data: avgPkgArr,
                      backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length] + "cc"),
                      borderRadius: 5,
                      borderSkipped: false,
                    }]}
                    optionsOverride={{
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,.04)" },
                             ticks: { callback: (v) => `₹${v}` } },
                        x: { grid: { display: false } },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="cpa-card h-100">
                <div className="cpa-card-header">
                  <div className="cpa-card-title">Highest Package by Department</div>
                  <div className="cpa-card-sub">Peak placement offer per department (LPA)</div>
                </div>
                <div className="cpa-card-body">
                  <BarChart
                    labels={labels}
                    datasets={[{
                      label: "Max LPA",
                      data: maxPkgArr,
                      backgroundColor: "rgba(13,110,253,.7)",
                      borderRadius: 5,
                      borderSkipped: false,
                    }]}
                    optionsOverride={{
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,.04)" },
                             ticks: { callback: (v) => `₹${v}` } },
                        x: { grid: { display: false } },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 3: Department placement trends over years ──────────────── */}
          {trends.length > 0 && (
            <div className="row g-3 mb-3">
              {/* dept selector */}
              <div className="col-md-3 col-xl-2">
                <div className="cpa-card h-100">
                  <div className="cpa-card-header">
                    <div className="cpa-card-title" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>Select Department</div>
                  </div>
                  <div className="cpa-card-body">
                    <div className="d-flex flex-column gap-1">
                      {deptList.map((dept) => (
                        <button
                          key={dept}
                          className={`btn btn-sm text-start ${activeDept === dept ? "btn-primary" : "btn-outline-secondary"}`}
                          style={{ fontSize: 12 }}
                          onClick={() => setActiveDept(dept)}
                        >
                          {dept}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* trend charts for selected dept */}
              <div className="col-md-9 col-xl-10">
                <div className="row g-3 h-100">
                  <div className="col-md-6">
                    <div className="cpa-card h-100">
                      <div className="cpa-card-header">
                        <div className="cpa-card-title">{activeDept} — Placed Students</div>
                        <div className="cpa-card-sub">Number of students placed each year</div>
                      </div>
                      <div className="cpa-card-body">
                        {trendForDept.years.length === 0 ? (
                          <p className="text-muted small">No data for this department.</p>
                        ) : (
                          <LineChart
                            labels={trendForDept.years}
                            datasets={[{
                              label:           "Placed Students",
                              data:            trendForDept.placed,
                              borderColor:     "#198754",
                              backgroundColor: "rgba(25,135,84,.1)",
                              fill:            true,
                              tension:         0.4,
                              pointRadius:     5,
                              pointHoverRadius: 7,
                            }]}
                            optionsOverride={{
                              plugins: { legend: { display: false } },
                              scales: {
                                y: { beginAtZero: true, grid: { color: "rgba(0,0,0,.04)" } },
                                x: { grid: { display: false } },
                              },
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="cpa-card h-100">
                      <div className="cpa-card-header">
                        <div className="cpa-card-title">{activeDept} — Package Trends</div>
                        <div className="cpa-card-sub">Avg and highest package (LPA) per year</div>
                      </div>
                      <div className="cpa-card-body">
                        {trendForDept.years.length === 0 ? (
                          <p className="text-muted small">No data for this department.</p>
                        ) : (
                          <LineChart
                            labels={trendForDept.years}
                            datasets={[
                              {
                                label:           "Avg LPA",
                                data:            trendForDept.avgPkg,
                                borderColor:     "#0d6efd",
                                backgroundColor: "rgba(13,110,253,.08)",
                                fill:            true,
                                tension:         0.4,
                                pointRadius:     5,
                                pointHoverRadius: 7,
                              },
                              {
                                label:           "Max LPA",
                                data:            trendForDept.maxPkg,
                                borderColor:     "#dc3545",
                                backgroundColor: "transparent",
                                borderDash:      [5, 3],
                                tension:         0.4,
                                pointRadius:     5,
                                pointHoverRadius: 7,
                              },
                            ]}
                            optionsOverride={{
                              scales: {
                                y: { beginAtZero: true, grid: { color: "rgba(0,0,0,.04)" },
                                     ticks: { callback: (v) => `₹${v}` } },
                                x: { grid: { display: false } },
                              },
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Row 4: Summary table ───────────────────────────────────────── */}
          <div className="cpa-card">
            <div className="cpa-card-header">
              <div className="cpa-card-title">Department Summary Table</div>
              <div className="cpa-card-sub">{year ? `Placement data for ${year}` : "All-time placement data"}</div>
            </div>
            <div className="cpa-card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 30 }}>#</th>
                      <th>Department</th>
                      <th className="text-center">Total</th>
                      <th className="text-center">Placed</th>
                      <th className="text-center">Unplaced</th>
                      <th className="text-center">Rate</th>
                      <th className="text-end">Avg LPA</th>
                      <th className="text-end">Max LPA</th>
                      <th className="text-end">Min LPA</th>
                      <th className="text-center">Recruiters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((d, i) => (
                      <tr
                        key={d.department}
                        style={{ cursor: "pointer" }}
                        onClick={() => setActiveDept(d.department)}
                        className={activeDept === d.department ? "table-primary" : ""}
                      >
                        <td className="text-muted small">{i + 1}</td>
                        <td className="fw-semibold">{d.department}</td>
                        <td className="text-center">{d.total_students}</td>
                        <td className="text-center text-success fw-semibold">{d.placed}</td>
                        <td className="text-center text-danger">{d.unplaced}</td>
                        <td className="text-center">{rateBadge(d.placement_rate)}</td>
                        <td className="text-end">₹{d.avg_package_lpa}</td>
                        <td className="text-end text-success fw-semibold">₹{d.max_package_lpa}</td>
                        <td className="text-end text-warning">₹{d.min_package_lpa}</td>
                        <td className="text-center">{d.total_recruiters}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-muted small mt-2 mb-0">
                <i className="bi bi-info-circle me-1" />
                Click a row to highlight the department in the trend charts above.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ── shared card style ─────────────────────────────────────────────────────────
const cardStyle = {
  borderRadius: 12,
  boxShadow: "0 1px 4px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.04)",
};

function round2(n) {
  return Math.round(n * 100) / 100;
}
