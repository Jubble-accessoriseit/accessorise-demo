"use client";

type Bike = {
  make: string;
  model: string;
  year: number;
  variant?: string | null;
};

type Props = {
  currentBike: Bike | null;
  heroImage: string;
  compatibleCount: number;
};

export default function BikeSummary({
  currentBike,
  heroImage,
  compatibleCount,
}: Props) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 20,
        padding: 22,
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          color: "#6b7280",
        }}
      >
        Bike Summary
      </p>

      <h2 style={{ margin: "10px 0 8px", fontSize: 28 }}>
        My Motorcycle
      </h2>

      <p
        style={{
          marginTop: 0,
          color: "#4b5563",
          lineHeight: 1.6,
          fontSize: 14,
        }}
      >
        Products are matched against the selected bike and your uploaded build
        photos become the hero image automatically.
      </p>

      <div
        style={{
          marginTop: 18,
          height: 220,
          borderRadius: 18,
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#f3f4f6",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        <Info label="Make" value={currentBike?.make || ""} />
        <Info label="Series" value={currentBike?.model || ""} />
        <Info label="Model" value={currentBike?.variant || "Base"} />
        <Info label="Year" value={currentBike ? String(currentBike.year) : ""} />
        <Info label="Compatible" value={`${compatibleCount} items`} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}