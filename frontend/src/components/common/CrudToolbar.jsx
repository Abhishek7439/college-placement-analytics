/**
 * CrudToolbar — page header row used by all admin CRUD panels.
 *
 * Props:
 *   title               string
 *   subtitle            string   (optional)
 *   addLabel            string
 *   onAdd               fn
 *   search              string
 *   onSearch            fn(value)
 *   searchPlaceholder   string
 *   children            extra filter elements (optional)
 */
export default function CrudToolbar({
  title,
  subtitle,
  addLabel,
  onAdd,
  search,
  onSearch,
  searchPlaceholder = "Search…",
  children,
}) {
  return (
    <div className="mb-4">
      {/* Title row */}
      <div
        className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3"
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: "16px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        }}
      >
        <div>
          <h4 className="fw-bold mb-0" style={{ fontSize: "1.1rem", color: "#0f172a" }}>{title}</h4>
          {subtitle && <p className="text-muted mb-0 mt-1" style={{ fontSize: 13 }}>{subtitle}</p>}
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          style={{ fontSize: 13, paddingLeft: 14, paddingRight: 14 }}
          onClick={onAdd}
        >
          <i className="bi bi-plus-lg" />
          {addLabel}
        </button>
      </div>

      {/* Filters row */}
      <div className="d-flex flex-wrap gap-2 align-items-center">
        {/* Search box */}
        <div
          className="input-group"
          style={{ maxWidth: 300, background: "#fff", borderRadius: 8 }}
        >
          <span className="input-group-text" style={{ border: "1px solid #e2e8f0", borderRight: "none", background: "#f8fafc", borderRadius: "8px 0 0 8px" }}>
            <i className="bi bi-search" style={{ color: "#64748b", fontSize: 13 }} />
          </span>
          <input
            type="text"
            className="form-control"
            style={{ border: "1px solid #e2e8f0", borderLeft: "none", borderRadius: "0 8px 8px 0", fontSize: 13 }}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          {search && (
            <button
              className="btn"
              style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", padding: "2px 6px", zIndex: 5 }}
              onClick={() => onSearch("")}
            >
              <i className="bi bi-x" style={{ fontSize: 14, color: "#64748b" }} />
            </button>
          )}
        </div>

        {/* Extra filters from parent */}
        {children}
      </div>
    </div>
  );
}
