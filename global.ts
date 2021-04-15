declare const spirits: { [key: string]: Spirit };
declare const my_spirits: Spirit[];
declare const base: Base;
declare const enemy_base: Base;
declare const star_zxq: Energy;
declare const star_a1c: Energy;
declare const memory: { [key: string]: SpiritState } & {
  init: boolean;
  initialHP: number;
  workerLastMerge: number;
  defenderLastMerge: number;
  mergers: {
    workerA: string;
    workerB: string;
    time: number;
  }[];
  satelites: {
    [key: string]: Structure;
  };
  defenders: {
    [key: string]: Structure;
  };
  spirits: {
    [key: string]: SpiritState;
  };
};
