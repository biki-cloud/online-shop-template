"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  src: string | null;
  alt: string;
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  priority = false,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative aspect-square">
      <Image
        src={!imageError && src ? src : "/images/product-placeholder.jpg"}
        alt={alt}
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
        onError={() => setImageError(true)}
        priority={priority}
      />
    </div>
  );
}
