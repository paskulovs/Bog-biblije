import { getVideoWatchUrl } from "../lib/content-routes";
import { Video } from "../lib/types";

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const videoUrl = getVideoWatchUrl(video);

  return (
    <article className="content-card content-card-video">
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="content-card-media content-card-media-link"
      >
        <img src={video.imageUrl} alt={video.title} className="content-card-image" />
        <span className="video-card-play">
          <i className="bi-play-fill"></i>
        </span>
      </a>

      <div className="content-card-body">
        <span className="content-card-tag">{video.isYouTube ? "YouTube" : "Video"}</span>
        <p className="content-card-meta">
          {new Date(video.createdAt).toLocaleDateString("sr-RS")}
        </p>
        <h3 className="content-card-title">{video.title}</h3>

        <div className="content-card-actions">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn custom-btn custom-border-btn"
          >
            Pogledaj
          </a>
        </div>
      </div>
    </article>
  );
}
