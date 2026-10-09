import { useEffect, useState } from "react";
import { getDashboard, getYearlyTrends, getCompanyAnalytics } from "../../api";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/common/Loader";
import DoughnutChart from "../../components/charts/DoughnutChart";
import BarChart from "../../components/charts/BarChart";
import LineChart from "../../components/charts/LineChart";

// ── helpers ────────────────────────────────────────────────────────────────────

function CardBox({ title, subtitle, children, style }) {
  return (
    <div className="cpa-card h-100" style={style}>
      {(title || subtitle) && (
        <div className="cpa-card-header">
          {title   && <div className="cpa-card-title">{title}</div>}
          {subtitle && <div className="cpa-card-sub">{subtitle}</div>}
        </div>
      )}
      <div className="cpa-card-body">{children}</div>
    </div>
  );
}

function PlacementRateRing({ rate }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ - (rate / 100) * circ;
  const colour = rate >= 75 ? "#059669" : rate >= 50 ? "#d97706" : "#dc2626";
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-3">
      <svg width="130" height="130" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={colour}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
        <text x="60" y="56" textAnchor="middle" fontSize="18" fontWeight="700" fill={colour}>
          {rate}%
        </text>
        <text x="60" y="72" textAnchor="middle" fontSize="10" fill="#94a3b8">
          Placed
        </text>
      </svg>
      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Overall Rate</div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

export default function PublicDashboard() {
  const [kpi,       setKpi]       = useState(null);
  const [trends,    setTrends]    = useState([]);
  const [companies, setCompanies] = useState([]);
  const [year,      setYear]      = useState("");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDashboard(year ? { year } : {}),
      getYearlyTrends(),
      getCompanyAnalytics(year ? { year } : {}),
    ])
      .then(([kpiRes, trendRes, coRes]) => {
        setKpi(kpiRes.data);
        setTrends(trendRes.data);
        setCompanies(coRes.data.slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, [year]);

  // ── derived chart data ──────────────────────────────────────────────────────
  const trendLabels     = trends.map((d) => String(d.year));
  const trendPlacements = trends.map((d) => d.total_placements);
  const trendAvg        = trends.map((d) => d.avg_package_lpa);
  const trendMax        = trends.map((d) => d.max_package_lpa);
  const trendMedian     = trends.map((d) => d.median_package_lpa);

  const coLabels = companies.map((c) => c.company.length > 14 ? c.company.slice(0, 13) + "…" : c.company);
  const coHires  = companies.map((c) => c.hires);
  const coAvgPkg = companies.map((c) => c.avg_package_lpa);

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh" }}>

      {/* ── Hero banner ───────────────────────────────────────────────────── */}
      <div className="cpa-page-header">
        <div
          className="d-flex flex-wrap align-items-center justify-content-between gap-3"
          style={{ maxWidth: 1400, margin: "0 auto", position: "relative" }}
        >
          <div>
            <h1>Placement Analytics Dashboard</h1>
            <p>
              <i className="bi bi-broadcast me-2" style={{ color: "#60a5fa" }} />
              Real-time college placement performance · Public access
            </p>
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
                title="Clear filter"
              >
                <i className="bi bi-x-lg" style={{ fontSize: 12 }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : !kpi ? (
        <div className="cpa-empty-state">
          <i className="bi bi-database-x" />
          No placement data available yet.
        </div>
      ) : (
        <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>

          {/* ── KPI strip ─────────────────────────────────────────────────── */}
          <div className="row g-3 mb-4">
            {[
              { title: "Total Students",   value: kpi.total_students.toLocaleString(),    icon: "bi-people-fill",           colorClass: "primary"   },
              { title: "Placed Students",  value: kpi.placed_students.toLocaleString(),   icon: "bi-patch-check-fill",      colorClass: "success",   subtitle: `${kpi.placement_rate}% rate` },
              { title: "Unplaced",         value: kpi.unplaced_students.toLocaleString(), icon: "bi-person-x-fill",         colorClass: "danger"    },
              { title: "Total Recruiters", value: kpi.total_recruiters,                   icon: "bi-building-fill",         colorClass: "info"      },
              { title: "Highest Package",  value: `₹${kpi.max_package_lpa}`,             icon: "bi-arrow-up-circle-fill",  colorClass: "success",   subtitle: "LPA" },
              { title: "Average Package",  value: `₹${kpi.avg_package_lpa}`,             icon: "bi-graph-up",              colorClass: "primary",   subtitle: "LPA" },
            ].map((card) => (
              <div key={card.title} className="col-6 col-md-4 col-xl-2">
                <StatCard {...card} />
              </div>
            ))}
          </div>

          {/* ── Overview row ──────────────────────────────────────────────── */}
          <div className="row g-3 mb-4">
            {/* Placement ring */}
            <div className="col-md-3">
              <CardBox title="Placement Rate">
                <PlacementRateRing rate={kpi.placement_rate} />
                <div className="row g-2">
                  <div className="col-6 text-center">
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#059669" }}>{kpi.placed_students}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Placed</div>
                  </div>
                  <div className="col-6 text-center">
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#dc2626" }}>{kpi.unplaced_students}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Unplaced</div>
                  </div>
                </div>
              </CardBox>
            </div>

            {/* Status doughnut */}
            <div className="col-md-4">
              <CardBox title="Student Status Breakdown" subtitle="Placed · Unplaced · Opted Out">
                <DoughnutChart
                  labels={["Placed", "Unplaced", "Opted Out"]}
                  data={[kpi.placed_students, kpi.unplaced_students, kpi.opted_out_students]}
                  optionsOverride={{
                    plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 12 }, padding: 10 } } },
                  }}
                />
              </CardBox>
            </div>

            {/* Package summary table */}
            <div className="col-md-5">
              <CardBox
                title="Package Summary"
                subtitle={year ? `Filtered · ${year}` : "All years combined"}
              >
                <table className="table table-hover align-middle mb-0">
                  <tbody>
                    {[
                      ["Total Students",  kpi.total_students,    "#0f172a"],
                      ["Placed",          kpi.placed_students,   "#059669"],
                      ["Unplaced",        kpi.unplaced_students, "#dc2626"],
                      ["Opted Out",       kpi.opted_out_students,"#64748b"],
                      ["Total Offers",    kpi.total_placements,  "#0f172a"],
                      ["Total Recruiters",kpi.total_recruiters,  "#0891b2"],
                      ["Avg Package",     `₹${kpi.avg_package_lpa} LPA`,    "#2563eb"],
                      ["Median Package",  `₹${kpi.median_package_lpa} LPA`, "#7c3aed"],
                      ["Highest Package", `₹${kpi.max_package_lpa} LPA`,    "#059669"],
                      ["Lowest Package",  `₹${kpi.min_package_lpa} LPA`,    "#d97706"],
                    ].map(([label, val, color]) => (
                      <tr key={label}>
                        <td style={{ color: "#64748b", fontSize: 13 }}>{label}</td>
                        <td className="fw-semibold text-end" style={{ color, fontSize: 13 }}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBox>
            </div>
          </div>

          {/* ── Yearly trend charts ────────────────────────────────────────── */}
          {trends.length > 0 && (
            <div className="row g-3 mb-4">
              <div className="col-md-5">
                <CardBox title="Year-on-Year Placements" subtitle="Total placement offers per year">
                  <BarChart
                    labels={trendLabels}
                    datasets={[{
                      label: "Total Placements",
                      data: trendPlacements,
                      backgroundColor: "rgba(37,99,235,.75)",
                      borderRadius: 6,
                      borderSkipped: false,
                    }]}
                    optionsOverride={{
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,.04)" } },
                        x: { grid: { display: false } },
                      },
                    }}
                  />
                </CardBox>
              </div>

              <div className="col-md-7">
                <CardBox title="Package Trends (LPA)" subtitle="Average, median & highest package by year">
                  <LineChart
                    labels={trendLabels}
                    datasets={[
                      { label: "Avg",    data: trendAvg,    borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,.08)", fill: true, tension: 0.4, pointRadius: 4 },
                      { label: "Median", data: trendMedian, borderColor: "#7c3aed", backgroundColor: "transparent",         tension: 0.4, pointRadius: 4 },
                      { label: "High",   data: trendMax,    borderColor: "#059669", backgroundColor: "transparent",         tension: 0.4, pointRadius: 4, borderDash: [4,3] },
                    ]}
                  />
                </CardBox>
              </div>
            </div>
          )}

          {/* ── Top recruiters ─────────────────────────────────────────────── */}
          {companies.length > 0 && (
            <div className="row g-3">
              <div className="col-md-6">
                <CardBox title="Top Recruiters" subtitle="Hires by top 8 companies">
                  <BarChart
                    labels={coLabels}
                    datasets={[{
                      label: "Hires",
                      data: coHires,
                      backgroundColor: companies.map((_, i) => `hsl(${(i * 37 + 210) % 360},65%,52%)`),
                      borderRadius: 5,
                      borderSkipped: false,
                    }]}
                    optionsOverride={{
                      indexAxis: "y",
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { beginAtZero: true, grid: { color: "rgba(0,0,0,.04)" } },
                        y: { grid: { display: false }, ticks: { font: { size: 11 } } },
                      },
                    }}
                  />
                </CardBox>
              </div>
              <div className="col-md-6">
                <CardBox title="Avg Package by Company (LPA)" subtitle="Average package offered by top recruiters">
                  <BarChart
                    labels={coLabels}
                    datasets={[{
                      label: "Avg LPA",
                      data: coAvgPkg,
                      backgroundColor: "rgba(5,150,105,.7)",
                      borderRadius: 5,
                      borderSkipped: false,
                    }]}
                    optionsOverride={{
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,.04)" } },
                        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                      },
                    }}
                  />
                </CardBox>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
