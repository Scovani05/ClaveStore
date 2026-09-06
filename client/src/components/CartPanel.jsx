import { useEffect, useState } from "react";

const initialCustomer = {
  customerName: "",
  email: "",
  city: "",
  paymentMethod: "MB Way"
};

export default function CartPanel({ authUser, cartItems, cartTotals, formatCurrency, onCheckout, onQuantityChange, onRequireAuth, showHeading = true, workspace }) {
  const [customer, setCustomer] = useState(initialCustomer);
  const canCheckout = authUser?.role === "client";

  useEffect(() => {
    if (!authUser) {
      setCustomer(initialCustomer);
      return;
    }

    setCustomer({
      customerName: authUser.name || "",
      email: authUser.email || "",
      city: authUser.city || "",
      paymentMethod: "MB Way"
    });
  }, [authUser]);

  const updateCustomer = (field, value) => {
    setCustomer((current) => ({ ...current, [field]: value }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (!canCheckout) {
      onRequireAuth();
      return;
    }

    onCheckout({
      ...customer,
      userId: authUser.id,
      customerName: authUser.name || customer.customerName,
      email: authUser.email || customer.email
    });
  };

  return (
    <aside className="cart-panel" aria-label="Carrinho e checkout">
      {showHeading && (
        <div className="panel-heading">
          <span className="section-kicker">Checkout</span>
          <h2>Carrinho</h2>
        </div>
      )}
      <div className={canCheckout ? "cart-session-note" : "cart-session-note locked"}>
        <i className={canCheckout ? "bi bi-person-check" : "bi bi-lock"} aria-hidden="true" />
        <span>
          {canCheckout
            ? `Sessão de ${authUser.name}. O carrinho fica guardado para a próxima visita.`
            : "Entra como cliente para recuperar o carrinho e finalizar a compra."}
        </span>
        {!canCheckout && (
          <button onClick={onRequireAuth} type="button">
            Entrar
          </button>
        )}
      </div>

      <div className="cart-items">
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <i className="bi bi-bag" aria-hidden="true" />
            <strong>O carrinho está vazio</strong>
            <span>Escolhe um instrumento para começar.</span>
          </div>
        ) : (
          cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <img alt="" src={item.imageUrl} />
              <div>
                <strong>{item.name}</strong>
                <span>{formatCurrency(item.price)}</span>
                <div className="quantity-control" aria-label={`Quantidade de ${item.name}`}>
                  <button onClick={() => onQuantityChange(item.id, item.quantity - 1)} type="button" aria-label="Diminuir quantidade">
                    <i className="bi bi-dash" aria-hidden="true" />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onQuantityChange(item.id, item.quantity + 1)} type="button" aria-label="Aumentar quantidade">
                    <i className="bi bi-plus" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="totals-block">
        <div>
          <span>Subtotal</span>
          <strong>{formatCurrency(cartTotals.subtotal)}</strong>
        </div>
        <div>
          <span>Envio</span>
          <strong>{cartTotals.shipping === 0 ? "Grátis" : formatCurrency(cartTotals.shipping)}</strong>
        </div>
        <div>
          <span>IVA incluído</span>
          <strong>{formatCurrency(cartTotals.tax)}</strong>
        </div>
        <div className="total-row">
          <span>Total</span>
          <strong>{formatCurrency(cartTotals.total)}</strong>
        </div>
      </div>

      <div className="shipping-note">
        <i className="bi bi-truck" aria-hidden="true" />
        Envio grátis a partir de {formatCurrency(workspace.freeShippingThreshold)}.
      </div>

      <form className="checkout-form" onSubmit={submit}>
        <label>
          Nome
          <input
            className="form-control"
            disabled={!canCheckout}
            onChange={(event) => updateCustomer("customerName", event.target.value)}
            required
            type="text"
            value={customer.customerName}
          />
        </label>
        <label>
          Email
          <input
            className="form-control"
            disabled={!canCheckout}
            onChange={(event) => updateCustomer("email", event.target.value)}
            required
            type="email"
            value={customer.email}
          />
        </label>
        <label>
          Cidade
          <input
            className="form-control"
            disabled={!canCheckout}
            onChange={(event) => updateCustomer("city", event.target.value)}
            required
            type="text"
            value={customer.city}
          />
        </label>
        <label>
          Pagamento
          <select
            className="form-select"
            disabled={!canCheckout}
            onChange={(event) => updateCustomer("paymentMethod", event.target.value)}
            value={customer.paymentMethod}
          >
            <option>MB Way</option>
            <option>Cartão</option>
            <option>Transferência</option>
          </select>
        </label>
        <button className="btn btn-gold w-100" disabled={cartItems.length === 0} type="submit">
          <i className="bi bi-lock" aria-hidden="true" />
          <span>{canCheckout ? "Finalizar encomenda" : "Login necessário"}</span>
        </button>
      </form>
    </aside>
  );
}