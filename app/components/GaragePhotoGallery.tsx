type UploadedPhoto = {
  id: string;
  url: string;
  name: string;
};

type Props = {
  uploadedPhotos: UploadedPhoto[];
  selectedPhotoIndex: number;
  setSelectedPhotoIndex: React.Dispatch<React.SetStateAction<number>>;
  heroImage: string;
  handleDeletePhoto: (photo: UploadedPhoto) => void;
};

export default function GaragePhotoGallery({
  uploadedPhotos,
  selectedPhotoIndex,
  setSelectedPhotoIndex,
  heroImage,
  handleDeletePhoto,
}: Props) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 24,
        padding: 20,
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
      }}
    >
      {uploadedPhotos.length > 0 ? (
        <>
          <div
            style={{
              borderRadius: 20,
              overflow: "hidden",
              position: "relative",
              background: "#f3f4f6",
              marginBottom: 16,
            }}
          >
            <button
              onClick={() =>
                setSelectedPhotoIndex((prev) =>
                  prev > 0 ? prev - 1 : uploadedPhotos.length - 1
                )
              }
              style={{
                position: "absolute",
                left: 20,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 40,
                height: 40,
                cursor: "pointer",
                fontSize: 18,
                zIndex: 1,
              }}
            >
              ‹
            </button>

            <button
              onClick={() =>
                setSelectedPhotoIndex((prev) =>
                  prev < uploadedPhotos.length - 1 ? prev + 1 : 0
                )
              }
              style={{
                position: "absolute",
                right: 20,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 40,
                height: 40,
                cursor: "pointer",
                fontSize: 18,
                zIndex: 1,
              }}
            >
              ›
            </button>

            <img
              src={heroImage}
              alt="Bike"
              style={{
                width: "100%",
                height: 300,
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              scrollBehavior: "smooth",
              overflowX: "auto",
              whiteSpace: "nowrap",
              paddingBottom: 8,
            }}
          >
            {uploadedPhotos.map((photo, index) => {
              const active = index === selectedPhotoIndex;

              return (
                <div key={photo.id} style={{ minWidth: 130, width: 130 }}>
                  <button
                    onClick={() => setSelectedPhotoIndex(index)}
                    style={{
                      width: "100%",
                      border: active ? "3px solid #2563eb" : "1px solid #d1d5db",
                      padding: 0,
                      borderRadius: 14,
                      overflow: "hidden",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      style={{
                        width: "100%",
                        height: 78,
                        objectFit: "cover",
                        display: "block",
                        backgroundColor: "#f3f4f6",
                      }}
                    />
                  </button>

                  <button
                    onClick={() => handleDeletePhoto(photo)}
                    style={{
                      marginTop: 8,
                      width: "100%",
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      borderRadius: 10,
                      padding: "8px 10px",
                      cursor: "pointer",
                      color: "#b00020",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div
          style={{
            position: "relative",
            height: 360,
            borderRadius: 20,
            border: "2px dashed #cbd5e1",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 24,
            color: "#64748b",
            lineHeight: 1.6,
          }}
        >
          Upload your first bike photo to start your build gallery.
        </div>
      )}
    </div>
  );
}