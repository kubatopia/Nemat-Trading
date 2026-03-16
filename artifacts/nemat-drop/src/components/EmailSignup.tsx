
import { useState } from "react";

export default function EmailSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section className="py-16 border-t border-white/5">
      <div className="max-w-xl">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 block mb-2">Alerts</span>
        <h2 className="text-2xl font-semibold text-white tracking-wide mb-2">Never Miss a Drop</h2>
        <p className="text-sm text-gray-500 mb-8">
          Get notified when the next sealed deal goes live.
        </p>

        {submitted ? (
          <div className="flex items-center gap-3 text-sm text-cyan-400">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            You're on the list. We'll reach out before the next drop.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 bg-white/[0.03] border border-white/10 border-r-0 rounded-l px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-cyan-400 text-black text-xs font-bold uppercase tracking-[0.2em] rounded-r hover:bg-cyan-300 active:bg-cyan-500 transition-colors"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
