"use client";

export default function ExpertBuildsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(243,244,246,1) 100%)",
        padding: "32px 20px 48px",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <section
          style={{
            background: "#111827",
            color: "#ffffff",
            borderRadius: 28,
            padding: 28,
            boxShadow: "0 20px 40px rgba(17,24,39,0.18)",
            marginBottom: 24,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 1.4,
              color: "#9ca3af",
            }}
          >
            Accessorise It
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              margin: "8px 0 10px",
              flexWrap: "wrap",
            }}
          >
            <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.1 }}>
              Expert Builds
            </h1>

            <button
              onClick={() => (window.location.href = "/")}
              style={{
                background: "transparent",
                color: "#9ca3af",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              ← Home
            </button>
          </div>

          <p
            style={{
              margin: 0,
              maxWidth: 760,
              color: "#d1d5db",
              lineHeight: 1.6,
              fontSize: 15,
            }}
          >
            Explore premium expert motorcycle builds with a featured bike image,
            fitted accessories, and inspiration for your own setup.
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 0.9fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              padding: 20,
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
  style={{
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
    background: "#f3f4f6",
  }}
>
  <img
    src="/yamaha-tenere-700.jpg"
    alt="Expert build bike"
    style={{
      width: "100%",
      height: 520,
      objectFit: "cover",
      display: "block",
    }}
  />

  <div
    style={{
      position: "absolute",
      top: "60%",
      left: "65%",
      width: 16,
      height: 16,
      background: "#ef4444",
      borderRadius: "50%",
      cursor: "pointer",
      transform: "translate(-50%, -50%)",
      boxShadow: "0 0 0 4px rgba(239,68,68,0.3)",
    }}
  />
</div>
          </div>

          <div
            style={{
  background: "#0b0f14",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#ffffff",
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
              Featured Build
            </p>

            <h2 style={{ margin: "10px 0 8px", fontSize: 28 }}>
              Yamaha Tenere 700 Adventure Build
            </h2>

            <p
              style={{
                marginTop: 0,
                color: "#4b5563",
                lineHeight: 1.6,
                fontSize: 14,
              }}
            >
              A sample expert build page layout with the bike on the left and the
              selected accessories on the right.
            </p>

            <div
              style={{
                display: "grid",
                gap: 12,
                marginTop: 18,
              }}
            >
              {[
  {
    name: "Upgraded rear shock",
    note: "Improves load handling and off-road control.",
    image: "/accessories/shock.jpg",
  },
  {
    name: "Fork upgrade",
    note: "Better front-end damping and rough terrain stability.",
    image: "/accessories/forks.jpg",
  },
  {
    name: "Handguards",
    note: "Adds protection for hands and levers.",
    image: "/accessories/handguards.jpg",
  },
  {
    name: "Exhaust",
    note: "Lighter setup with stronger performance.",
    image: "/accessories/exhaust.jpg",
  },
  {
    name: "Air filter + pre-filter",
    note: "Improves airflow and dust protection.",
    image: "/accessories/filter.jpg",
  },
  {
    name: "Navigation mount",
    note: "Clean cockpit setup for touring.",
    image: "/accessories/nav.jpg",
  },
].map((item) => (
  <div
    key={item.name}
    style={{
      display: "flex",
      gap: 12,
      borderRadius: 14,
      padding: 12,
      background: "#111827",
      border: "1px solid rgba(255,255,255,0.08)",
      alignItems: "center",
    }}
  >
    <img
      src={item.image}
      alt={item.name}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = "/placeholder-new.jpg";
      }}
      style={{
        width: 60,
        height: 60,
        objectFit: "cover",
        borderRadius: 10,
        background: "#1f2937",
        flexShrink: 0,
      }}
    />

    <div>
      <div style={{ fontWeight: 700 }}>{item.name}</div>
      <div
        style={{
          fontSize: 13,
          color: "#9ca3af",
          marginTop: 4,
        }}
      >
        {item.note}
      </div>
    </div>
  </div>
))}
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 20,
                flexWrap: "wrap",
              }}
            >
              <button
                style={{
                  padding: "12px 18px",
                  borderRadius: 14,
                  border: "none",
                  background: "#111827",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Save Build
              </button>

              <button
                style={{
                  padding: "12px 18px",
                  borderRadius: 14,
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  color: "#111827",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Compare to My Bike
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}