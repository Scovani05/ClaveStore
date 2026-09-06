export default function BusinessPanel({ formatCurrency, insight, pricing, stats, workspace }) {
  const ideas = insight?.ideas || [];
  const indicators = [
    { label: "Produtos ativos", value: stats.activeProducts },
    { label: "Encomendas pendentes", value: stats.pendingOrders },
    { label: "Alertas de stock", value: stats.lowStock },
    { label: "Ticket médio", value: formatCurrency(stats.avgTicket) }
  ];

  return (
    <section className="business-view" aria-label="Relatórios da loja">
      <div className="view-heading">
        <span className="section-kicker">Relatórios</span>
        <h2>Resumo de vendas e stock</h2>
        <p>
          Consulta os principais números da {workspace.storeName} e decide que produtos devem ser repostos, destacados ou vendidos em pack.
        </p>
      </div>

      <div className="business-grid">
        <article className="business-summary">
          <span className="section-kicker">Leitura rápida</span>
          <h3>{insight?.title || "Packs e usados com boa margem"}</h3>
          <p>{insight?.tip || "Começa pelos bundles para iniciantes, escolas de música e usados certificados."}</p>
          <div className="signal-box">
            <i className="bi bi-broadcast" aria-hidden="true" />
            <span>{insight?.externalSignal || "Dados externos indisponíveis neste momento."}</span>
          </div>
          <div className="kpi-line">
            <div>
              <span>Receita registada</span>
              <strong>{formatCurrency(stats.revenue)}</strong>
            </div>
            <div>
              <span>Unidades vendidas</span>
              <strong>{stats.unitsSold}</strong>
            </div>
            <div>
              <span>Conversão</span>
              <strong>{stats.conversionRate}%</strong>
            </div>
          </div>
        </article>

        <article className="stack-panel report-panel">
          <span className="section-kicker">Estado atual</span>
          <div className="report-list">
            {indicators.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="pricing-grid">
        {pricing.map((item) => (
          <article className="pricing-card" key={item.name}>
            <span>{item.name}</span>
            <strong>{item.price}</strong>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <div className="playbook-list">
        {ideas.map((idea) => (
          <div className="playbook-item" key={idea}>
            <i className="bi bi-check2-circle" aria-hidden="true" />
            <span>{idea}</span>
          </div>
        ))}
      </div>
    </section>
  );
}