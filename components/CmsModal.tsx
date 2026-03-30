import { PropsWithChildren } from "react";

interface CmsModalProps extends PropsWithChildren {
  open: boolean;
  title: string;
  onClose: () => void;
}

export default function CmsModal({ open, title, onClose, children }: CmsModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="cms-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="cms-modal-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="cms-modal-header">
          <h3 className="cms-modal-title">{title}</h3>
          <button type="button" className="cms-modal-close" onClick={onClose}>
            <i className="bi-x-lg"></i>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
