interface Player {
  name: string;
  race: string;
  score: number;
  country?: string;
  team?: string;
}

interface Props {
  player: Player;
  races: string[];
  onUpdate: (updates: Partial<Player>) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  slot: number;
}

const RACE_ICONS: Record<string, string> = {
  "Human": "🏰",
  "Orc": "🪓",
  "Undead": "💀",
  "Night Elf": "🌙",
  "Random": "❓",
};

export function PlayerCard({ player, races, onUpdate, onIncrement, onDecrement, slot }: Props) {
  return (
    <div className={`player-card slot-${slot}`}>
      <div className="player-header">
        <span className="player-slot">Player {slot}</span>
        <span className="race-icon">{RACE_ICONS[player.race] || "❓"}</span>
      </div>

      <div className="player-form">
        <div className="form-row">
          <label>Name</label>
          <input
            type="text"
            value={player.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="player-input"
            placeholder="Player name"
          />
        </div>

        <div className="form-row">
          <label>Race</label>
          <select
            value={player.race}
            onChange={(e) => onUpdate({ race: e.target.value })}
            className="player-select"
          >
            {races.map((race) => (
              <option key={race} value={race}>
                {RACE_ICONS[race]} {race}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Country</label>
          <input
            type="text"
            value={player.country || ""}
            onChange={(e) => onUpdate({ country: e.target.value })}
            className="player-input"
            placeholder="e.g., KR, CN, DE"
          />
        </div>

        <div className="form-row">
          <label>Team</label>
          <input
            type="text"
            value={player.team || ""}
            onChange={(e) => onUpdate({ team: e.target.value })}
            className="player-input"
            placeholder="e.g., WGL, B2W"
          />
        </div>
      </div>

      <div className="score-section">
        <label>Score</label>
        <div className="score-controls">
          <button onClick={onDecrement} className="score-btn minus">−</button>
          <span className="score-value">{player.score}</span>
          <button onClick={onIncrement} className="score-btn plus">+</button>
        </div>
      </div>
    </div>
  );
}
