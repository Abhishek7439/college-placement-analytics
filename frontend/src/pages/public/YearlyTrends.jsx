import { useEffect, useState } from "react";
import { getYearlyTrends } from "../../api";
import LineChart from "../../components/charts/LineChart";
import BarChart from "../../components/charts/BarChart";
import Loader from "../../components/common/Loader";

export default function YearlyTrends() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getYearlyTrends()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const labels         = data.map((d) => String(d.year));
  const totalPlacements = data.map((d) => d.total_placements);
  const avgPkg         = data.map((d) => d.avg_package_lpa);
  const maxPkg         = data.map((d) => d.max_package_lpa);
  const minPkg         = data.map((d) => d.min_package_lpa);

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh" }}>

      {/* Hero */}
      <div className="cpa-page-header">
        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative" }}>
          <h1>Yearly Placement Trends</h1>
          <p>Year-on-year analysis of placement performance across all batches</p>
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
        {loading ? (
          <Loader />
        ) : data.length === 0 ? (
          <div className="cpa-empty-state">
            <i className="bi bi-graph-up-arrow" />
            No yearly trend data available yet.
          </div>
        ) : (
          <>
            <div className="row g-3 mb-4">
              <div className="col-md-5">
                <div className="cpa-card">
                  <div className="cpa-card-header">
                    <div className="cpa-card-title">Total Placements per Year</div>
                    <div className="cpa-card-sub">Number of placement offers each year</div>
                  </div>
                  <div className="cpa-card-body">
                    <BarChart
                      labels={labels}
                      datasets={[{
                        label: "Total Placements",
                        data: totalPlacements,
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
                  </div>
                </div>
              </div>

              <div className="col-md-7">
                <div className="cpa-card">
                  <div className="cpa-card-header">
                    <div className="cpa-card-title">Package Trends (LPA)</div>
                    <div className="cpa-card-sub">Average, max, and minimum salary package per year</div>
                  </div>
                  <div className="cpa-card-body">
                    <LineChart
                      labels={labels}
                      datasets={[
                        { label: "Avg LPA", data: avgPkg, borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,.08)", fill: true, tension: 0.4, pointRadius: 4 },
                        { label: "Max LPA", data: maxPkg, borderColor: "#059669", backgroundColor: "transparent",          tension: 0.4, pointRadius: 4 },
                        { label: "Min LPA", data: minPkg, borderColor: "#dc2626", backgroundColor: "transparent",          tension: 0.4, pointRadius: 4 },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="cpa-card">
              <div className="cpa-card-header">
                <div className="cpa-card-title">Year-wise Summary Table</div>
                <div className="cpa-card-sub">Complete statistics for each academic year</div>
              </div>
              <div className="cpa-card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Total Placements</th>
                        <th>Avg Package (LPA)</th>
                        <th>Max Package (LPA)</th>
                        <th>Min Package (LPA)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((d) => (
                        <tr key={d.year}>
                          <td style={{ fontWeight: 600, color: "#0f172a" }}>{d.year}</td>
                          <td>{d.total_placements}</td>
                          <td style={{ color: "#2563eb", fontWeight: 600 }}>₹{d.avg_package_lpa}</td>
                          <td style={{ color: "#059669", fontWeight: 600 }}>₹{d.max_package_lpa}</td>
                          <td style={{ color: "#d97706" }}>₹{d.min_package_lpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
