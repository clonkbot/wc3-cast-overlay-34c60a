import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Props {
  sessionId: string;
}

const RACE_ICONS: Record<string, string> = {
  "Human": "🏰",
  "Orc": "🪓",
  "Undead": "💀",
  "Night Elf": "🌙",
  "Random": "❓",
};

export function OverlayView({ sessionId }: Props) {
  const data = useQuery(api.sessions.getByIdPublic, {
    id: sessionId as Id<"castSessions">
  });

  if (!data || !data.session || !data.settings) {
    return <div className="overlay-empty"></div>;
  }

  const { players, settings } = data;
  const player1 = players.find((p: { slot: number }) => p.slot === 1);
  const player2 = players.find((p: { slot: number }) => p.slot === 2);

  if (!player1 || !player2) {
    return <div className="overlay-empty"></div>;
  }

  return (
    <div
      className={`overlay-fullscreen theme-${settings.theme}`}
      style={{ '--accent': settings.accentColor } as React.CSSProperties}
    >
      <div className="overlay-glow left"></div>
      <div className="overlay-glow right"></div>

      <div className="overlay-bar-full">
        <div className="overlay-player-full left">
          <div className="player-info">
            {settings.showTeam && player1.team && (
              <span className="player-team-full">[{player1.team}]</span>
            )}
            <span className="player-name-full">{player1.name}</span>
            {settings.showCountry && player1.country && (
              <span className="player-country-full">{player1.country}</span>
            )}
          </div>
          {settings.showRaces && (
            <span className="player-race-full">{RACE_ICONS[player1.race]}</span>
          )}
          {settings.showScores && (
            <span className="player-score-full">{player1.score}</span>
          )}
        </div>

        <div className="overlay-vs-full">
          <span>VS</span>
        </div>

        <div className="overlay-player-full right">
          {settings.showScores && (
            <span className="player-score-full">{player2.score}</span>
          )}
          {settings.showRaces && (
            <span className="player-race-full">{RACE_ICONS[player2.race]}</span>
          )}
          <div className="player-info">
            {settings.showCountry && player2.country && (
              <span className="player-country-full">{player2.country}</span>
            )}
            <span className="player-name-full">{player2.name}</span>
            {settings.showTeam && player2.team && (
              <span className="player-team-full">[{player2.team}]</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
