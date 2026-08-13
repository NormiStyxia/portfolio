import { useEffect, useState } from 'react';

export function MediaFigure({ media, className = '' }) {
  const initialState = media.type === 'diagram' || !media.src ? 'ready' : 'loading';
  const [mediaState, setMediaState] = useState(initialState);
  const style = {
    aspectRatio: media.aspectRatio,
    '--media-width': media.width,
    '--media-height': media.height,
  };

  useEffect(() => {
    setMediaState(media.type === 'diagram' || !media.src ? 'ready' : 'loading');

    if (media.type !== 'video' || !media.poster) return undefined;

    let active = true;
    const poster = new Image();
    poster.decoding = 'async';
    poster.onload = async () => {
      try {
        await poster.decode();
      } catch {
        // A decoded poster is preferred, but a loaded poster is still stable to reveal.
      }
      if (active) setMediaState('ready');
    };
    poster.src = media.poster;

    return () => {
      active = false;
    };
  }, [media.poster, media.src, media.type]);

  const handleImageLoad = async (event) => {
    try {
      await event.currentTarget.decode();
    } catch {
      // The image can still be shown after its load event.
    }
    setMediaState('ready');
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
          onLoad={handleImageLoad}
          onError={() => setMediaState('error')}
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
          onLoadedMetadata={() => setMediaState('ready')}
          onError={() => {
            if (!media.poster) setMediaState('error');
          }}
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
    <figure className={`media-figure media-${mediaState} ${className}`} data-media-state={mediaState}>
      <div className="media-figure__frame" style={style}>
        <div className="media-figure__content">{content}</div>
        <span className="media-figure__status" aria-hidden="true">
          {mediaState === 'error' ? 'MEDIA / UNAVAILABLE' : 'MEDIA / LOADING'}
        </span>
        <span className="media-reveal-bars" aria-hidden="true"><i /><i /><i /></span>
      </div>
      {media.caption ? <figcaption>{media.caption}</figcaption> : null}
    </figure>
  );
}
