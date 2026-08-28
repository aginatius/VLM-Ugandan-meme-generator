export default function Header({
  page,
  navOpen,
  theme,
  onNavigate,
  onToggle,
  onThemeToggle,
}) {
  const items = [
    ["home", "Home"],
    ["generate", "Generate"],
    ["how", "How It Works"],
    ["samples", "Samples"],
  ];

  return (
    <header className="site-header">
      <div className="site-header-inner">

        <button
          className="brand"
          onClick={() => onNavigate("home")}
          aria-label="Uganda AI Meme Studio"
        >
          <img
            src="/logo.webp"
            alt=""
            className="brand-logo"
          />

          <span className="brand-name">
            Uganda AI Meme Studio
          </span>
        </button>

        <nav className={`site-nav ${navOpen ? "open" : ""}`}>
          {items.map(([id, label]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => onNavigate(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <button
          className="theme-toggle"
          onClick={onThemeToggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          <span className="theme-toggle-label">
            {theme === "dark" ? "Light" : "Dark"}
          </span>
        </button>

        <button
          className="nav-toggle"
          aria-label="Menu"
          aria-expanded={navOpen}
          onClick={onToggle}
        >
          ☰
        </button>

      </div>
    </header>
  );
}