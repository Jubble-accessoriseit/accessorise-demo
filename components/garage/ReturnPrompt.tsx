'use client'

type ReturnPromptProps = {
  productName: string
  retailerName: string
  price: number | null
  onBought: () => void
  onNotYet: () => void
  onRemove: () => void
}

export function ReturnPrompt({
  productName,
  retailerName,
  price,
  onBought,
  onNotYet,
  onRemove,
}: ReturnPromptProps) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(28,105,212,0.06)',
        border: '1px solid rgba(28,105,212,0.24)',
        borderRadius: 12,
        padding: 13,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Pulsing dot + retailer label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#1C69D4',
            flexShrink: 0,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.35; }
          }
        `}</style>
        <span style={{ fontSize: 10, color: '#6A6860' }}>
          You just visited {retailerName}
        </span>
      </div>

      {/* Headline */}
      <p
        style={{
          margin: 0,
          fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
          fontWeight: 900,
          fontSize: 14,
          color: '#F5F3EE',
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          lineHeight: 1.2,
        }}
      >
        Did you buy the {productName}?
      </p>

      {/* Subtext */}
      {price !== null && (
        <p style={{ margin: 0, fontSize: 11, color: '#6A6860' }}>
          ${price} was on your wish list
        </p>
      )}

      {/* CTA row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onBought}
          style={{
            flex: 1,
            backgroundColor: '#1C69D4',
            color: '#0D0D0D',
            border: 'none',
            borderRadius: 8,
            padding: '10px 12px',
            fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
            fontWeight: 900,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Yes, I bought it
        </button>
        <button
          onClick={onNotYet}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#F5F3EE',
            borderRadius: 8,
            padding: '10px 12px',
            fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
            fontWeight: 900,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Not yet
        </button>
      </div>

      {/* Remove link */}
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          fontSize: 10,
          color: '#3A3830',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        Remove from wish list
      </button>
    </div>
  )
}
