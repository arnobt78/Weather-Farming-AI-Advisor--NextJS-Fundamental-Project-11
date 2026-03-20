type BackgroundPreloadProps = {
  imageUrl: string | null;
};

/**
 * Adds an early preload hint so the first background image is fetched sooner.
 */
export function BackgroundPreload({ imageUrl }: BackgroundPreloadProps) {
  if (!imageUrl) return null;
  return (
    <link
      rel="preload"
      as="image"
      href={imageUrl}
      fetchPriority="high"
      crossOrigin="anonymous"
    />
  );
}
