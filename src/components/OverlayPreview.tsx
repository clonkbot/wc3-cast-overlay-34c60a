interface Player {
  name: string;
  race: string;
  score: number;
  country?: string;
  team?: string;
}

interface Settings {
  showScores: boolean;
  showRaces: boolean;
  showCountry: boolean;
  showTeam: boolean;
  theme: string;
  accentColor: string;
}

interface Props {
  player1?: Player;
  player2?: Player;
  settings: Settings;
}

const RACE_ICONS: Record<string, string> = {
  "Human": "🏰",
  "Orc": "🪓",
  "Undead": "💀",
  "Night Elf": "🌙",
  "Random": "❓",
};

export function OverlayPreview({ player1, player2, settings }: Props) {
  if (!player1 || !player2) return null;

  return (
    <div
      className={`overlay-preview theme-${settings.theme}`}
      style={{ '--accent': settings.accentColor } as React.CSSProperties}
    >
      <div className="overlay-bar">
        <div className="overlay-player left">
          {settings.showTeam && player1.team && (
            <span className="player-team">[{player1.team}]</span>
          )}
          <span className="player-name">{player1.name}</span>
          {settings.showCountry && player1.country && (
            <span className="player-country">{player1.country}</span>
          )}
          {settings.showRaces && (
            <span className="player-race">{RACE_ICONS[player1.race]}</span>
          )}
          {settings.showScores && (
            <span className="player-score">{player1.score}</span>
          )}
        </div>

        <div className="overlay-vs">VS</div>

        <div className="overlay-player right">
          {settings.showScores && (
            <span className="player-score">{player2.score}</span>
          )}
          {settings.showRaces && (
            <span className="player-race">{RACE_ICONS[player2.race]}</span>
          )}
          {settings.showCountry && player2.country && (
            <span className="player-country">{player2.country}</span>
          )}
          <span className="player-name">{player2.name}</span>
          {settings.showTeam && player2.team && (
            <span className="player-team">[{player2.team}]</span>
          )}
        </div>
      </div>
    </div>
  );
}
