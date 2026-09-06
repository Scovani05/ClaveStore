const backofficeNavigation = [
  { id: "admin", label: "Inventário", icon: "bi-box-seam" },
  { id: "orders", label: "Encomendas", icon: "bi-receipt" },
  { id: "business", label: "Relatórios", icon: "bi-graph-up-arrow" }
];

const firstName = (name = "") => name.trim().split(" ")[0] || "Conta";

export default function StoreHeader({
  activeArea,
  activeView,
  apiStatus,
  authUser,
  cartCount,
  onChangeView,
  onLogout,
  onOpenAuth,
  searchTerm = "",
  setSearchTerm = () => {},
  workspace
}) {
  const isBackoffice = activeArea === "backoffice";
  const isAdmin = authUser?.role === "admin";
  const searchPlaceholder = isBackoffice
    ? "Pesquisar no catálogo e voltar à loja"
    : "O que procura? Ex: guitarra, Focusrite, bateria";

  return (
    <header className={isBackoffice ? "store-header backoffice-header" : "store-header"}>
      <div className="top-service-bar">
        <span>
          <i className="bi bi-truck" aria-hidden="true" /> Envio grátis desde 250 EUR
        </span>
        <span>
          <i className="bi bi-shield-check" aria-hidden="true" /> Garantia e usados certificados
        </span>
        <span>
          <i className="bi bi-headset" aria-hidden="true" /> Apoio para escolas e músicos
        </span>
      </div>

      <div className="header-main-row">
        <button className="brand-block" onClick={() => onChangeView("shop")} type="button" aria-label="ClaveStore - voltar à loja">
          <span className="brand-logo-frame" aria-hidden="true">
            <img className="brand-logo-image" src="/assets/clavestore-logo.png" alt="" />
          </span>
        </button>

        <div className={isBackoffice ? "header-search header-search-muted" : "header-search"}>
          <i className="bi bi-search" aria-hidden="true" />
          <input
            aria-label="Pesquisar instrumentos e artigos musicais"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchPlaceholder}
            type="search"
            value={searchTerm}
          />
          <button className="search-button" onClick={() => onChangeView("shop")} type="button">
            {isBackoffice ? "Ver loja" : "Pesquisar"}
          </button>
        </div>

        <div className="header-tools">
          {isAdmin && (
            <div className="area-switcher" aria-label="Alternar entre loja e backoffice" role="group">
              <button className={!isBackoffice ? "active" : ""} onClick={() => onChangeView("shop")} type="button">
                <i className="bi bi-shop" aria-hidden="true" />
                <span>Loja</span>
              </button>
              <button className={isBackoffice ? "active" : ""} onClick={() => onChangeView("admin")} type="button">
                <i className="bi bi-shield-lock" aria-hidden="true" />
                <span>Backoffice</span>
              </button>
            </div>
          )}

          {authUser ? (
            <div className="session-pill" aria-label="Sessão ativa">
              <i className={authUser.role === "admin" ? "bi bi-shield-check" : "bi bi-person-check"} aria-hidden="true" />
              <span>
                {firstName(authUser.name)}
                <small>{authUser.role === "admin" ? "Admin" : "Cliente"}</small>
              </span>
              <button onClick={onLogout} type="button" aria-label="Terminar sessão">
                <i className="bi bi-box-arrow-right" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="auth-actions" aria-label="Entrar ou registar">
              <button onClick={() => onOpenAuth("client", "login")} type="button">
                Entrar
              </button>
              <button onClick={() => onOpenAuth("client", "register")} type="button">
                Registar
              </button>
            </div>
          )}

          {isBackoffice ? (
            <span className="api-pill">
              <i className="bi bi-database-check" aria-hidden="true" />
              {apiStatus}
            </span>
          ) : (
            <button
              className={activeView === "cart" ? "cart-shortcut active" : "cart-shortcut"}
              onClick={() => onChangeView("cart")}
              type="button"
              aria-label="Abrir carrinho"
            >
              <i className="bi bi-bag-check" aria-hidden="true" />
              <span>{cartCount}</span>
            </button>
          )}
        </div>
      </div>

      {isBackoffice && (
        <div className="audience-bar">
          <span className="menu-label">Backoffice</span>
          <nav className="header-nav backoffice-nav" aria-label="Navegação do backoffice">
            {backofficeNavigation.map((item) => (
              <button
                className={activeView === item.id ? "nav-action active" : "nav-action"}
                key={item.id}
                onClick={() => onChangeView(item.id)}
                type="button"
              >
                <i className={`bi ${item.icon}`} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
