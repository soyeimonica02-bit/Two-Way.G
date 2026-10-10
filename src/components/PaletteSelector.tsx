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
            marginBottom: '32px',
            borderBottom: '2.5px solid var(--tw-border)',
            paddingBottom: '20px',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display, inherit)',
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              margin: '0 0 12px',
              color: 'var(--tw-text)',
              textTransform: 'none',
            }}
          >
            Choose your colors.
          </h1>

          <p
            style={{
              margin: 0,
              color: 'var(--tw-text-muted)',
              fontSize: '0.98rem',
              lineHeight: 1.55,
              fontWeight: 500,
              maxWidth: '640px',
            }}
          >
            Pick a palette that feels like you. You can change it later in Settings.
          </p>
        </div>
      )}

      {/* PALETTE CARDS GRID — TACTILE BRUTALISM */}
      <div
        className="palette-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
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
                border: isSelected ? `3px solid ${v.border}` : `2.5px solid ${v.border}`,
                borderRadius: '18px',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                boxShadow: isSelected
                  ? `5px 5px 0px ${v.border}`
                  : `3.5px 3.5px 0px ${v.border}`,
                transform: isSelected ? 'translate(-2px, -2px)' : 'none',
                transition: 'transform 120ms ease, box-shadow 120ms ease',
                outline: 'none',
              }}
            >
              {/* TOP ROW: PALETTE NAME & SELECTION STATE */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  borderBottom: `2px solid ${v.border}`,
                  paddingBottom: '12px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display, inherit)',
                    fontSize: '1rem',
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
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      background: v.primary,
                      color: v.primaryText,
                      border: `2px solid ${v.border}`,
                      borderRadius: '8px',
                      padding: '4px 10px',
                      boxShadow: `1.5px 1.5px 0px ${v.border}`,
                    }}
                  >
                    SELECTED
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: v.textMuted,
                    }}
                  >
                    TAP TO APPLY
                  </span>
                )}
              </div>

              {/* COLOR SWATCHES ROW */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${palette.swatches.length}, 1fr)`,
                  gap: '6px',
                  alignItems: 'center',
                }}
              >
                {palette.swatches.map((color, index) => (
                  <div
                    key={`${palette.id}-swatch-${index}`}
                    style={{
                      height: '34px',
                      background: color,
                      border: `2px solid ${v.border}`,
                      borderRadius: '8px',
                      boxShadow: `1.5px 1.5px 0px ${v.border}`,
                    }}
                    title={color}
                  />
                ))}
              </div>

              {/* MINI LIVE INTERFACE PREVIEW */}
              <div
                className="palette-preview-frame"
                style={{
                  background: v.background,
                  border: `2px solid ${v.border}`,
                  borderRadius: '14px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: `2px 2px 0px ${v.border}`,
                }}
              >
                {/* PREVIEW TOP BAR */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '8px',
                    borderBottom: `1.5px solid ${v.border}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display, inherit)',
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: v.text,
                    }}
                  >
                    TWO-WAY
                  </span>

                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: `1.5px solid ${v.border}`,
                      background: v.primary,
                    }}
                  />
                </div>

                {/* PREVIEW COMPONENT CARD */}
                <div
                  style={{
                    background: v.surface,
                    border: `2px solid ${v.border}`,
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: `2px 2px 0px ${v.border}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: v.primary,
                    }}
                  >
                    PREVIEW
                  </span>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 900,
                        color: v.text,
                      }}
                    >
                      Interface Style
                    </span>

                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        background: v.primary,
                        color: v.primaryText,
                        border: `1.5px solid ${v.border}`,
                        borderRadius: '6px',
                      }}
                    >
                      BUTTON
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
