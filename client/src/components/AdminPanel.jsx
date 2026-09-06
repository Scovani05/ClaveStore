import { useMemo, useState } from "react";

const defaultImage = "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80";

const initialDraft = {
  name: "",
  brand: "",
  category: "Guitarras",
  condition: "Novo",
  price: "",
  stock: "",
  reorderPoint: "2",
  sku: "",
  imageUrl: defaultImage,
  shortDescription: "",
  specs: ""
};

export default function AdminPanel({ categories, formatCurrency, onCreateProduct, onUpdateProduct, products, stats }) {
  const [draft, setDraft] = useState(initialDraft);
  const lowStock = useMemo(
    () => products.filter((product) => Number(product.stock || 0) <= Number(product.reorderPoint || 0)),
    [products]
  );

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onCreateProduct({
      ...draft,
      imageUrl: draft.imageUrl || defaultImage,
      sku: draft.sku || `CLV-${Date.now().toString().slice(-5)}`
    });
    setDraft(initialDraft);
  };

  return (
    <section className="admin-view" aria-label="Gestão da loja">
      <div className="view-heading">
        <span className="section-kicker">Backoffice</span>
        <h2>Stock, margem e catálogo</h2>
        <p>Adiciona produtos e ajusta stock como numa loja real ligada a PostgreSQL.</p>
      </div>

      <div className="admin-stats" aria-label="Resumo de gestão">
        <div>
          <span>Valor em stock</span>
          <strong>{formatCurrency(stats.stockValue)}</strong>
        </div>
        <div>
          <span>Produtos ativos</span>
          <strong>{stats.activeProducts}</strong>
        </div>
        <div>
          <span>Alertas</span>
          <strong>{stats.lowStock}</strong>
        </div>
        <div>
          <span>Ticket médio</span>
          <strong>{formatCurrency(stats.avgTicket)}</strong>
        </div>
      </div>

      <div className="admin-layout">
        <form className="product-form" onSubmit={submit}>
          <h3>Novo produto</h3>
          <div className="form-grid">
            <label>
              Nome
              <input className="form-control" onChange={(event) => updateDraft("name", event.target.value)} required value={draft.name} />
            </label>
            <label>
              Marca
              <input className="form-control" onChange={(event) => updateDraft("brand", event.target.value)} required value={draft.brand} />
            </label>
            <label>
              Categoria
              <select className="form-select" onChange={(event) => updateDraft("category", event.target.value)} value={draft.category}>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              Estado
              <select className="form-select" onChange={(event) => updateDraft("condition", event.target.value)} value={draft.condition}>
                <option>Novo</option>
                <option>Usado certificado</option>
                <option>Recondicionado</option>
              </select>
            </label>
            <label>
              Preço
              <input
                className="form-control"
                min="1"
                onChange={(event) => updateDraft("price", event.target.value)}
                required
                type="number"
                value={draft.price}
              />
            </label>
            <label>
              Stock
              <input
                className="form-control"
                min="0"
                onChange={(event) => updateDraft("stock", event.target.value)}
                required
                type="number"
                value={draft.stock}
              />
            </label>
            <label>
              SKU
              <input className="form-control" onChange={(event) => updateDraft("sku", event.target.value)} value={draft.sku} />
            </label>
            <label>
              Repor abaixo de
              <input
                className="form-control"
                min="0"
                onChange={(event) => updateDraft("reorderPoint", event.target.value)}
                type="number"
                value={draft.reorderPoint}
              />
            </label>
          </div>
          <label>
            Imagem
            <input className="form-control" onChange={(event) => updateDraft("imageUrl", event.target.value)} value={draft.imageUrl} />
          </label>
          <label>
            Descrição curta
            <textarea
              className="form-control"
              onChange={(event) => updateDraft("shortDescription", event.target.value)}
              required
              rows="3"
              value={draft.shortDescription}
            />
          </label>
          <label>
            Especificações separadas por vírgula
            <input className="form-control" onChange={(event) => updateDraft("specs", event.target.value)} value={draft.specs} />
          </label>
          <button className="btn btn-gold" type="submit">
            <i className="bi bi-plus-lg" aria-hidden="true" />
            <span>Adicionar produto</span>
          </button>
        </form>

        <div className="inventory-panel">
          <div className="inventory-heading">
            <h3>Inventário</h3>
            <span>{products.length} artigos</span>
          </div>
          <div className="low-stock-strip">
            <i className="bi bi-exclamation-triangle" aria-hidden="true" />
            {lowStock.length ? `${lowStock.length} produtos precisam de reposição` : "Stock saudável"}
          </div>
          <div className="inventory-table" role="table" aria-label="Inventário de produtos">
            {products.map((product) => (
              <div className="inventory-row" key={product.id} role="row">
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.sku} / {product.category}</span>
                </div>
                <span>{formatCurrency(product.price)}</span>
                <div className="stock-editor">
                  <button onClick={() => onUpdateProduct(product.id, { stock: Math.max(0, Number(product.stock || 0) - 1) })} type="button" aria-label="Reduzir stock">
                    <i className="bi bi-dash" aria-hidden="true" />
                  </button>
                  <strong>{product.stock}</strong>
                  <button onClick={() => onUpdateProduct(product.id, { stock: Number(product.stock || 0) + 1 })} type="button" aria-label="Aumentar stock">
                    <i className="bi bi-plus" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}