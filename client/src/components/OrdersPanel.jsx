const statusOptions = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

const formatDate = (date) =>
  new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));

export default function OrdersPanel({ formatCurrency, onUpdateStatus, orders, statusLabels }) {
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <section className="orders-view" aria-label="Encomendas">
      <div className="view-heading">
        <span className="section-kicker">Operacao</span>
        <h2>Encomendas recentes</h2>
        <p>Segue pagamentos, preparação, envio e entregas sem sair do painel.</p>
      </div>

      <div className="order-list">
        {sortedOrders.map((order) => (
          <article className="order-row" key={order.id}>
            <div className="order-main">
              <span className="order-id">#{order.id}</span>
              <strong>{order.customerName}</strong>
              <span>{order.city} / {formatDate(order.createdAt)}</span>
            </div>
            <div className="order-items">
              {(order.items || []).map((item) => (
                <span key={`${order.id}-${item.productId}-${item.name}`}>
                  {item.quantity}x {item.name}
                </span>
              ))}
            </div>
            <div className="order-actions">
              <strong>{formatCurrency(order.total)}</strong>
              <select
                aria-label={`Estado da encomenda ${order.id}`}
                className="form-select status-select"
                onChange={(event) => onUpdateStatus(order.id, event.target.value)}
                value={order.status}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}