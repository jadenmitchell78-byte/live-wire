export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white px-4 sm:px-8 pt-24 space-y-8">
      <div className="h-[40vh] rounded-2xl bg-white/5 animate-pulse" />
      {[0, 1, 2].map((row) => (
        <div key={row} className="space-y-3">
          <div className="h-5 w-48 rounded bg-white/10 animate-pulse" />
          <div className="flex gap-3 overflow-hidden">
            {[0, 1, 2, 3, 4, 5].map((c) => (
              <div key={c} className="w-[240px] h-52 shrink-0 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
