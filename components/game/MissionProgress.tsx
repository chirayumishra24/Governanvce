import type { TeamId } from '@/types/controlRoom';
import { TEAM_THEME } from '@/lib/governance';

/** Row of mission dots: filled = completed, pulsing = current, grey = upcoming. */
export function MissionProgress({
  team,
  total,
  completed,
  current,
  results,
  label,
}: {
  team: TeamId;
  total: number;
  completed: number;
  current: number | null;
  results: boolean[];
  label: string;
}) {
  const theme = TEAM_THEME[team];
  return (
    <div className="flex items-center gap-2" aria-label={`${label}: ${completed} of ${total} missions complete`}>
      <span className="w-4 text-[0.72rem] font-extrabold" style={{ color: theme.accent }}>
        {label}
      </span>
      <div className="flex items-center gap-[0.3rem]">
        {Array.from({ length: total }, (_, i) => {
          const done = i < completed;
          const isCurrent = current === i;
          const wrong = done && results[i] === false;
          return (
            <span
              key={i}
              className={`block h-[0.8rem] w-[0.8rem] rounded-full ${isCurrent ? 'dot-current' : ''}`}
              style={
                {
                  background: done ? (wrong ? `${theme.accent}66` : theme.accent) : isCurrent ? '#fff' : '#E2E8F0',
                  border: isCurrent ? `2.5px solid ${theme.accent}` : '2px solid transparent',
                  '--dot-glow': theme.glow,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>
    </div>
  );
}
