import React, { useState, useEffect } from 'react';
import { getProductImage, getFallbackImage } from '../utils/productImages';
import './ProductImage.css';

// Display dimensions per size (CSS handles responsive shrink). Setting width/height on the
// <img> reserves layout space → no CLS, and native lazy-loading avoids loading offscreen art.
const DIM = { small: 32, medium: 48, large: 80 };

const ProductImage = ({ productName, size = 'medium', className = '', showFallback = true }) => {
  const [src, setSrc] = useState(() => getProductImage(productName));
  const [usedFallback, setUsedFallback] = useState(false);
  const px = DIM[size] || DIM.medium;

  useEffect(() => {
    setSrc(getProductImage(productName));
    setUsedFallback(false);
  }, [productName]);

  const handleError = () => {
    if (!usedFallback && showFallback) {
      setUsedFallback(true);
      setSrc(getFallbackImage(productName));
    }
  };

  return (
    <img
      src={src}
      alt={productName}
      width={px}
      height={px}
      loading="lazy"
      decoding="async"
      onError={handleError}
      className={`product-image product-image-${size} ${className}`}
    />
  );
};

export default ProductImage;
