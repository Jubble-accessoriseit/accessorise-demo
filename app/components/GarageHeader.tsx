type Props = {
  isSignedIn: boolean;
  isUploadingPhotos: boolean;
  uploadedPhotos: any[];
  totalPhotoSlotsLeft: number;
  saveMessage: string | null;
  photoError: string | null;
  pageError: string | null;
  handleSignIn: () => void;
  handleSignOut: () => void;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function GarageHeader({
  isSignedIn,
  isUploadingPhotos,
  uploadedPhotos,
  totalPhotoSlotsLeft,
  saveMessage,
  photoError,
  pageError,
  handleSignIn,
  handleSignOut,
  handlePhotoUpload,
}: Props) {
  return (
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
      <div
        style={{
          display: "flex",
          gap: 20,
          justifyContent: "space-between",
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
            <h1 style={{ margin: 0, fontSize: 34 }}>My Garage</h1>

            <button
              onClick={() => (window.location.href = "/")}
              style={{
                background: "transparent",
                color: "#9ca3af",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              ← Home
            </button>
          </div>

          <p style={{ margin: 0, color: "#d1d5db", fontSize: 15 }}>
            Upload up to 10 photos of your actual bike build.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {isSignedIn ? (
            <button onClick={handleSignOut}>Sign out</button>
          ) : (
            <button onClick={handleSignIn}>Sign in</button>
          )}

          <label>
            {isUploadingPhotos ? "Uploading..." : "Upload Photos"}
            <input
              type="file"
              multiple
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        {uploadedPhotos.length}/10 photos
      </div>

      {saveMessage && <div>{saveMessage}</div>}
      {photoError && <div>{photoError}</div>}
      {pageError && <div>{pageError}</div>}
    </section>
  );
}