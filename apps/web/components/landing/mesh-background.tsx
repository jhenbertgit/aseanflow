"use client";

export function MeshBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-25%",
          right: "-25%",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.4), transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "33%",
          left: "50%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(16,185,129,0.2), transparent 70%)",
        }}
      />
    </div>
  );
}
