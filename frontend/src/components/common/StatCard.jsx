/**
 * StatCard — redesigned KPI card with gradient accent, icon, trend badge.
 *
 * Props:
 *   title       string   — metric label
 *   value       any      — primary number/string
 *   subtitle    string   — secondary line (optional)
 *   icon        string   — Bootstrap Icons class e.g. "bi-people-fill"
 *   colorClass  string   — Bootstrap colour token e.g. "primary" (default)
 *   trend       number   — % change vs previous period (optional)
 */

const ACCENT_COLORS = {
  primary:   { bg: "#2563eb", light: "#eff6ff", text: "#1d4ed8" },
  success:   { bg: "#059669", light: "#f0fdf4", text: "#065f46" },
  danger:    { bg: "#dc2626", light: "#fef2f2", text: "#991b1b" },
  warning:   { bg: "#d97706", light: "#fffbeb", text: "#92400e" },
  info:      { bg: "#0891b2", light: "#ecfeff", text: "#164e63" },
  secondary: { bg: "#7c3aed", light: "#f5f3ff", text: "#5b21b6" },
};

export default function StatCard({
  title,
  value,
  subtitle,
  colorClass = "primary",
  icon,
  trend,
}) {
  const colors = ACCENT_COLORS[colorClass] || ACCENT_COLORS.primary;
  const trendPositive = trend > 0;
  const trendNeutral  = trend === 0 || trend === undefined || trend === null;

  return (
    <div className="cpa-stat-card">
      {/* Left accent bar */}
      <div className="cpa-stat-card-accent" style={{ background: colors.bg }} />

      {/* Icon badge */}
      {icon && (
        <div
          className="cpa-stat-icon"
          style={{ background: colors.light, color: colors.text }}
        >
          <i className={`bi ${icon}`} />
        </div>
      )}

      {/* Label */}
      <div className="cpa-stat-label" style={{ paddingLeft: 8 }}>{title}</div>

      {/* Value */}
      <div className="cpa-stat-value" style={{ color: colors.text, paddingLeft: 8 }}>
        {value}
      </div>

      {/* Subtitle + trend */}
      <div className="d-flex align-items-center justify-content-between mt-1" style={{ paddingLeft: 8 }}>
        {subtitle && (
          <span className="cpa-stat-sub">{subtitle}</span>
        )}
        {!trendNeutral && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 20,
              background: trendPositive ? "#f0fdf4" : "#fef2f2",
              color: trendPositive ? "#059669" : "#dc2626",
              marginLeft: "auto",
            }}
          >
            <i className={`bi bi-arrow-${trendPositive ? "up" : "down"}-short`} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}
