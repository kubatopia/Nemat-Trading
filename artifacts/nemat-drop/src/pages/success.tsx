export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">✓</div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-3">Order Confirmed</h1>
        <p className="text-gray-400 mb-8">
          Your payment was successful. You'll receive a confirmation email shortly.
        </p>
        <a
          href="/"
          className="inline-block rounded bg-cyan-400 px-8 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black hover:bg-cyan-300 transition-colors"
        >
          Back to Shop
        </a>
      </div>
    </main>
  );
}
