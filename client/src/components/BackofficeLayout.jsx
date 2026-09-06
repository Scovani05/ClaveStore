const backofficeMenu = [
  { id: "admin", label: "Inventário", detail: "Produtos, stock e preços", icon: "bi-box-seam" },
  { id: "orders", label: "Encomendas", detail: "Pagamentos e envios", icon: "bi-receipt" },
  { id: "business", label: "Relatórios", detail: "Vendas e stock", icon: "bi-graph-up-arrow" }
];

export default function BackofficeLayout({ activeView, apiStatus, children, formatCurrency, stats }) {
  const currentSection = backofficeMenu.find((item) => item.id === activeView) || backofficeMenu[0];

  return (
    <section className="backoffice-shell" aria-label="Backoffice ClaveStore">
      <div className="backoffice-overview">
        <div className="backoffice-title">
          <span className="section-kicker">Backoffice</span>
          <h2>{currentSection.label}</h2>
          <p>{currentSection.detail} da ClaveStore PT.</p>
        </div>

        <div className="backoffice-summary" aria-label="Resumo rápido">
          <div>
            <span>Receita</span>
            <strong>{formatCurrency(stats.revenue)}</strong>
          </div>
          <div>
            <span>Produtos</span>
            <strong>{stats.products}</strong>
          </div>
          <div>
            <span>Alertas</span>
            <strong>{stats.lowStock}</strong>
          </div>
        </div>

        <span className="backoffice-status">
          <i className="bi bi-database-check" aria-hidden="true" />
          {apiStatus}
        </span>
      </div>

      <div className="backoffice-content">{children}</div>
    </section>
  );
}