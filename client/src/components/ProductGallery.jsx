import { useEffect, useState } from "react";

export default function ProductGallery({ product }) {
  const gallery = product.gallery?.length ? product.gallery : [product.imageUrl];
  const [selectedImage, setSelectedImage] = useState(gallery[0]);

  useEffect(() => {
    setSelectedImage(gallery[0]);
  }, [gallery[0]]);

  return (
    <div className="product-gallery">
      <div className="product-image-wrap">
        <img alt={product.name} className="product-image" loading="lazy" src={selectedImage} />
        <span className="product-badge">{product.badge}</span>
        {gallery.length > 1 && (
          <span className="gallery-count">
            <i className="bi bi-images" aria-hidden="true" />
            {gallery.length}
          </span>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="gallery-thumbs" aria-label={`Fotos de ${product.name}`}>
          {gallery.slice(0, 4).map((image, index) => (
            <button
              aria-label={`Ver foto ${index + 1} de ${product.name}`}
              className={selectedImage === image ? "active" : ""}
              key={`${product.id}-${image}`}
              onClick={() => setSelectedImage(image)}
              type="button"
            >
              <img alt="" loading="lazy" src={image} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
