export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "Arial, sans-serif",
        color: "#111827",
      }}
    >
      <section
        style={{
          background: "#111827",
          color: "#ffffff",
          padding: "72px 20px 64px",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.15fr 1fr",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                opacity: 0.75,
              }}
            >
              Accessorise It
            </p>

            <h1
              style={{
                margin: "16px 0 14px",
                fontSize: 54,
                lineHeight: 1.02,
                maxWidth: 720,
              }}
            >
              Build, customise and show off your ideal ride
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: 660,
                fontSize: 18,
                lineHeight: 1.7,
                opacity: 0.9,
              }}
            >
              Accessorise It helps riders personalise their motorcycle with the
              right accessories, live build pricing, and real photo galleries of
              their actual setup.
            </p>

            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 28,
              }}
            >
              <a
                href="/garage"
                style={{
                  display: "inline-block",
                  padding: "14px 20px",
                  borderRadius: 14,
                  background: "#ffffff",
                  color: "#111827",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Enter Garage
              </a>

              <a
                href="#how-it-works"
                style={{
                  display: "inline-block",
                  padding: "14px 20px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "transparent",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                See How It Works
              </a>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 24,
              }}
            >
              {["Exact-fit accessories", "Build gallery", "Live pricing"].map(
                (item) => (
                  <div
                    key={item}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                      fontSize: 14,
                    }}
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </div>

          <div
            style={{
              minHeight: 420,
              borderRadius: 26,
              backgroundImage: "url(/bmw-r1300gsa.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            }}
          />
        </div>
      </section>

      <section
        style={{
          padding: "28px 20px 0",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 20,
            marginTop: -42,
          }}
        >
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
              01
            </p>
            <h2 style={{ margin: "10px 0 8px", fontSize: 24 }}>
              Choose your bike
            </h2>
            <p
              style={{
                margin: 0,
                color: "#4b5563",
                lineHeight: 1.6,
              }}
            >
              Start with your model and build type so the experience feels
              relevant from the first click.
            </p>
          </div>

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
              02
            </p>
            <h2 style={{ margin: "10px 0 8px", fontSize: 24 }}>
              Build your setup
            </h2>
            <p
              style={{
                margin: 0,
                color: "#4b5563",
                lineHeight: 1.6,
              }}
            >
              Compare luggage, protection and performance accessories while
              tracking your running build total.
            </p>
          </div>

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
              03
            </p>
            <h2 style={{ margin: "10px 0 8px", fontSize: 24 }}>
              Upload your real build
            </h2>
            <p
              style={{
                margin: 0,
                color: "#4b5563",
                lineHeight: 1.6,
              }}
            >
              Save up to 10 photos of your actual bike and turn your setup into
              something worth sharing.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "64px 20px",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                color: "#6b7280",
              }}
            >
              Why it matters
            </p>
            <h2 style={{ margin: "10px 0 8px", fontSize: 38 }}>
              A smarter way to accessorise
            </h2>
            <p
              style={{
                margin: 0,
                maxWidth: 760,
                color: "#4b5563",
                lineHeight: 1.7,
                fontSize: 16,
              }}
            >
              Riders want confidence, inspiration and convenience. Accessorise
              It brings those together in one place with exact-fit discovery,
              build planning, and a visual record of the bike they’ve created.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                title: "Exact-fit confidence",
                text: "Show accessories relevant to the selected bike so users feel safer buying and building.",
              },
              {
                title: "Visual planning",
                text: "Help riders compare ideas, organise their setup and understand the cost of their build.",
              },
              {
                title: "Community potential",
                text: "Create a place where users can save, upload and eventually share the real-world result.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: 22,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  border: "1px solid #e5e7eb",
                }}
              >
                <h3 style={{ margin: "0 0 10px", fontSize: 22 }}>{item.title}</h3>
                <p
                  style={{
                    margin: 0,
                    color: "#4b5563",
                    lineHeight: 1.7,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        style={{
          padding: "0 20px 64px",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 24,
              padding: 28,
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
              How it works
            </p>

            <h2 style={{ margin: "10px 0 14px", fontSize: 36 }}>
              Designed for riders, not spreadsheets
            </h2>

            <div style={{ display: "grid", gap: 18 }}>
              {[
                "Select your bike and start a build.",
                "Browse accessories by category.",
                "Track your live total as you add products.",
                "Upload real photos of your own setup.",
                "Save and share your finished build.",
              ].map((item, index) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "start",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      minWidth: 32,
                      borderRadius: 999,
                      background: "#111827",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {index + 1}
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: "#4b5563",
                      lineHeight: 1.7,
                      paddingTop: 2,
                    }}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <a
                href="/garage"
                style={{
                  display: "inline-block",
                  padding: "14px 20px",
                  borderRadius: 14,
                  background: "#111827",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Open the Demo Garage
              </a>
            </div>
          </div>

          <div
            style={{
              minHeight: 420,
              borderRadius: 24,
              backgroundImage: "url(/yamaha-tenere-700.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
            }}
          />
        </div>
      </section>

      <section
        style={{
          padding: "0 20px 72px",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            background: "#111827",
            color: "#ffffff",
            borderRadius: 24,
            padding: "34px 28px",
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            alignItems: "center",
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
                opacity: 0.75,
              }}
            >
              Ready to build
            </p>
            <h2 style={{ margin: "10px 0 8px", fontSize: 34 }}>
              Start shaping your ideal setup
            </h2>
            <p
              style={{
                margin: 0,
                opacity: 0.9,
                lineHeight: 1.7,
                maxWidth: 700,
              }}
            >
              Move into the garage and start building the bike setup you want to
              own, use and show.
            </p>
          </div>

          <a
            href="/garage"
            style={{
              display: "inline-block",
              padding: "14px 20px",
              borderRadius: 14,
              background: "#ffffff",
              color: "#111827",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Go to Garage
          </a>
        </div>
      </section>
    </main>
  );
}