export function MediaFigure({ media, className = '' }) {
  const style = {
    aspectRatio: media.aspectRatio,
    '--media-width': media.width,
    '--media-height': media.height,
  };

  const content = (() => {
    if (media.type === 'image' && media.src) {
      return (
        <img
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading={media.load === 'eager' ? 'eager' : 'lazy'}
          fetchPriority={media.load === 'eager' ? 'high' : 'auto'}
          decoding="async"
        />
      );
    }

    if (media.type === 'video' && media.src) {
      return (
        <video
          aria-label={media.alt}
          poster={media.poster}
          controls
          playsInline
          preload={media.load === 'interaction' ? 'none' : 'metadata'}
          width={media.width}
          height={media.height}
        >
          <source src={media.src} type="video/mp4" />
        </video>
      );
    }

    return (
      <div className={`media-placeholder media-placeholder--${media.tone || 'neutral'}`} role="img" aria-label={media.alt}>
        <span className="media-placeholder__index" aria-hidden="true">
          {media.tone === 'newton' ? '01' : media.tone === 'anchor' ? '02' : '03'}
        </span>
        <div className="media-placeholder__copy">
          <span className="media-placeholder__title">{media.placeholder}</span>
          <span>{media.width} × {media.height}</span>
        </div>
        <span className="media-placeholder__axis media-placeholder__axis--x" aria-hidden="true" />
        <span className="media-placeholder__axis media-placeholder__axis--y" aria-hidden="true" />
      </div>
    );
  })();

  return (
    <figure className={`media-figure ${className}`}>
      <div className="media-figure__frame" style={style}>
        {content}
      </div>
      {media.caption ? <figcaption>{media.caption}</figcaption> : null}
    </figure>
  );
}
