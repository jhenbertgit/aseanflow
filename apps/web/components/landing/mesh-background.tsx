"use client";

export function MeshBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute -top-1/4 -right-1/4 h-[800px] w-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(16,185,129,0.08), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-1/4 -left-1/4 h-[700px] w-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(251,191,36,0.06), transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)",
        }}
      />
    </div>
  );
}
