import { useEffect, useMemo, useState } from "react";

export default function ProductDetailsModal({ formatCurrency, onAddToCart, onClose, product }) {
  const gallery = useMemo(() => {
    if (!product) {
      return [];
    }

    return product.gallery?.length ? product.gallery : [product.imageUrl].filter(Boolean);
  }, [product]);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    setSelectedImage(gallery[0] || "");
  }, [gallery]);

  useEffect(() => {
    if (!product) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, product]);

  if (!product) {
    return null;
  }

  const comments = product.comments || [];
  const specs = product.specs || [];

  return (
    <div className="product-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <article aria-labelledby="product-modal-title" aria-modal="true" className="product-modal" role="dialog">
        <button aria-label="Fechar detalhes" className="modal-close" onClick={onClose} type="button">
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>

        <div className="product-modal-media">
          <div className="modal-main-image">
            <img alt={product.name} src={selectedImage || product.imageUrl} />
            <span>{product.badge}</span>
          </div>
          {gallery.length > 1 && (
            <div className="modal-thumbs" aria-label="Galeria do produto">
              {gallery.map((image, index) => (
                <button
                  aria-label={`Ver imagem ${index + 1}`}
                  className={selectedImage === image ? "active" : ""}
                  key={`${product.id}-${image}`}
                  onClick={() => setSelectedImage(image)}
                  type="button"
                >
                  <img alt="" src={image} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-modal-info">
          <div className="modal-meta-row">
            <span>{product.sku}</span>
            <span>{product.condition}</span>
          </div>
          <h2 id="product-modal-title">{product.name}</h2>
          <p>{product.shortDescription}</p>

          <div className="modal-rating-row">
            <span>
              <i className="bi bi-star-fill" aria-hidden="true" />
              {product.rating}
            </span>
            <span>{product.reviews} avaliações</span>
          </div>

          <div className="modal-buy-row">
            <div>
              {Number(product.compareAtPrice || 0) > Number(product.price || 0) && <del>{formatCurrency(product.compareAtPrice)}</del>}
              <strong>{formatCurrency(product.price)}</strong>
            </div>
            <button className="btn btn-cart" disabled={product.stock <= 0} onClick={() => onAddToCart(product)} type="button">
              <i className="bi bi-cart-plus" aria-hidden="true" />
              <span>{product.stock <= 0 ? "Indisponível" : "Adicionar"}</span>
            </button>
          </div>

          <div className="modal-stock-line">
            <span className={product.stock <= product.reorderPoint ? "stock-pill low" : "stock-pill"}>
              <i className="bi bi-circle-fill" aria-hidden="true" />
              {product.stock > 0 ? `${product.stock} unidades em stock` : "Sem stock"}
            </span>
          </div>

          <section className="modal-section" aria-label="Ficha técnica">
            <h3>Ficha técnica</h3>
            <div className="modal-spec-list">
              {specs.length ? specs.map((spec) => <span key={spec}>{spec}</span>) : <span>Sem especificações registadas.</span>}
            </div>
          </section>

          <section className="modal-section" aria-label="Comentários de clientes">
            <h3>Comentários</h3>
            <div className="modal-review-list">
              {comments.length ? (
                comments.slice(0, 3).map((comment) => (
                  <blockquote key={`${comment.author}-${comment.title}`}>
                    <strong>{comment.title}</strong>
                    <p>{comment.body}</p>
                    <span>
                      {comment.author}, {comment.city} - {comment.rating}/5
                    </span>
                  </blockquote>
                ))
              ) : (
                <p>Ainda não existem comentários para este produto.</p>
              )}
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}