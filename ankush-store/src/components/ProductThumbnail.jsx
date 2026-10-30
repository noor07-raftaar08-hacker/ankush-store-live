import React from 'react';

export default function ProductThumbnail({
  src,
  alt = "Product",
  className = "w-12 h-12",
  textClassName = "text-2xl",
  rounded = "rounded-2xl"
}) {
  const raw = String(src || '').trim();
  const isImageUri =
    raw.startsWith('data:image') ||
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('/') ||
    raw.startsWith('blob:');

  if (isImageUri) {
    return (
      <img
        src={raw}
        alt={alt}
        className={`${className} ${rounded} object-contain bg-white shrink-0 select-none`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.style.display = 'none';
          if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'inline-flex';
          }
        }}
      />
    );
  }

  const safeEmoji = raw.length > 12 || raw.length === 0 ? '🛍️' : raw;

  return (
    <span className={`${textClassName} select-none shrink-0 inline-flex items-center justify-center`}>
      {safeEmoji}
    </span>
  );
}
