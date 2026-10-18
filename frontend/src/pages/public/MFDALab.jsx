import { useEffect, useState } from "react";
import {
  getMFDADescriptiveLinearAlgebra,
  getMFDABayes,
  calculateMFDABayes,
  getMFDADistributions,
  getMFDASamplingCLT,
  getMFDAEstimation,
  getMFDARegression,
  predictStudentPlacement,
  getMFDAHypothesisTesting,
  getMFDANonParametric,
} from "../../api";
import Loader from "../../components/common/Loader";
import BarChart from "../../components/charts/BarChart";
import LineChart from "../../components/charts/LineChart";
import ScatterChart from "../../components/charts/ScatterChart";

const tabs = [
  { id: "linear_algebra", label: "Linear Algebra & Stats", icon: "bi-calculator", outcome: "CO1: Summarizing & Linear Algebra" },
  { id: "probability_bayes", label: "Probability & Bayes", icon: "bi-diagram-2", outcome: "CO2: Probability & Bayes Theorem" },
  { id: "distributions", label: "Distributions", icon: "bi-bell", outcome: "CO2: Random Variables & Distributions" },
  { id: "sampling_clt", label: "Sampling & CLT", icon: "bi-shuffle", outcome: "CO3: Sampling & CLT Simulation" },
  { id: "estimation", label: "Estimation & CI", icon: "bi-rulers", outcome: "CO3: Point & Interval Estimation" },
  { id: "regression", label: "Regression Studio", icon: "bi-graph-up-arrow", outcome: "CO3: Linear & Logistic Regression" },
  { id: "hypothesis", label: "Hypothesis Testing", icon: "bi-check2-square", outcome: "CO4: Parametric Hypothesis Tests" },
  { id: "non_parametric", label: "Non-Parametric Tests", icon: "bi-grid-3x3", outcome: "CO5: Non-Parametric & Chi-Square" },
];

export default function MFDALab() {
  const [activeTab, setActiveTab] = useState("linear_algebra");
  const [loading, setLoading] = useState(true);

  // Data states
  const [descData, setDescData] = useState(null);
  const [bayesData, setBayesData] = useState(null);
  const [distData, setDistData] = useState(null);
  const [samplingData, setSamplingData] = useState(null);
  const [estimationData, setEstimationData] = useState(null);
  const [regressionData, setRegressionData] = useState(null);
  const [hypoData, setHypoData] = useState(null);
  const [nonParamData, setNonParamData] = useState(null);

  // Interactive controls
  const [bayesCriteria, setBayesCriteria] = useState({ cgpa_min: 8.0, internships_min: 1, tech_min: 70.0 });
  const [cltParams, setCltParams] = useState({ sample_size: 25, num_samples: 500 });
  const [alphaLevel, setAlphaLevel] = useState(0.05);

  // Prediction tool state
  const [predictInputs, setPredictInputs] = useState({
    cgpa: 8.2,
    technical_score: 78,
    coding_score: 75,
    soft_skills_score: 78,
    internships_count: 1,
    projects_count: 2,
  });
  const [predictResult, setPredictResult] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const [error, setError] = useState(null);

  async function fetchAllData() {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        getMFDADescriptiveLinearAlgebra(),
        getMFDABayes(),
        getMFDADistributions(),
        getMFDASamplingCLT(cltParams),
        getMFDAEstimation(),
        getMFDARegression(),
        getMFDAHypothesisTesting({ alpha: alphaLevel }),
        getMFDANonParametric(),
      ]);

      if (results[0].status === "fulfilled") setDescData(results[0].value.data);
      if (results[1].status === "fulfilled") setBayesData(results[1].value.data);
      if (results[2].status === "fulfilled") setDistData(results[2].value.data);
      if (results[3].status === "fulfilled") setSamplingData(results[3].value.data);
      if (results[4].status === "fulfilled") setEstimationData(results[4].value.data);
      if (results[5].status === "fulfilled") setRegressionData(results[5].value.data);
      if (results[6].status === "fulfilled") setHypoData(results[6].value.data);
      if (results[7].status === "fulfilled") setNonParamData(results[7].value.data);

      const anySuccess = results.some((r) => r.status === "fulfilled");
      if (!anySuccess) {
        setError("Could not connect to MFDA backend. Please ensure backend server is running.");
      }

      // Initial prediction
      handlePredict();
    } catch (err) {
      console.error("Failed to load MFDA Lab data:", err);
      setError("An unexpected error occurred while loading MFDA data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBayesRecalculate() {
    try {
      const res = await calculateMFDABayes(bayesCriteria);
      setBayesData(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCltSimulate() {
    try {
      const res = await getMFDASamplingCLT(cltParams);
      setSamplingData(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAlphaChange(newAlpha) {
    setAlphaLevel(newAlpha);
    try {
      const res = await getMFDAHypothesisTesting({ alpha: newAlpha });
      setHypoData(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handlePredict() {
    setPredictLoading(true);
    try {
      const res = await predictStudentPlacement(predictInputs);
      setPredictResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setPredictLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Loader message="Loading Mathematical Foundation of Data Analysis (MFDA) Statistical Suite..." />
      </div>
    );
  }

  if (error && !descData) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger p-4 rounded-4" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <i className="bi bi-exclamation-triangle-fill fs-2 mb-2 d-block text-danger" />
          <h5 className="fw-bold">Unable to Load MFDA Analytics</h5>
          <p className="small mb-3">{error}</p>
          <button className="btn btn-primary" onClick={fetchAllData}>
            <i className="bi bi-arrow-clockwise me-1" /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-lg-5 py-4" style={{ minHeight: "90vh", background: "#0a0f1d", color: "#f8fafc" }}>
      {/* ── Hero Banner ── */}
      <div
        className="p-4 p-md-5 rounded-4 mb-4 position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.25) 0%, rgba(124,58,237,0.2) 50%, rgba(16,185,129,0.15) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge px-3 py-2 text-uppercase fw-bold" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", letterSpacing: "0.06em" }}>
                Course Project
              </span>
              <span className="badge border border-info border-opacity-50 px-3 py-2" style={{ background: "rgba(15, 23, 42, 0.8)", color: "#38bdf8" }}>
                Mathematical Foundation of Data Analysis (MFDA)
              </span>
            </div>
            <h1 className="fw-bold mb-2 display-6" style={{ letterSpacing: "-0.02em", color: "#ffffff" }}>
              Placement Intelligence & Statistical Lab
            </h1>
            <p className="mb-0" style={{ maxWidth: "800px", fontSize: "15px", color: "#cbd5e1" }}>
              Comprehensive computational workbench covering descriptive statistics, linear algebra, probability theory, Bayes' theorem, 
              sampling distributions, point/interval estimation, multiple regression, parametric hypothesis testing, and non-parametric tests.
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <span
              className="badge px-3 py-2 border fw-semibold d-inline-flex align-items-center gap-1 shadow-sm"
              style={{
                background: "rgba(37, 99, 235, 0.25)",
                borderColor: "#3b82f6",
                color: "#93c5fd",
                fontSize: "12.5px",
                letterSpacing: "0.02em",
              }}
            >
              <i className="bi bi-mortarboard-fill me-1" style={{ color: "#60a5fa" }} /> 8 Practicals
            </span>
            <span
              className="badge px-3 py-2 border fw-semibold d-inline-flex align-items-center gap-1 shadow-sm"
              style={{
                background: "rgba(16, 185, 129, 0.25)",
                borderColor: "#10b981",
                color: "#6ee7b7",
                fontSize: "12.5px",
                letterSpacing: "0.02em",
              }}
            >
              <i className="bi bi-shield-check me-1" style={{ color: "#34d399" }} /> CO1 – CO5 Aligned
            </span>
            <span
              className="badge px-3 py-2 border fw-semibold d-inline-flex align-items-center gap-1 shadow-sm"
              style={{
                background: "rgba(6, 182, 212, 0.25)",
                borderColor: "#06b6d4",
                color: "#67e8f9",
                fontSize: "12.5px",
                letterSpacing: "0.02em",
              }}
            >
              <i className="bi bi-cpu me-1" style={{ color: "#38bdf8" }} /> Scipy & Scikit-Learn
            </span>
          </div>
        </div>

        {/* Course Outcomes Mapping Pills */}
        <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top border-white border-opacity-10" style={{ fontSize: "12px" }}>
          <span className="fw-semibold" style={{ color: "#94a3b8" }}>Course Outcomes:</span>
          <span style={{ color: "#e2e8f0" }}>CO1: Summarizing & Linear Algebra</span> ·
          <span style={{ color: "#e2e8f0" }}>CO2: Probability & Bayes' Theorem</span> ·
          <span style={{ color: "#e2e8f0" }}>CO3: Sampling & Regression Estimation</span> ·
          <span style={{ color: "#e2e8f0" }}>CO4: Parametric Hypothesis Tests</span> ·
          <span style={{ color: "#e2e8f0" }}>CO5: Non-Parametric & Chi-Square</span>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="d-flex gap-2 overflow-auto pb-2 mb-4 scrollbar-none" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn px-3 py-2 d-flex align-items-center gap-2 rounded-3 text-nowrap transition-all ${
                isActive ? "text-white fw-bold" : ""
              }`}
              style={{
                background: isActive ? "linear-gradient(135deg, #2563eb, #6366f1)" : "rgba(255,255,255,0.04)",
                border: isActive ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
                fontSize: "14px",
                color: isActive ? "#ffffff" : "#cbd5e1",
              }}
            >
              <i className={`bi ${tab.icon}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}

      {/* TAB 1: Linear Algebra & Descriptive Statistics */}
      {activeTab === "linear_algebra" && descData && (
        <div className="row g-4">
          <div className="col-12">
            <div
              className="p-3 rounded-3 border d-flex align-items-center gap-3 shadow-sm"
              style={{
                background: "linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(99, 102, 241, 0.12) 100%)",
                borderColor: "rgba(59, 130, 246, 0.35)",
                color: "#f8fafc",
              }}
            >
              <i className="bi bi-info-circle-fill fs-4" style={{ color: "#60a5fa" }} />
              <div>
                <strong className="text-white">Practical 02 & 03: Summarizing Techniques & Linear Algebra (PCA)</strong>
                <div className="small" style={{ color: "#cbd5e1" }}>
                  Calculates descriptive statistics (mean, variance, skewness, kurtosis, quartiles) and implements Linear Algebra PCA 
                  by computing covariance matrix eigenvalues and eigenvectors for 2D dimensionality reduction.
                </div>
              </div>
            </div>
          </div>

          {/* Descriptive Statistics Table */}
          <div className="col-12">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-white">
                <i className="bi bi-table text-primary" /> Comprehensive Descriptive Statistics
              </h5>
              <div className="table-responsive">
                <table className="table table-dark table-hover table-bordered border-secondary border-opacity-25 mb-0" style={{ fontSize: "13px" }}>
                  <thead style={{ background: "rgba(255,255,255,0.05)" }}>
                    <tr>
                      <th>Feature</th>
                      <th>Count</th>
                      <th>Mean (x̄)</th>
                      <th>Median (Q2)</th>
                      <th>Std Dev (s)</th>
                      <th>Variance (s²)</th>
                      <th>Skewness</th>
                      <th>Kurtosis</th>
                      <th>Q1 (25%)</th>
                      <th>Q3 (75%)</th>
                      <th>IQR</th>
                      <th>Min / Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(descData.descriptive_stats || {}).map(([feature, s]) => (
                      <tr key={feature}>
                        <td className="fw-bold text-info">{feature}</td>
                        <td>{s.count}</td>
                        <td className="text-warning fw-semibold">{s.mean}</td>
                        <td>{s.median}</td>
                        <td>{s.std}</td>
                        <td>{s.variance}</td>
                        <td className={s.skewness > 0 ? "text-danger" : "text-success"}>{s.skewness}</td>
                        <td>{s.kurtosis}</td>
                        <td>{s.q1}</td>
                        <td>{s.q3}</td>
                        <td>{s.iqr}</td>
                        <td>{s.min} – {s.max}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Correlation Matrix */}
          <div className="col-lg-6">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-white">
                <i className="bi bi-grid-3x3 text-info" /> Pearson Correlation Matrix (Linear Algebra)
              </h5>
              <div className="table-responsive">
                <table className="table table-dark table-bordered border-secondary border-opacity-25 text-center mb-0" style={{ fontSize: "12px" }}>
                  <thead>
                    <tr>
                      <th></th>
                      {descData.features.map((f) => (
                        <th key={f} className="text-truncate" style={{ maxWidth: "80px" }}>{f}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {descData.features.map((rowF) => (
                      <tr key={rowF}>
                        <td className="fw-bold text-start text-info text-truncate" style={{ maxWidth: "120px" }}>{rowF}</td>
                        {descData.features.map((colF) => {
                          const val = descData.correlation_matrix[rowF]?.[colF] ?? 0;
                          const intensity = Math.abs(val);
                          const bg = val > 0 
                            ? `rgba(37, 99, 235, ${intensity * 0.7})` 
                            : `rgba(239, 68, 68, ${intensity * 0.7})`;
                          return (
                            <td key={colF} style={{ background: rowF === colF ? "rgba(255,255,255,0.15)" : bg, fontWeight: 600 }}>
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex align-items-center justify-content-between mt-3 text-secondary small">
                <span>Scale: Blue (+1.0 strong positive) · Red (-1.0 strong negative)</span>
                <span>r = Cov(X, Y) / (s_x * s_y)</span>
              </div>
            </div>
          </div>

          {/* PCA 2D Clustering & Eigenvalues */}
          <div className="col-lg-6">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                  <i className="bi bi-bounding-box-circles text-warning" /> PCA Dimensionality Reduction
                </h5>
                <span className="badge bg-success bg-opacity-25 border border-success text-success px-3 py-1">
                  Explained Variance: {descData.pca.total_variance_explained}%
                </span>
              </div>
              
              <ScatterChart
                title="Principal Component Analysis (PC1 vs PC2)"
                xTitle={`Principal Component 1 (${descData.pca.explained_variance_ratio[0]}% var)`}
                yTitle={`Principal Component 2 (${descData.pca.explained_variance_ratio[1]}% var)`}
                datasets={[
                  {
                    label: "Placed Students",
                    data: descData.pca.points
                      .filter((p) => p.status === "placed")
                      .map((p) => ({ x: p.pc1, y: p.pc2, label: p.name, extra: `${p.department} (${p.package_lpa} LPA)` })),
                    backgroundColor: "rgba(16, 185, 129, 0.8)",
                    pointRadius: 6,
                  },
                  {
                    label: "Unplaced / Opted Out",
                    data: descData.pca.points
                      .filter((p) => p.status !== "placed")
                      .map((p) => ({ x: p.pc1, y: p.pc2, label: p.name, extra: `${p.department} (${p.status})` })),
                    backgroundColor: "rgba(239, 68, 68, 0.8)",
                    pointRadius: 6,
                  },
                ]}
              />

              <div className="mt-3 p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-10 small">
                <div className="fw-bold text-info mb-1">Linear Algebra Eigenvalue Decomposition:</div>
                <div className="text-secondary">
                  Eigenvalues λ = [{descData.pca.eigenvalues.slice(0, 4).join(", ")} ...]
                </div>
                <div className="text-secondary mt-1">
                  Top 2 Principal Components capture {descData.pca.total_variance_explained}% of overall multi-dimensional variance.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Probability Theory & Bayes' Theorem */}
      {activeTab === "probability_bayes" && bayesData && (
        <div className="row g-4">
          <div className="col-12">
            <div
              className="p-3 rounded-3 border d-flex align-items-center gap-3 shadow-sm"
              style={{
                background: "linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(99, 102, 241, 0.12) 100%)",
                borderColor: "rgba(59, 130, 246, 0.35)",
                color: "#f8fafc",
              }}
            >
              <i className="bi bi-info-circle-fill fs-4" style={{ color: "#60a5fa" }} />
              <div>
                <strong className="text-white">Practical 04: Probability Theory, Random Variables & Bayes' Theorem</strong>
                <div className="small" style={{ color: "#cbd5e1" }}>
                  Computes prior and conditional probabilities from placement data and implements an interactive Bayes' Theorem calculator 
                  to update the posterior probability P(Placed | Evidence).
                </div>
              </div>
            </div>
          </div>

          {/* Prior Probabilities Cards */}
          <div className="col-12">
            <div className="row g-3">
              <div className="col-md-3 col-6">
                <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-3 text-center">
                  <div className="small fw-bold" style={{ color: "#94a3b8" }}>P(Placed) — Prior</div>
                  <div className="display-6 fw-bold text-success">{(bayesData.priors.p_placed * 100).toFixed(1)}%</div>
                  <div className="small" style={{ color: "#cbd5e1" }}>P(Placed = 1)</div>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-3 text-center">
                  <div className="small fw-bold" style={{ color: "#94a3b8" }}>P(Internship ≥ 1)</div>
                  <div className="display-6 fw-bold text-info">{(bayesData.priors.p_internship_ge_1 * 100).toFixed(1)}%</div>
                  <div className="small" style={{ color: "#cbd5e1" }}>Overall Internship Rate</div>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-3 text-center">
                  <div className="small fw-bold" style={{ color: "#94a3b8" }}>P(CGPA ≥ 8.0)</div>
                  <div className="display-6 fw-bold text-warning">{(bayesData.priors.p_cgpa_ge_8 * 100).toFixed(1)}%</div>
                  <div className="small" style={{ color: "#cbd5e1" }}>Academic Distinction</div>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-3 text-center">
                  <div className="small fw-bold" style={{ color: "#94a3b8" }}>P(Tech Score ≥ 75)</div>
                  <div className="display-6 fw-bold text-primary">{(bayesData.priors.p_tech_score_ge_75 * 100).toFixed(1)}%</div>
                  <div className="small" style={{ color: "#cbd5e1" }}>Technical Assessment</div>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Probabilities Chart */}
          <div className="col-lg-5">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3 text-white">
                <i className="bi bi-diagram-3 text-primary me-2" /> Conditional Probabilities
              </h5>
              <div style={{ height: "300px" }}>
                <BarChart
                  labels={["Internship ≥ 1", "No Internship", "CGPA ≥ 8.0", "CGPA < 8.0"]}
                  datasets={[
                    {
                      label: "Placement Probability (%)",
                      data: [
                        (bayesData.conditionals.p_placed_given_internship * 100).toFixed(1),
                        (bayesData.conditionals.p_placed_given_no_internship * 100).toFixed(1),
                        (bayesData.conditionals.p_placed_given_high_cgpa * 100).toFixed(1),
                        (bayesData.conditionals.p_placed_given_low_cgpa * 100).toFixed(1),
                      ],
                      backgroundColor: [
                        "rgba(37, 99, 235, 0.8)",
                        "rgba(239, 68, 68, 0.8)",
                        "rgba(16, 185, 129, 0.8)",
                        "rgba(245, 158, 11, 0.8)",
                      ],
                      borderRadius: 8,
                    },
                  ]}
                  title="P(Placed | Feature Condition)"
                />
              </div>
              <div className="mt-3 text-secondary small">
                Notice: Students with at least 1 internship exhibit substantially higher conditional placement likelihood.
              </div>
            </div>
          </div>

          {/* Interactive Bayes' Theorem Calculator */}
          <div className="col-lg-7">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
                <i className="bi bi-calculator-fill text-warning" /> Interactive Bayes' Theorem Calculator
              </h5>
              <div className="p-3 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-10 mb-3">
                <div className="fw-bold text-info mb-2">Configure Evidence Parameters (Event B):</div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small text-secondary">Min CGPA: {bayesCriteria.cgpa_min}</label>
                    <input
                      type="range"
                      className="form-range"
                      min="6.0"
                      max="9.5"
                      step="0.1"
                      value={bayesCriteria.cgpa_min}
                      onChange={(e) => setBayesCriteria({ ...bayesCriteria, cgpa_min: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-secondary">Min Internships: {bayesCriteria.internships_min}</label>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="3"
                      step="1"
                      value={bayesCriteria.internships_min}
                      onChange={(e) => setBayesCriteria({ ...bayesCriteria, internships_min: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-secondary">Min Tech Score: {bayesCriteria.tech_min}</label>
                    <input
                      type="range"
                      className="form-range"
                      min="50"
                      max="90"
                      step="5"
                      value={bayesCriteria.tech_min}
                      onChange={(e) => setBayesCriteria({ ...bayesCriteria, tech_min: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <button className="btn btn-sm btn-primary mt-2" onClick={handleBayesRecalculate}>
                  <i className="bi bi-play-fill me-1" /> Recompute Bayes Formula
                </button>
              </div>

              {/* Bayes Result Output */}
              <div className="card bg-gradient p-3 rounded-3 border border-info border-opacity-25 mb-3" style={{ background: "rgba(15,23,42,0.8)" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-secondary small">Posterior Probability:</span>
                    <div className="h4 fw-bold text-success mb-0">
                      P(Placed | Evidence) = {bayesData.bayes_calculator.percentage}%
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="text-secondary small">Prior Baseline:</span>
                    <div className="h6 text-info mb-0">{(bayesData.bayes_calculator.prior_p_placed * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              {/* Step by step derivation */}
              <div className="bg-black bg-opacity-40 p-3 rounded-3 border border-secondary border-opacity-10 small font-monospace">
                <div className="text-warning fw-bold mb-2">Mathematical Formulation Steps:</div>
                {bayesData.bayes_calculator.steps.map((step, idx) => (
                  <div key={idx} className="text-secondary mb-1">{step}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Probability Distributions */}
      {activeTab === "distributions" && distData && (
        <div className="row g-4">
          <div className="col-12">
            <div
              className="p-3 rounded-3 border d-flex align-items-center gap-3 shadow-sm"
              style={{
                background: "linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(99, 102, 241, 0.12) 100%)",
                borderColor: "rgba(59, 130, 246, 0.35)",
                color: "#f8fafc",
              }}
            >
              <i className="bi bi-info-circle-fill fs-4" style={{ color: "#60a5fa" }} />
              <div>
                <strong className="text-white">Practical 04: Continuous & Discrete Probability Distributions</strong>
                <div className="small" style={{ color: "#cbd5e1" }}>
                  Fits a Gaussian Normal Distribution to Salary Packages (LPA), simulates a Binomial Distribution for batch placement outcomes, 
                  and models Poisson offer arrivals per student.
                </div>
              </div>
            </div>
          </div>

          {/* Normal Distribution on Package */}
          <div className="col-lg-6">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold mb-0 text-white">
                  <i className="bi bi-bell text-warning me-2" /> Normal Distribution on CTC (LPA)
                </h5>
                <span className="badge bg-secondary">
                  μ = {distData.normal_distribution.mean} | σ = {distData.normal_distribution.std}
                </span>
              </div>
              <div style={{ height: "300px" }}>
                <LineChart
                  labels={distData.normal_distribution.fitted_curve.x}
                  datasets={[
                    {
                      label: "Fitted Gaussian PDF Curve N(μ, σ²)",
                      data: distData.normal_distribution.fitted_curve.y,
                      borderColor: "#3b82f6",
                      backgroundColor: "rgba(59, 130, 246, 0.2)",
                      fill: true,
                      tension: 0.4,
                      pointRadius: 0,
                    },
                  ]}
                  title="Probability Density Function f(x)"
                />
              </div>
              <div className="mt-3 p-3 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-10 small">
                <div className="d-flex justify-content-between">
                  <span>Shapiro-Wilk Normality Test:</span>
                  <span className={distData.normal_distribution.shapiro_test.is_normal ? "text-success fw-bold" : "text-warning fw-bold"}>
                    {distData.normal_distribution.shapiro_test.is_normal ? "Normal Distribution (p > 0.05)" : "Slightly Skewed (p < 0.05)"}
                  </span>
                </div>
                <div className="text-secondary small mt-1">
                  W = {distData.normal_distribution.shapiro_test.statistic}, p-value = {distData.normal_distribution.shapiro_test.p_value}
                </div>
              </div>
            </div>
          </div>

          {/* Binomial Distribution */}
          <div className="col-lg-6">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold mb-0 text-white">
                  <i className="bi bi-dice-5 text-success me-2" /> Binomial Distribution: Batch Outcomes
                </h5>
                <span className="badge bg-secondary">
                  n = {distData.binomial_distribution.n} | p = {distData.binomial_distribution.p}
                </span>
              </div>
              <div style={{ height: "300px" }}>
                <BarChart
                  labels={distData.binomial_distribution.k.map((k) => `k=${k}`)}
                  datasets={[
                    {
                      label: "P(X = k) Probability Mass Function",
                      data: distData.binomial_distribution.pmf,
                      backgroundColor: "rgba(16, 185, 129, 0.75)",
                      borderRadius: 4,
                    },
                  ]}
                  title="Binomial PMF: Probability of k Students Placed out of 30"
                />
              </div>
              <div className="mt-3 p-3 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-10 small d-flex justify-content-between">
                <div>
                  <span className="text-secondary">Expected Placed: </span>
                  <strong className="text-white">{distData.binomial_distribution.expected_value} students</strong>
                </div>
                <div>
                  <span className="text-secondary">Variance: </span>
                  <strong className="text-white">{distData.binomial_distribution.variance}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Sampling Techniques & Central Limit Theorem */}
      {activeTab === "sampling_clt" && samplingData && (
        <div className="row g-4">
          <div className="col-12">
            <div
              className="p-3 rounded-3 border d-flex align-items-center gap-3 shadow-sm"
              style={{
                background: "linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(99, 102, 241, 0.12) 100%)",
                borderColor: "rgba(59, 130, 246, 0.35)",
                color: "#f8fafc",
              }}
            >
              <i className="bi bi-info-circle-fill fs-4" style={{ color: "#60a5fa" }} />
              <div>
                <strong className="text-white">Practical 05: Sampling Techniques & Central Limit Theorem (CLT) Simulation</strong>
                <div className="small" style={{ color: "#cbd5e1" }}>
                  Demonstrates Simple Random Sampling, Stratified Sampling, and simulates the Central Limit Theorem: as sample size n increases, 
                  the distribution of sample means converges to a Normal distribution with standard error σ / √n.
                </div>
              </div>
            </div>
          </div>

          {/* Sampling Techniques Comparison */}
          <div className="col-lg-4">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3 text-white">
                <i className="bi bi-layers text-info me-2" /> Sampling Methods
              </h5>
              
              <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 mb-3">
                <div className="small fw-bold" style={{ color: "#94a3b8" }}>TRUE POPULATION PARAMETERS</div>
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <span>Size (N): <strong className="text-white">{samplingData.population.size}</strong></span>
                  <span>Mean (μ): <strong className="text-warning">{samplingData.population.mean} LPA</strong></span>
                  <span>Std (σ): <strong className="text-white">{samplingData.population.std}</strong></span>
                </div>
              </div>

              <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-primary border-opacity-40 mb-3">
                <div className="small fw-bold" style={{ color: "#60a5fa" }}>SIMPLE RANDOM SAMPLING (SRS)</div>
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <span>Sample Size: <strong className="text-white">{samplingData.simple_random_sample.sample_size}</strong></span>
                  <span>Sample Mean: <strong className="text-info">{samplingData.simple_random_sample.mean} LPA</strong></span>
                </div>
                <div className="small mt-1" style={{ color: "#cbd5e1" }}>
                  Sampling Error: |x̄ - μ| = <strong className="text-warning">{samplingData.simple_random_sample.sampling_error} LPA</strong>
                </div>
              </div>

              <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-success border-opacity-40 mb-3">
                <div className="small fw-bold" style={{ color: "#34d399" }}>STRATIFIED SAMPLING (BY DEPT)</div>
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <span>Sample Size: <strong className="text-white">{samplingData.stratified_sample.sample_size}</strong></span>
                  <span>Stratified Mean: <strong className="text-success">{samplingData.stratified_sample.mean} LPA</strong></span>
                </div>
                <div className="small mt-1" style={{ color: "#cbd5e1" }}>
                  Sampling Error: |x̄_strat - μ| = <strong className="text-warning">{samplingData.stratified_sample.sampling_error} LPA</strong>
                </div>
              </div>
            </div>
          </div>

          {/* CLT Simulator */}
          <div className="col-lg-8">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-white">
                  <i className="bi bi-cpu text-warning me-2" /> Central Limit Theorem Simulator
                </h5>
                <span className="badge bg-primary">
                  {cltParams.num_samples} Samples of Size n = {cltParams.sample_size}
                </span>
              </div>

              <div className="row g-3 p-3 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-10 mb-3">
                <div className="col-md-5">
                  <label className="form-label small text-secondary">Sample Size (n): {cltParams.sample_size}</label>
                  <input
                    type="range"
                    className="form-range"
                    min="5"
                    max="50"
                    step="5"
                    value={cltParams.sample_size}
                    onChange={(e) => setCltParams({ ...cltParams, sample_size: parseInt(e.target.value) })}
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label small text-secondary">Number of Samples (K): {cltParams.num_samples}</label>
                  <input
                    type="range"
                    className="form-range"
                    min="100"
                    max="1000"
                    step="100"
                    value={cltParams.num_samples}
                    onChange={(e) => setCltParams({ ...cltParams, num_samples: parseInt(e.target.value) })}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button className="btn btn-sm btn-warning w-100 fw-bold" onClick={handleCltSimulate}>
                    <i className="bi bi-arrow-repeat me-1" /> Simulate
                  </button>
                </div>
              </div>

              <div style={{ height: "280px" }}>
                <LineChart
                  labels={samplingData.clt_simulation.theoretical_curve.x}
                  datasets={[
                    {
                      label: "Theoretical Normal Distribution N(μ, σ²/n)",
                      data: samplingData.clt_simulation.theoretical_curve.y,
                      borderColor: "#eab308",
                      backgroundColor: "rgba(234, 179, 8, 0.2)",
                      fill: true,
                      tension: 0.4,
                      pointRadius: 0,
                    },
                  ]}
                  title="Distribution of Sample Means (CLT Convergence)"
                />
              </div>

              <div className="mt-3 p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-10 small d-flex justify-content-between">
                <div>
                  <span className="text-secondary">Mean of Sample Means (μ_x̄): </span>
                  <strong className="text-warning">{samplingData.clt_simulation.mean_of_sample_means} LPA</strong>
                </div>
                <div>
                  <span className="text-secondary">Simulated Std Error: </span>
                  <strong className="text-white">{samplingData.clt_simulation.std_of_sample_means}</strong>
                </div>
                <div>
                  <span className="text-secondary">Theoretical SE (σ/√n): </span>
                  <strong className="text-success">{samplingData.clt_simulation.theoretical_standard_error}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Point & Interval Estimation */}
      {activeTab === "estimation" && estimationData && (
        <div className="row g-4">
          <div className="col-12">
            <div
              className="p-3 rounded-3 border d-flex align-items-center gap-3 shadow-sm"
              style={{
                background: "linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(99, 102, 241, 0.12) 100%)",
                borderColor: "rgba(59, 130, 246, 0.35)",
                color: "#f8fafc",
              }}
            >
              <i className="bi bi-info-circle-fill fs-4" style={{ color: "#60a5fa" }} />
              <div>
                <strong className="text-white">Practical 06: Point & Interval Estimation (Confidence Intervals)</strong>
                <div className="small" style={{ color: "#cbd5e1" }}>
                  Calculates point estimates, standard error, margin of error, and builds 90%, 95%, and 99% confidence intervals 
                  for both average placement package (t-distribution) and placement proportion (z-distribution).
                </div>
              </div>
            </div>
          </div>

          {/* Mean Package Estimation */}
          <div className="col-lg-6">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
                <i className="bi bi-cash-stack text-success" /> Mean CTC Package Estimation (LPA)
              </h5>
              
              <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 mb-4">
                <div>
                  <div className="small" style={{ color: "#94a3b8" }}>Point Estimate (Sample Mean x̄):</div>
                  <div className="h3 fw-bold text-success mb-0">{estimationData.mean_package_estimation.point_estimate} LPA</div>
                </div>
                <div className="text-end">
                  <div className="small" style={{ color: "#94a3b8" }}>Standard Error (s / √n):</div>
                  <div className="h5 text-info mb-0">± {estimationData.mean_package_estimation.standard_error} LPA</div>
                </div>
              </div>

              <h6 className="fw-bold text-light mb-3">Confidence Intervals (Student's t-Distribution):</h6>
              <div className="d-flex flex-column gap-3">
                {Object.entries(estimationData.mean_package_estimation.confidence_intervals).map(([level, ci]) => (
                  <div key={level} className="p-3 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-20">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span
                        className="badge border px-2 py-1 fw-semibold"
                        style={{ background: "rgba(37, 99, 235, 0.25)", color: "#93c5fd", borderColor: "#3b82f6" }}
                      >
                        {level} Confidence Level
                      </span>
                      <span className="small" style={{ color: "#cbd5e1" }}>t_crit = {ci.critical_value_t} | Error = ±{ci.margin_of_error} LPA</span>
                    </div>
                    <div className="h5 text-white fw-bold mb-1">
                      [{ci.lower_bound} LPA &nbsp;—&nbsp; {ci.upper_bound} LPA]
                    </div>
                    <div className="small" style={{ color: "#cbd5e1" }}>
                      We are {level} confident that the true population average package lies within this interval.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Proportion Estimation */}
          <div className="col-lg-6">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
                <i className="bi bi-pie-chart text-info" /> Placement Proportion Estimation (p̂)
              </h5>

              <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 mb-4">
                <div>
                  <div className="small" style={{ color: "#94a3b8" }}>Point Estimate (Sample Proportion p̂):</div>
                  <div className="h3 fw-bold text-info mb-0">{estimationData.placement_proportion_estimation.percentage}%</div>
                </div>
                <div className="text-end">
                  <div className="small" style={{ color: "#94a3b8" }}>Standard Error:</div>
                  <div className="h5 text-warning mb-0">± {(estimationData.placement_proportion_estimation.standard_error * 100).toFixed(2)}%</div>
                </div>
              </div>

              <h6 className="fw-bold text-light mb-3">Confidence Intervals (Standard Normal z-Distribution):</h6>
              <div className="d-flex flex-column gap-3">
                {Object.entries(estimationData.placement_proportion_estimation.confidence_intervals).map(([level, ci]) => (
                  <div key={level} className="p-3 rounded-3 bg-black bg-opacity-30 border border-secondary border-opacity-20">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span
                        className="badge border px-2 py-1 fw-semibold"
                        style={{ background: "rgba(16, 185, 129, 0.25)", color: "#6ee7b7", borderColor: "#10b981" }}
                      >
                        {level} Confidence Level
                      </span>
                      <span className="small" style={{ color: "#cbd5e1" }}>z_crit = {ci.critical_value_z} | Margin = ±{(ci.margin_of_error * 100).toFixed(2)}%</span>
                    </div>
                    <div className="h5 text-white fw-bold mb-1">
                      [{ci.lower_percent}% &nbsp;—&nbsp; {ci.upper_percent}%]
                    </div>
                    <div className="small" style={{ color: "#cbd5e1" }}>
                      We are {level} confident that the university overall placement rate is bounded within this range.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Regression Studio & Prediction Modeler */}
      {activeTab === "regression" && regressionData && (
        <div className="row g-4">
          <div className="col-12">
            <div
              className="p-3 rounded-3 border d-flex align-items-center gap-3 shadow-sm"
              style={{
                background: "linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(99, 102, 241, 0.12) 100%)",
                borderColor: "rgba(59, 130, 246, 0.35)",
                color: "#f8fafc",
              }}
            >
              <i className="bi bi-info-circle-fill fs-4" style={{ color: "#60a5fa" }} />
              <div>
                <strong className="text-white">Practical 07: Multiple Linear & Logistic Regression with Interactive Predictor</strong>
                <div className="small" style={{ color: "#cbd5e1" }}>
                  Fits Multiple Linear Regression on Salary (LPA) and Logistic Regression on Placement (Placed/Unplaced). 
                  Test the interactive "Predict My Placement & Salary" model below!
                </div>
              </div>
            </div>
          </div>

          {/* Model Statistics */}
          <div className="col-lg-6">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-white">
                  <i className="bi bi-graph-up text-primary me-2" /> Multiple Linear Regression (Salary)
                </h5>
                <span
                  className="badge border px-3 py-1 fs-6 fw-bold"
                  style={{ background: "rgba(37, 99, 235, 0.25)", color: "#93c5fd", borderColor: "#3b82f6" }}
                >
                  R² = {regressionData.multiple_linear_regression.r_squared}
                </span>
              </div>

              <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 mb-3 small">
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ color: "#94a3b8" }}>Adjusted R²:</span>
                  <strong className="text-white">{regressionData.multiple_linear_regression.adjusted_r_squared}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ color: "#94a3b8" }}>Root Mean Squared Error (RMSE):</span>
                  <strong className="text-warning">{regressionData.multiple_linear_regression.rmse} LPA</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#94a3b8" }}>Model Intercept (β₀):</span>
                  <strong className="text-info">{regressionData.multiple_linear_regression.intercept}</strong>
                </div>
              </div>

              <h6 className="fw-bold text-light mb-2">Feature Importance (Standardized β):</h6>
              <div className="d-flex flex-column gap-2 mb-3">
                {Object.entries(regressionData.multiple_linear_regression.feature_importance || {}).map(([f, val]) => (
                  <div key={f} className="d-flex align-items-center gap-2 small">
                    <span className="text-truncate" style={{ width: "140px", color: "#cbd5e1" }}>{f}</span>
                    <div className="progress flex-grow-1" style={{ height: "8px", background: "rgba(255,255,255,0.1)" }}>
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${Math.min(100, Math.abs(val) * 100)}%` }}
                      />
                    </div>
                    <span className="text-end fw-bold text-info" style={{ width: "50px" }}>{val}</span>
                  </div>
                ))}
              </div>

              <hr className="border-secondary border-opacity-25" />

              {/* Logistic Regression Metrics */}
              <h6 className="fw-bold text-white mb-2">Logistic Regression Classification Metrics:</h6>
              <div className="row g-2 text-center">
                <div className="col-3">
                  <div className="p-2 bg-black bg-opacity-40 rounded border border-secondary border-opacity-20">
                    <div className="small" style={{ color: "#cbd5e1" }}>Accuracy</div>
                    <div className="fw-bold text-success fs-5">{regressionData.logistic_regression.metrics.accuracy}%</div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 bg-black bg-opacity-40 rounded border border-secondary border-opacity-20">
                    <div className="small" style={{ color: "#cbd5e1" }}>Precision</div>
                    <div className="fw-bold text-info fs-5">{regressionData.logistic_regression.metrics.precision}%</div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 bg-black bg-opacity-40 rounded border border-secondary border-opacity-20">
                    <div className="small" style={{ color: "#cbd5e1" }}>Recall</div>
                    <div className="fw-bold text-warning fs-5">{regressionData.logistic_regression.metrics.recall}%</div>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 bg-black bg-opacity-40 rounded border border-secondary border-opacity-20">
                    <div className="small" style={{ color: "#cbd5e1" }}>ROC-AUC</div>
                    <div className="fw-bold text-primary fs-5">{regressionData.logistic_regression.metrics.roc_auc}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Prediction Tool */}
          <div className="col-lg-6">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
                <i className="bi bi-magic text-warning" /> Interactive "Predict My Placement" Tool
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" style={{ color: "#e2e8f0" }}>CGPA: <span className="text-warning">{predictInputs.cgpa}</span></label>
                  <input
                    type="range"
                    className="form-range"
                    min="5.5"
                    max="10.0"
                    step="0.1"
                    value={predictInputs.cgpa}
                    onChange={(e) => setPredictInputs({ ...predictInputs, cgpa: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" style={{ color: "#e2e8f0" }}>Technical Score: <span className="text-info">{predictInputs.technical_score}</span></label>
                  <input
                    type="range"
                    className="form-range"
                    min="40"
                    max="100"
                    step="1"
                    value={predictInputs.technical_score}
                    onChange={(e) => setPredictInputs({ ...predictInputs, technical_score: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" style={{ color: "#e2e8f0" }}>Coding Score: <span className="text-info">{predictInputs.coding_score}</span></label>
                  <input
                    type="range"
                    className="form-range"
                    min="40"
                    max="100"
                    step="1"
                    value={predictInputs.coding_score}
                    onChange={(e) => setPredictInputs({ ...predictInputs, coding_score: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" style={{ color: "#e2e8f0" }}>Soft Skills Score: <span className="text-info">{predictInputs.soft_skills_score}</span></label>
                  <input
                    type="range"
                    className="form-range"
                    min="40"
                    max="100"
                    step="1"
                    value={predictInputs.soft_skills_score}
                    onChange={(e) => setPredictInputs({ ...predictInputs, soft_skills_score: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" style={{ color: "#e2e8f0" }}>Internships: <span className="text-success">{predictInputs.internships_count}</span></label>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="4"
                    step="1"
                    value={predictInputs.internships_count}
                    onChange={(e) => setPredictInputs({ ...predictInputs, internships_count: parseInt(e.target.value) })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" style={{ color: "#e2e8f0" }}>Projects: <span className="text-success">{predictInputs.projects_count}</span></label>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="6"
                    step="1"
                    value={predictInputs.projects_count}
                    onChange={(e) => setPredictInputs({ ...predictInputs, projects_count: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <button className="btn btn-primary w-100 mt-3 fw-bold py-2 shadow-sm" onClick={handlePredict} disabled={predictLoading}>
                {predictLoading ? "Computing Model Predictions..." : "Run ML Regression Predictor"}
              </button>

              {predictResult && (
                <div className="mt-4 p-4 rounded-4 border" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)", borderColor: "rgba(59,130,246,0.3)" }}>
                  <div className="row g-3 text-center">
                    <div className="col-6">
                      <div className="small fw-semibold" style={{ color: "#94a3b8" }}>Placement Probability</div>
                      <div className="display-6 fw-bold text-success mb-1">
                        {predictResult.placement_probability}%
                      </div>
                      <span
                        className="badge border px-3 py-1 fw-semibold"
                        style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7", borderColor: "#10b981" }}
                      >
                        {predictResult.placement_verdict}
                      </span>
                    </div>
                    <div className="col-6">
                      <div className="small fw-semibold" style={{ color: "#94a3b8" }}>Estimated CTC Package</div>
                      <div className="display-6 fw-bold text-warning mb-1">
                        {predictResult.predicted_package_lpa} LPA
                      </div>
                      <span
                        className="badge border px-3 py-1 fw-semibold"
                        style={{ background: "rgba(245,158,11,0.2)", color: "#fcd34d", borderColor: "#f59e0b" }}
                      >
                        Based on Linear Fit
                      </span>
                    </div>
                  </div>

                  {predictResult.recommendations?.length > 0 && (
                    <div className="mt-3 pt-3 border-top border-secondary border-opacity-25 text-start small">
                      <div className="fw-bold text-info mb-1">Actionable Recommendations:</div>
                      <ul className="mb-0 text-secondary ps-3">
                        {predictResult.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Parametric Hypothesis Testing */}
      {activeTab === "hypothesis" && hypoData && (
        <div className="row g-4">
          <div className="col-12">
            <div
              className="p-3 rounded-3 border d-flex align-items-center justify-content-between flex-wrap gap-3 shadow-sm"
              style={{
                background: "linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(99, 102, 241, 0.12) 100%)",
                borderColor: "rgba(59, 130, 246, 0.35)",
                color: "#f8fafc",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-info-circle-fill fs-4" style={{ color: "#60a5fa" }} />
                <div>
                  <strong className="text-white">Practical 08: Parametric Hypothesis Testing</strong>
                  <div className="small" style={{ color: "#cbd5e1" }}>
                    Formulates null (H₀) and alternative (H₁) hypotheses, computes test statistics, critical values, and p-values.
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="small fw-semibold" style={{ color: "#cbd5e1" }}>Significance Level (α):</span>
                <div className="btn-group btn-group-sm">
                  <button
                    className={`btn ${alphaLevel === 0.05 ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => handleAlphaChange(0.05)}
                  >
                    α = 0.05 (95%)
                  </button>
                  <button
                    className={`btn ${alphaLevel === 0.01 ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => handleAlphaChange(0.01)}
                  >
                    α = 0.01 (99%)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Test 1: One-Sample t-Test */}
          <div className="col-lg-4">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold text-white mb-0">1. One-Sample t-Test</h6>
                <span className={`badge ${hypoData.one_sample_t_test.decision === "Reject H0" ? "bg-danger" : "bg-success"}`}>
                  {hypoData.one_sample_t_test.decision}
                </span>
              </div>
              <div className="small mb-3" style={{ color: "#94a3b8" }}>Comparing University CTC against National Benchmark</div>

              <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 small mb-3">
                <div className="mb-1"><strong>H₀:</strong> μ = {hypoData.one_sample_t_test.benchmark_mu} LPA</div>
                <div className="mb-2"><strong>H₁:</strong> μ ≠ {hypoData.one_sample_t_test.benchmark_mu} LPA</div>
                <div className="d-flex justify-content-between" style={{ color: "#cbd5e1" }}>
                  <span>Sample Mean (x̄): <strong className="text-warning">{hypoData.one_sample_t_test.sample_mean} LPA</strong></span>
                  <span>n: <strong className="text-white">{hypoData.one_sample_t_test.sample_size}</strong></span>
                </div>
              </div>

              <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 small mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ color: "#cbd5e1" }}>t-Statistic:</span>
                  <strong className="text-warning">{hypoData.one_sample_t_test.t_statistic}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ color: "#cbd5e1" }}>Critical Value (t_crit):</span>
                  <strong className="text-white">±{hypoData.one_sample_t_test.critical_value}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#cbd5e1" }}>p-value:</span>
                  <strong className={hypoData.one_sample_t_test.p_value < alphaLevel ? "text-danger" : "text-success"}>
                    {hypoData.one_sample_t_test.p_value}
                  </strong>
                </div>
              </div>

              <div className="small p-2 rounded-2 mt-2" style={{ color: "#e2e8f0", background: "rgba(255,255,255,0.06)", borderLeft: "3px solid #3b82f6" }}>
                {hypoData.one_sample_t_test.conclusion}
              </div>
            </div>
          </div>

          {/* Test 2: Two-Sample Independent t-Test */}
          <div className="col-lg-4">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold text-white mb-0">2. Independent Two-Sample t-Test</h6>
                <span className={`badge ${hypoData.two_sample_t_test.decision === "Reject H0" ? "bg-danger" : "bg-success"}`}>
                  {hypoData.two_sample_t_test.decision}
                </span>
              </div>
              <div className="small mb-3" style={{ color: "#94a3b8" }}>Impact of Industry Internship on CTC Package</div>

              <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 small mb-3">
                <div className="mb-1"><strong>H₀:</strong> μ_internships = μ_no_internships</div>
                <div className="mb-2"><strong>H₁:</strong> μ_internships &gt; μ_no_internships</div>
                <div className="d-flex justify-content-between" style={{ color: "#cbd5e1" }}>
                  <span>Intern Mean: <strong className="text-success">{hypoData.two_sample_t_test.group_a.mean} LPA</strong></span>
                  <span>No Intern: <strong className="text-warning">{hypoData.two_sample_t_test.group_b.mean} LPA</strong></span>
                </div>
              </div>

              <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 small mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ color: "#cbd5e1" }}>t-Statistic:</span>
                  <strong className="text-warning">{hypoData.two_sample_t_test.t_statistic}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ color: "#cbd5e1" }}>Cohen's d Effect Size:</span>
                  <strong className="text-info">{hypoData.two_sample_t_test.cohens_d}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#cbd5e1" }}>p-value:</span>
                  <strong className="text-danger">{hypoData.two_sample_t_test.p_value}</strong>
                </div>
              </div>

              <div className="small p-2 rounded-2 mt-2" style={{ color: "#e2e8f0", background: "rgba(255,255,255,0.06)", borderLeft: "3px solid #3b82f6" }}>
                {hypoData.two_sample_t_test.conclusion}
              </div>
            </div>
          </div>

          {/* Test 3: One-Way ANOVA */}
          <div className="col-lg-4">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold text-white mb-0">3. One-Way ANOVA (F-Test)</h6>
                <span className={`badge ${hypoData.one_way_anova.decision === "Reject H0" ? "bg-danger" : "bg-success"}`}>
                  {hypoData.one_way_anova.decision}
                </span>
              </div>
              <div className="small mb-3" style={{ color: "#94a3b8" }}>Testing Package Differences Across Departments</div>

              <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 small mb-3">
                <div className="mb-1"><strong>H₀:</strong> All departments have equal mean CTC</div>
                <div className="mb-2"><strong>H₁:</strong> At least one department has different mean CTC</div>
                <div className="d-flex justify-content-between" style={{ color: "#cbd5e1" }}>
                  <span>df(between): <strong className="text-white">{hypoData.one_way_anova.degrees_of_freedom_between}</strong></span>
                  <span>df(within): <strong className="text-white">{hypoData.one_way_anova.degrees_of_freedom_within}</strong></span>
                </div>
              </div>

              <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 small mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ color: "#cbd5e1" }}>F-Statistic:</span>
                  <strong className="text-warning">{hypoData.one_way_anova.f_statistic}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ color: "#cbd5e1" }}>Critical F:</span>
                  <strong className="text-white">{hypoData.one_way_anova.f_critical}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#cbd5e1" }}>p-value:</span>
                  <strong className="text-danger">{hypoData.one_way_anova.p_value}</strong>
                </div>
              </div>

              <div className="small p-2 rounded-2 mt-2" style={{ color: "#e2e8f0", background: "rgba(255,255,255,0.06)", borderLeft: "3px solid #3b82f6" }}>
                {hypoData.one_way_anova.conclusion}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: Non-Parametric Tests */}
      {activeTab === "non_parametric" && nonParamData && (
        <div className="row g-4">
          <div className="col-12">
            <div
              className="p-3 rounded-3 border d-flex align-items-center gap-3 shadow-sm"
              style={{
                background: "linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(99, 102, 241, 0.12) 100%)",
                borderColor: "rgba(59, 130, 246, 0.35)",
                color: "#f8fafc",
              }}
            >
              <i className="bi bi-info-circle-fill fs-4" style={{ color: "#60a5fa" }} />
              <div>
                <strong className="text-white">Practical 09: Non-Parametric & Small Sample Tests</strong>
                <div className="small" style={{ color: "#cbd5e1" }}>
                  Implements Chi-Square Test of Independence (χ²) with contingency tables and the Mann-Whitney U test (Wilcoxon rank-sum test) 
                  without assuming normal population distributions.
                </div>
              </div>
            </div>
          </div>

          {/* Chi-Square Test */}
          <div className="col-lg-6">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold mb-0 text-white">
                  <i className="bi bi-grid-3x3 text-warning me-2" /> Chi-Square Test of Independence (χ²)
                </h5>
                <span className={`badge ${nonParamData.chi_square_test.decision === "Reject H0" ? "bg-danger" : "bg-success"}`}>
                  {nonParamData.chi_square_test.decision}
                </span>
              </div>
              <div className="small mb-3" style={{ color: "#94a3b8" }}>
                Testing relationship between Internship Experience and Placement Status
              </div>

              {/* Observed Contingency Table */}
              <div className="mb-3">
                <div className="fw-bold text-info small mb-1">Observed Frequencies Matrix (O):</div>
                <table className="table table-dark table-bordered border-secondary border-opacity-25 text-center small mb-0">
                  <thead style={{ background: "rgba(255,255,255,0.05)" }}>
                    <tr>
                      <th>Category</th>
                      <th>Unplaced</th>
                      <th>Placed</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonParamData.chi_square_test.observed_table.map((row) => (
                      <tr key={row.category}>
                        <td className="fw-bold text-start">{row.category}</td>
                        <td className="text-danger fw-semibold">{row.unplaced}</td>
                        <td className="text-success fw-semibold">{row.placed}</td>
                        <td className="fw-bold text-white">{row.unplaced + row.placed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Expected Frequencies Table */}
              <div className="mb-3">
                <div className="fw-bold small mb-1" style={{ color: "#94a3b8" }}>Expected Frequencies Matrix (E):</div>
                <table className="table table-dark table-bordered border-secondary border-opacity-25 text-center small mb-0">
                  <thead style={{ background: "rgba(255,255,255,0.05)" }}>
                    <tr>
                      <th>Category</th>
                      <th>Expected Unplaced</th>
                      <th>Expected Placed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonParamData.chi_square_test.expected_table.map((row) => (
                      <tr key={row.category}>
                        <td className="fw-bold text-start">{row.category}</td>
                        <td style={{ color: "#cbd5e1" }}>{row.unplaced}</td>
                        <td style={{ color: "#cbd5e1" }}>{row.placed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 small mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ color: "#cbd5e1" }}>χ² Statistic:</span>
                  <strong className="text-warning">{nonParamData.chi_square_test.chi2_statistic}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ color: "#cbd5e1" }}>Degrees of Freedom:</span>
                  <strong className="text-white">{nonParamData.chi_square_test.degrees_of_freedom}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#cbd5e1" }}>p-value:</span>
                  <strong className="text-danger">{nonParamData.chi_square_test.p_value}</strong>
                </div>
              </div>

              <div className="small p-2 rounded-2 mt-2" style={{ color: "#e2e8f0", background: "rgba(255,255,255,0.06)", borderLeft: "3px solid #10b981" }}>
                {nonParamData.chi_square_test.conclusion}
              </div>
            </div>
          </div>

          {/* Mann-Whitney U Test */}
          <div className="col-lg-6">
            <div className="card bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold mb-0 text-white">
                  <i className="bi bi-sort-numeric-down text-info me-2" /> Mann-Whitney U Test (Wilcoxon Rank-Sum)
                </h5>
                <span className={`badge ${nonParamData.mann_whitney_u_test.decision === "Reject H0" ? "bg-danger" : "bg-success"}`}>
                  {nonParamData.mann_whitney_u_test.decision}
                </span>
              </div>
              <div className="small mb-3" style={{ color: "#94a3b8" }}>
                Non-parametric test comparing package ranks between High CGPA (≥ 8.0) and Normal CGPA (&lt; 8.0)
              </div>

              <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 small mb-3">
                <div className="mb-2"><strong>Hypothesis:</strong> Non-parametric rank-sum equality test</div>
                <div className="d-flex justify-content-between mb-1" style={{ color: "#cbd5e1" }}>
                  <span>Group 1 (CGPA ≥ 8.0): <strong>n={nonParamData.mann_whitney_u_test.group_1.size}</strong></span>
                  <span>Median: <strong className="text-success">{nonParamData.mann_whitney_u_test.group_1.median} LPA</strong></span>
                </div>
                <div className="d-flex justify-content-between" style={{ color: "#cbd5e1" }}>
                  <span>Group 2 (CGPA &lt; 8.0): <strong>n={nonParamData.mann_whitney_u_test.group_2.size}</strong></span>
                  <span>Median: <strong className="text-warning">{nonParamData.mann_whitney_u_test.group_2.median} LPA</strong></span>
                </div>
              </div>

              <div className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-20 small mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ color: "#cbd5e1" }}>U Statistic:</span>
                  <strong className="text-warning">{nonParamData.mann_whitney_u_test.u_statistic}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "#cbd5e1" }}>p-value (two-sided):</span>
                  <strong className="text-danger">{nonParamData.mann_whitney_u_test.p_value}</strong>
                </div>
              </div>

              <div className="small p-2 rounded-2 mt-2" style={{ color: "#e2e8f0", background: "rgba(255,255,255,0.06)", borderLeft: "3px solid #10b981" }}>
                {nonParamData.mann_whitney_u_test.conclusion}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
