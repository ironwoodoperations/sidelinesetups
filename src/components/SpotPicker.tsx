import { Field, Spot } from '@/types';

interface SpotPickerProps {
  field: Field;
  spots: Spot[];
  takenSpotIds?: string[];
  value: string;
  onChange: (spotId: string) => void;
}

export default function SpotPicker({ field, spots, takenSpotIds = [], value, onChange }: SpotPickerProps) {
  if (!field?.imageUrl) {
    return (
      <div className="mt-4">
        <div className="text-center mb-3 p-3 bg-card border-2 border-primary rounded-lg font-semibold text-primary max-w-xl mx-auto font-heading">
          Where would you like us to set you up? (Click a location)
        </div>
        <p className="text-center text-xs text-muted-foreground mb-3">
          These locations are an estimate and not guaranteed to be exact at your field
        </p>
        <div className="grid grid-cols-3 gap-2 mt-4 max-w-md mx-auto">
          {spots.map(spot => {
            const isSelected = value === spot.id;
            const isTaken = takenSpotIds.includes(spot.id);
            return (
              <button
                key={spot.id}
                disabled={isTaken}
                onClick={() => onChange(spot.id)}
                className={`py-3 px-4 rounded-lg border-2 text-sm font-bold transition-all font-heading
                  ${isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-elevated'
                    : isTaken
                      ? 'bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50'
                      : 'bg-card text-primary border-primary hover:bg-primary/10 hover:scale-105'
                  }`}
              >
                {spot.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="text-center mb-3 p-3 bg-card border-2 border-primary rounded-lg font-semibold text-primary max-w-xl mx-auto font-heading">
        Where would you like us to set you up? (Click a location)
      </div>
      <p className="text-center text-xs text-muted-foreground mb-3">
        These locations are an estimate and not guaranteed to be exact at your field
      </p>
      <div
        className="relative mx-auto rounded-xl overflow-hidden border-2 border-border"
        style={{ maxWidth: 800 }}
      >
        <img src={field.imageUrl} alt={field.name} className="w-full block" />
        {spots.map(spot => {
          const isSelected = value === spot.id;
          const isTaken = takenSpotIds.includes(spot.id);
          return (
            <button
              key={spot.id}
              onClick={() => !isTaken && onChange(spot.id)}
              disabled={isTaken}
              title={spot.label}
              className="absolute transition-all duration-200"
              style={{
                left: `${Math.max(0, Math.min(100, spot.x || 50))}%`,
                top: `${Math.max(0, Math.min(100, spot.y || 50))}%`,
                transform: 'translate(-50%, -50%)',
                width: 'clamp(28px, 4vw, 38px)',
                height: 'clamp(28px, 4vw, 38px)',
                borderRadius: '50%',
                border: isSelected ? '3px solid hsl(var(--primary))' : '2px solid white',
                background: isSelected
                  ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(200 80% 28%) 100%)'
                  : isTaken
                    ? 'hsl(var(--muted))'
                    : 'rgba(255,255,255,0.92)',
                color: isSelected ? 'white' : isTaken ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))',
                cursor: isTaken ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: 'clamp(8px, 1.2vw, 11px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isSelected
                  ? '0 0 12px rgba(0,63,92,0.6), 0 2px 8px rgba(0,0,0,0.25)'
                  : '0 2px 6px rgba(0,0,0,0.2)',
                lineHeight: 1,
                padding: 0,
                userSelect: 'none',
              }}
              onMouseEnter={e => {
                if (!isSelected && !isTaken) {
                  (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1.15)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected && !isTaken) {
                  (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, -50%)';
                }
              }}
            >
              {spot.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
