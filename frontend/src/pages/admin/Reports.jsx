import { useEffect, useState } from "react";
import { getReports, generateReport, downloadReport } from "../../api";
import Loader from "../../components/common/Loader";

const REPORT_TYPES = ["summary", "department", "company", "yearly"];

export default function Reports() {
  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm]           = useState({ title: "", report_type: "summary" });
  const [message, setMessage]     = useState(null);

  const fetchReports = () => {
    setLoading(true);
    getReports().then((res) => setReports(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setMessage(null);
    try {
      await generateReport(form);
      setMessage({ type: "success", text: "Report generated successfully." });
      setForm({ title: "", report_type: "summary" });
      fetchReports();
    } catch (err) {
      setMessage({ type: "danger", text: err.response?.data?.error || "Generation failed." });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (id, title) => {
    try {
      const res = await downloadReport(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "_")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Download failed.");
    }
  };

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Page Header */}
      <div className="mb-4">
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Reports</h2>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Generate and download PDF placement reports</p>
      </div>

      <div className="row g-4">
        {/* Generate form */}
        <div className="col-md-5">
          <div className="cpa-card">
            <div className="cpa-card-header">
              <div className="cpa-card-title">Generate New Report</div>
              <div className="cpa-card-sub">Create a PDF report from the current placement data</div>
            </div>
            <div className="cpa-card-body">
              {message && (
                <div
                  style={{
                    background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
                    color: message.type === "success" ? "#166534" : "#991b1b",
                    border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <i className={`bi ${message.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"}`} />
                  {message.text}
                </div>
              )}

              <form onSubmit={handleGenerate}>
                <div className="mb-3">
                  <label className="form-label">Report Title <span style={{ color: "#dc2626" }}>*</span></label>
                  <input
                    className="form-control"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Annual Placement Report 2024"
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Report Type</label>
                  <select
                    className="form-select"
                    value={form.report_type}
                    onChange={(e) => setForm({ ...form, report_type: e.target.value })}
                  >
                    {REPORT_TYPES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                    {form.report_type === "summary"    && "Overall placement statistics and KPIs"}
                    {form.report_type === "department" && "Breakdown by academic department"}
                    {form.report_type === "company"    && "Recruiter-wise placement analysis"}
                    {form.report_type === "yearly"     && "Year-on-year placement trends"}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  style={{ fontWeight: 600 }}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <span
                        style={{
                          display: "inline-block",
                          width: 13,
                          height: 13,
                          border: "2px solid rgba(255,255,255,.4)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          animation: "spin .7s linear infinite",
                        }}
                      />
                      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                      Generating…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-file-earmark-pdf" />
                      Generate PDF Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Reports list */}
        <div className="col-md-7">
          <div className="cpa-card">
            <div className="cpa-card-header">
              <div className="cpa-card-title">Generated Reports</div>
              <div className="cpa-card-sub">Download previously generated PDF reports</div>
            </div>
            <div className="cpa-card-body" style={{ padding: "0 0 8px" }}>
              {loading ? (
                <Loader />
              ) : reports.length === 0 ? (
                <div className="cpa-empty-state">
                  <i className="bi bi-file-earmark-bar-graph" />
                  No reports generated yet. Use the form to create one.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Created At</th>
                        <th style={{ width: 100 }}>Download</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600, color: "#0f172a" }}>{r.title}</td>
                          <td>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "3px 8px",
                                borderRadius: 6,
                                background: "#eff6ff",
                                color: "#1d4ed8",
                                textTransform: "capitalize",
                              }}
                            >
                              {r.report_type}
                            </span>
                          </td>
                          <td style={{ color: "#64748b", fontSize: 12 }}>
                            {new Date(r.created_at).toLocaleString()}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                              onClick={() => handleDownload(r.id, r.title)}
                            >
                              <i className="bi bi-download" />
                              PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
