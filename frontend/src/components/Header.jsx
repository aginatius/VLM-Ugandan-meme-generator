export default function Header({ page, navOpen, onNavigate, onToggle }) {
  const items = [
    ["home", "Home"],
    ["generate", "Generate"],
    ["how", "How It Works"],
    ["samples", "Samples"],
  ];

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <button className="brand" onClick={() => onNavigate("home")}>
          <span className="brand-mark" />
          Uganda AI Meme Studio
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