import Link from "next/link";
import { HomeAuthCtas } from "./components/HomeAuthCtas";

const workflowSteps = [
  {
    id: "Bike",
    number: "01",
    title: "Choose Bike",
    description:
      "Start with the right bike so every recommendation feels relevant from the first click.",
    action: "Choose Bike",
  },
  {
    id: "Build",
    number: "02",
    title: "Build",
    description:
      "Shape your setup, compare options and keep a clear running total as you go.",
    action: "Start Building",
  },
  {
    id: "Expert",
    number: "03",
    title: "Compare Ideas",
    description:
      "Browse expert setups and compare them with your own build before you commit.",
    action: "Browse Expert Builds",
  },
  {
    id: "Save",
    number: "04",
    title: "Save and Buy",
    description:
      "Keep named builds for each bike, then move into buying with more confidence.",
    action: "Open Saved Builds",
  },
] as const;

const homeHighlights = [
  {
    title: "Bike-first fit",
    text: "Accessories, builds and buying stay tied to the bike you selected.",
  },
  {
    title: "Compare before you commit",
    text: "Use expert inspiration and side-by-side comparisons to make better choices.",
  },
  {
    title: "Save what works",
    text: "Keep multiple saved builds, photos and accessory setups for the same bike.",
  },
] as const;

const quickStartLinks = [
  { label: "Choose Bike", href: "/garage?step=Bike" },
  { label: "Build", href: "/garage?step=Build" },
  { label: "Expert Builds", href: "/garage?step=Expert" },
  { label: "Compare Builds", href: "/garage?step=Compare" },
  { label: "Saved Builds", href: "/garage?step=Save" },
  { label: "Buy Accessories", href: "/garage?step=Buy" },
] as const;

function stepHref(stepId: string) {
  return `/garage?step=${encodeURIComponent(stepId)}`;
}

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8fafc 0%, #eef2f7 22%, #f8fafc 100%)",
        color: "#111827",
      }}
    >
      <section
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e293b 100%)",
          color: "#ffffff",
          padding: "72px 20px 60px",
        }}
      >
        <div
          className="home-shell"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <div
            className="home-hero-topbar"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              marginBottom: 28,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.2,
              }}
            >
              Accessorise It
              <span style={{ opacity: 0.65 }}>|</span>
              Build with confidence
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Link href="/garage" style={secondaryHeroLinkStyle}>
                Open Garage
              </Link>
            </div>
          </div>

          <div
            className="home-hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.1fr) minmax(360px, 0.9fr)",
              gap: 28,
              alignItems: "stretch",
            }}
          >
            <div className="home-hero-copy">
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  opacity: 0.74,
                }}
              >
                Choose Bike to Buy Accessories
              </p>

              <h1
                className="home-hero-title"
                style={{
                  margin: "18px 0 16px",
                  fontSize: "clamp(2.35rem, 5vw, 3.5rem)",
                  lineHeight: 1.02,
                  maxWidth: 760,
                  letterSpacing: -1.2,
                }}
              >
                Plan, compare, save and buy accessories for your bike.
              </h1>

              <p
                className="home-hero-subtitle"
                style={{
                  margin: 0,
                  maxWidth: 720,
                  fontSize: "clamp(1rem, 1.8vw, 1.125rem)",
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                Build with confidence, save the setups you like, and shop with
                the right bike already in view.
              </p>

              <div
                className="home-hero-cta-row"
                style={{
                  marginTop: 30,
                }}
              >
                <HomeAuthCtas
                  primaryStyle={primaryHeroLinkStyle}
                  secondaryStyle={secondaryHeroLinkStyle}
                  supportingLinkStyle={heroSupportingLinkStyle}
                  signedInSupportingTextStyle={heroSignedInSupportStyle}
                />
              </div>

              <div
                className="home-hero-chip-row"
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 26,
                }}
              >
                {[
                  "Bike-specific accessory planning",
                  "Saved builds with photos",
                  "Expert build comparison",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="home-hero-visual"
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 28,
                border: "1px solid rgba(255,255,255,0.12)",
                padding: 20,
                boxShadow: "0 24px 60px rgba(2,6,23,0.28)",
                display: "grid",
                gap: 14,
                alignSelf: "stretch",
              }}
            >
              <div
                className="home-hero-image-frame"
                style={{
                  borderRadius: 22,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  minHeight: 260,
                }}
              >
                <img
                  src="https://exieufhwbrbeilmjltny.supabase.co/storage/v1/object/public/app-assets/home/home-hero-accessories-collage-v1.png"
                  alt="Accessory collage showing the Garage workflow across planning, saved builds and buying"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    minHeight: 260,
                    maxHeight: 360,
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              </div>

              <div className="home-hero-links-wrap" style={{ display: "grid", gap: 12 }}>
                <div
                  className="home-hero-links-header"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                        color: "rgba(255,255,255,0.65)",
                      }}
                    >
                      Quick access
                    </p>
                    <h2 style={{ margin: "8px 0 0", fontSize: 26 }}>
                      Jump into the part you need
                    </h2>
                  </div>

                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: "rgba(16,185,129,0.16)",
                      border: "1px solid rgba(52,211,153,0.28)",
                      color: "#bbf7d0",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    Garage
                  </div>
                </div>

                <div
                  className="home-quick-links-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 10,
                  }}
                >
                  {quickStartLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: 16,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#ffffff",
                        textDecoration: "none",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {item.label}
                      <span style={{ opacity: 0.55 }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "28px 20px 0",
        }}
      >
        <div
          className="home-highlights-grid"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 20,
            marginTop: -34,
          }}
        >
          {homeHighlights.map((item) => (
            <div
              key={item.title}
              style={{
                background: "#ffffff",
                borderRadius: 22,
                padding: 20,
                boxShadow: "0 14px 35px rgba(15,23,42,0.08)",
                border: "1px solid #e2e8f0",
              }}
            >
              <h2 style={{ margin: "0 0 8px", fontSize: 21 }}>{item.title}</h2>
              <p
                style={{
                  margin: 0,
                  color: "#475569",
                  lineHeight: 1.7,
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="workflow"
        style={{
          padding: "64px 20px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <div className="home-workflow-header" style={{ marginBottom: 26 }}>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                color: "#64748b",
              }}
              >
                How it works
              </p>
            <h2
              style={{
                margin: "10px 0 10px",
                fontSize: 40,
                letterSpacing: -0.8,
              }}
              >
              From first idea to finished setup
            </h2>
            <p
              style={{
                margin: 0,
                maxWidth: 880,
                color: "#475569",
                lineHeight: 1.75,
                fontSize: 16,
              }}
              >
              A simple way to choose the right bike, shape the build, compare
              ideas and buy with more confidence.
            </p>
          </div>

          <div
            className="home-workflow-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 20,
            }}
          >
            {workflowSteps.map((step) => (
              <div
                key={step.id}
                style={{
                  background: "#ffffff",
                  borderRadius: 22,
                  padding: 22,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 14px 35px rgba(15,23,42,0.06)",
                  display: "grid",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      color: "#94a3b8",
                      fontWeight: 800,
                    }}
                  >
                    Step {step.number}
                  </p>

                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#475569",
                    }}
                  >
                    Popular
                  </div>
                </div>

                <div>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontSize: 22,
                      letterSpacing: -0.4,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: "#475569",
                      lineHeight: 1.62,
                      fontSize: 15,
                    }}
                  >
                    {step.description}
                  </p>
                </div>

                <div style={{ paddingTop: 2 }}>
                  <Link href={stepHref(step.id)} style={stepLinkStyle}>
                    {step.action}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "20px 20px 64px",
        }}
      >
        <div
          className="home-bottom-grid"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
            gap: 22,
            alignItems: "stretch",
          }}
        >
          <div
            className="home-bottom-primary"
            style={{
              background: "#ffffff",
              borderRadius: 24,
              padding: 26,
              border: "1px solid #e2e8f0",
              boxShadow: "0 14px 35px rgba(15,23,42,0.06)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                color: "#64748b",
              }}
              >
              Best first actions
            </p>
            <h2
              style={{
                margin: "10px 0 10px",
                fontSize: 34,
                letterSpacing: -0.6,
              }}
              >
              Start with the clearest next step
            </h2>
            <p
              style={{
                margin: 0,
                maxWidth: 760,
                color: "#475569",
                lineHeight: 1.75,
              }}
              >
              New here? Start with Choose Bike. Already know what you want?
              Jump into Build, explore Expert Builds or head straight to Saved
              Builds.
            </p>

            <div
              className="home-bottom-cta-row"
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 24,
              }}
              >
              <Link href="/garage?step=Bike" style={primaryCtaStyle}>
                Choose Bike
              </Link>
              <Link href="/garage?step=Expert" style={secondaryCtaStyle}>
                Browse Expert Builds
              </Link>
              <HomeAuthCtas
                primaryStyle={primaryCtaStyle}
                secondaryStyle={secondaryCtaStyle}
                supportingLinkStyle={bottomSupportingLinkStyle}
                signedInSupportingTextStyle={bottomSignedInSupportStyle}
                layout="compact"
                showPrimary={false}
              />
            </div>
          </div>

          <div
            className="home-bottom-secondary"
            style={{
              background: "#0f172a",
              color: "#ffffff",
              borderRadius: 24,
              padding: 24,
              display: "grid",
              gap: 16,
              boxShadow: "0 18px 40px rgba(15,23,42,0.15)",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  opacity: 0.68,
                }}
              >
                More ways in
              </p>
              <h2 style={{ margin: "10px 0 0", fontSize: 28 }}>
                Explore the full Garage
              </h2>
            </div>

            <div
              className="home-bottom-step-list"
              style={{
                display: "grid",
                gap: 10,
              }}
            >
              {workflowSteps.map((step) => (
                <div
                  key={step.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {step.number}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>
                      {step.title}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, opacity: 0.62 }}>Live tab</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <style>{`
        .home-shell,
        .home-hero-copy,
        .home-hero-visual,
        .home-bottom-primary,
        .home-bottom-secondary {
          min-width: 0;
        }

        .home-shell {
          width: 100%;
          overflow-x: clip;
        }

        @media (max-width: 1100px) {
          .home-hero-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .home-hero-visual {
            max-width: 760px;
          }

          .home-workflow-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .home-bottom-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }

        @media (max-width: 820px) {
          .home-highlights-grid,
          .home-workflow-grid,
          .home-quick-links-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .home-highlights-grid {
            margin-top: -16px !important;
          }

          .home-hero-links-header {
            align-items: flex-start !important;
          }

          .home-hero-cta-row a,
          .home-bottom-cta-row a {
            flex: 1 1 220px;
            text-align: center;
          }
        }

        @media (max-width: 640px) {
          .home-shell {
            overflow-x: hidden;
          }

          .home-hero-topbar,
          .home-hero-links-header {
            flex-direction: column;
            align-items: flex-start !important;
          }

          .home-hero-topbar {
            margin-bottom: 22px !important;
            gap: 14px !important;
          }

          .home-hero-cta-row,
          .home-bottom-cta-row {
            gap: 10px !important;
          }

          .home-hero-cta-row a,
          .home-bottom-cta-row a {
            width: 100%;
            flex: 1 1 100%;
          }

          .home-hero-image-frame img {
            min-height: 220px !important;
            max-height: 280px !important;
          }

          .home-hero-visual,
          .home-bottom-primary,
          .home-bottom-secondary {
            padding: 18px !important;
          }

          .home-workflow-header {
            margin-bottom: 20px !important;
          }
        }

        @media (max-width: 430px) {
          .home-hero-title {
            letter-spacing: -0.8px !important;
          }

          .home-hero-subtitle {
            max-width: 100% !important;
          }
        }
      `}</style>
    </main>
  );
}

const primaryHeroLinkStyle = {
  display: "inline-block",
  padding: "14px 20px",
  borderRadius: 14,
  background: "#ffffff",
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: 800,
} as const;

const secondaryHeroLinkStyle = {
  display: "inline-block",
  padding: "12px 18px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.06)",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
} as const;

const stepLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 38,
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 14,
} as const;

const primaryCtaStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  padding: "12px 16px",
  borderRadius: 12,
  background: "#0f172a",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 800,
} as const;

const secondaryCtaStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: 700,
} as const;

const heroSupportingLinkStyle = {
  color: "#ffffff",
  textDecoration: "underline",
  textUnderlineOffset: 3,
  fontWeight: 700,
} as const;

const heroSignedInSupportStyle = {
  fontSize: 13,
  color: "rgba(255,255,255,0.72)",
} as const;

const bottomSupportingLinkStyle = {
  color: "#0f172a",
  textDecoration: "underline",
  textUnderlineOffset: 3,
  fontWeight: 700,
} as const;

const bottomSignedInSupportStyle = {
  fontSize: 13,
  color: "#64748b",
} as const;
