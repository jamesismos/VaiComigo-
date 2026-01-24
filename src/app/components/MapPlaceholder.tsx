export function MapPlaceholder() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center relative overflow-hidden">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(236, 236, 236, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(236, 236, 236, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Route line */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 50 150 Q 150 50, 250 150 T 450 250"
          stroke="#0F5F4A"
          strokeWidth="4"
          fill="none"
          strokeDasharray="10,5"
          opacity="0.6"
        />
      </svg>

      {/* Location markers */}
      <div className="absolute top-20 left-12 w-6 h-6 bg-primary rounded-full border-4 border-primary-foreground shadow-lg animate-pulse" />
      <div className="absolute bottom-24 right-16 w-6 h-6 bg-primary rounded-full border-4 border-primary-foreground shadow-lg" />

      <p className="text-muted-foreground z-10">Mapa da Rota</p>
    </div>
  );
}
