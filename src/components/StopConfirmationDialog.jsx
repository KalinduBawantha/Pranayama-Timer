import { useEffect, useRef } from 'react';

export default function StopConfirmationDialog({ onContinue, onStop }) {
  const dialogRef = useRef(null);
  const continueRef = useRef(null);

  // Focus trap and keyboard handling
  useEffect(() => {
    continueRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onContinue();
      }

      // Trap focus within dialog
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll('button');
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onContinue]);

  // Clicking overlay closes dialog (continue session)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onContinue();
    }
  };

  return (
    <div
      className="dialog-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stop-dialog-title"
      aria-describedby="stop-dialog-message"
    >
      <div className="dialog" ref={dialogRef}>
        <h2 className="dialog-title" id="stop-dialog-title">End this session?</h2>
        <p className="dialog-message" id="stop-dialog-message">
          Your current progress will be saved in the session summary.
        </p>
        <div className="dialog-actions">
          <button
            id="dialog-continue-btn"
            className="control-btn control-btn-primary"
            onClick={onContinue}
            ref={continueRef}
            type="button"
          >
            Continue
          </button>
          <button
            id="dialog-stop-btn"
            className="control-btn control-btn-danger"
            onClick={onStop}
            type="button"
          >
            Stop Session
          </button>
        </div>
      </div>
    </div>
  );
}
