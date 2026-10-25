import { useTheme } from '../context/useTheme';
import type { PaletteTheme } from '../utils/themePalettes';

interface PaletteSelectorProps {
  onPaletteSelect?: (paletteId: string) => void;
  initialSelectedId?: string | null;
  showHeader?: boolean;
}

export default function PaletteSelector({
  onPaletteSelect,
  initialSelectedId,
  showHeader = true,
}: PaletteSelectorProps) {
  const { selectedPaletteId, setPalette, allPalettes } = useTheme();
  const currentSelectedId = initialSelectedId !== undefined ? initialSelectedId : selectedPaletteId;

  const handleSelect = (palette: PaletteTheme) => {
    setPalette(palette.id);
    if (onPaletteSelect) {
      onPaletteSelect(palette.id);
    }
  };

  return (
    <div className="palette-selector-container" style={{ width: '100%' }}>
      {showHeader && (
        <div
          className="palette-selector-header"
          style={{
            marginBottom: '18px',
            borderBottom: '2px solid var(--tw-border)',
            paddingBottom: '12px',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display, inherit)',
              fontSize: '1.4rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              margin: '0 0 4px',
              color: 'var(--tw-text)',
            }}
          >
            Choose your colors.
          </h2>

          <p
            style={{
              margin: 0,
              color: 'var(--tw-text-muted)',
              fontSize: '0.85rem',
              lineHeight: 1.45,
            }}
          >
            Pick a palette that feels like you. You can change it at any time.
          </p>
        </div>
      )}

      {/* COMPACT PALETTE CARDS GRID */}
      <div
        className="palette-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '12px',
        }}
      >
        {allPalettes.map((palette) => {
          const isSelected = currentSelectedId === palette.id;
          const v = palette.variables;

          return (
            <button
              key={palette.id}
              type="button"
              className={`palette-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => handleSelect(palette)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: v.surface,
                border: isSelected ? `2.5px solid ${v.border}` : `1.5px solid ${v.border}`,
                borderRadius: '12px',
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                position: 'relative',
                boxShadow: isSelected
                  ? `3.5px 3.5px 0px ${v.border}`
                  : `1.5px 1.5px 0px ${v.border}`,
                transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                transition: 'transform 100ms ease, box-shadow 100ms ease',
                outline: 'none',
              }}
            >
              {/* TOP ROW: PALETTE NAME & SELECTION STATE */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  borderBottom: `1px solid ${v.border}`,
                  paddingBottom: '8px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display, inherit)',
                    fontSize: '0.86rem',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: v.text,
                  }}
                >
                  {palette.name}
                </span>

                {isSelected ? (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      background: v.primary,
                      color: v.primaryText,
                      border: `1.5px solid ${v.border}`,
                      borderRadius: '6px',
                      padding: '2px 7px',
                    }}
                  >
                    ✓ Active
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: v.textMuted,
                    }}
                  >
                    Select
                  </span>
                )}
              </div>

              {/* COMPACT COLOR SWATCHES ROW */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${palette.swatches.length}, 1fr)`,
                  gap: '4px',
                  alignItems: 'center',
                }}
              >
                {palette.swatches.map((color, index) => (
                  <div
                    key={`${palette.id}-swatch-${index}`}
                    style={{
                      height: '22px',
                      background: color,
                      border: `1.5px solid ${v.border}`,
                      borderRadius: '5px',
                    }}
                    title={color}
                  />
                ))}
              </div>

              {/* MINI LIVE PREVIEW BAR */}
              <div
                style={{
                  background: v.background,
                  border: `1px solid ${v.border}`,
                  borderRadius: '8px',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: v.text }}>
                  Aa Style
                </span>
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: v.primary,
                    color: v.primaryText,
                    border: `1px solid ${v.border}`,
                  }}
                >
                  BTN
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
