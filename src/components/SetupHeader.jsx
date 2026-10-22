import { Wind } from 'lucide-react';

export default function SetupHeader() {
  return (
    <header className="setup-header">
      <div className="setup-logo" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="#E6F2E9" stroke="#36785C" strokeWidth="2" />
          <circle cx="32" cy="32" r="16" fill="#DCEFE3" stroke="#36785C" strokeWidth="1.5" opacity="0.7" />
          <circle cx="32" cy="32" r="6" fill="#36785C" opacity="0.5" />
        </svg>
      </div>
      <h1 className="setup-title">BreatheFlow</h1>
      <p className="setup-subtitle">Your Personal Breathing Timer</p>
    </header>
  );
}
