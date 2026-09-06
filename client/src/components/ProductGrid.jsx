import ProductGallery from "./ProductGallery.jsx";

export default function ProductGrid({ formatCurrency, onAddToCart, onOpenProduct, products, selectedCategory, setSortKey, sortKey }) {
  return (
    <section className="catalog-section" aria-label="Catálogo de produtos">
      <div className="catalog-heading-row">
        <div>
          <span className="section-kicker">Catálogo</span>
          <h2>{selectedCategory === "Todos" ? "Todos os instrumentos" : selectedCategory}</h2>
        </div>
        <div className="catalog-actions">
          <span>{products.length} resultados</span>
          <select
            aria-label="Ordenar produtos"
            className="form-select sort-select"
            onChange={(event) => setSortKey(event.target.value)}
            value={sortKey}
          >
            <option value="featured">Destaques primeiro</option>
            <option value="price-asc">Preço: baixo para alto</option>
            <option value="price-desc">Preço: alto para baixo</option>
            <option value="stock">Stock mais baixo</option>
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-vinyl" aria-hidden="true" />
          <strong>Nenhum produto encontrado</strong>
          <span>Experimenta outra pesquisa ou categoria.</span>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => {
            const roundedRating = Math.round(Number(product.rating || 0));

            return (
              <article className="product-card" key={product.id}>
                <ProductGallery product={product} />
                <div className="product-body">
                  <div className="product-meta-row">
                    <span>{product.sku}</span>
                    <span>{product.condition}</span>
                  </div>
                  <h3>{product.name}</h3>
                  <p>{product.shortDescription}</p>
                  <div className="rating-row">
                    <span className="rating-stars" aria-label={`Avaliação ${product.rating} em 5`}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <i className={index < roundedRating ? "bi bi-star-fill" : "bi bi-star"} aria-hidden="true" key={index} />
                      ))}
                      <strong>{product.rating}</strong>
                    </span>
                    <span>{product.reviews} avaliações</span>
                  </div>
                  <div className="availability-row">
                    <span className={product.stock <= product.reorderPoint ? "stock-pill low" : "stock-pill"}>
                      <i className="bi bi-circle-fill" aria-hidden="true" />
                      {product.stock > 0 ? "Disponível" : "Sem stock"}
                    </span>
                    <span>{product.stock} un.</span>
                  </div>
                  <div className="spec-row">
                    {(product.specs || []).slice(0, 3).map((spec) => (
                      <span key={spec}>{spec}</span>
                    ))}
                  </div>
                  <div className="product-footer">
                    <div className="price-block">
                      {Number(product.compareAtPrice || 0) > Number(product.price || 0) && <del>{formatCurrency(product.compareAtPrice)}</del>}
                      <strong>{formatCurrency(product.price)}</strong>
                    </div>
                    <div className="product-actions">
                      <button className="btn btn-details" onClick={() => onOpenProduct(product)} type="button">
                        <i className="bi bi-info-circle" aria-hidden="true" />
                        <span>Detalhes</span>
                      </button>
                      <button className="btn btn-cart" disabled={product.stock <= 0} onClick={() => onAddToCart(product)} type="button">
                        <i className="bi bi-cart-plus" aria-hidden="true" />
                        <span>{product.stock <= 0 ? "Indisponível" : "Comprar"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}