interface Sight {
  friends: string[];
  enemies: string[];
  structures: string[];
}

type Position = [number, number];

interface Common {
  id: string;
  position: Position;
  size: number;
  energy_capacity: number;
  energy: number;
  hp: number;
  sight: Sight;
}

interface Structure extends Pick<Common, "id" | "position"> {
  structure_type: string;
}

interface Base extends Common, Structure {}

interface Energy extends Structure {}

type Interactable = Spirit | Base | Energy;

type SpiritState = "Charge" | "Harvest" | "Attack" | "Defend" | "Merge";

interface Spirit extends Common {
  move: (position: Position) => void;
  energize: (target: Interactable) => void;
  merge: (target: Spirit) => void;
  divide: () => void;
}
