declare const spirits: { [key: string]: Spirit };
declare const my_spirits: Spirit[];
declare const base: Base;
declare const enemy_base: Base;
declare const star_zxq: Energy;
declare const star_a1c: Energy;
declare const memory: { [key: string]: SpiritState } & {
  init: boolean;
  mergeLimit: number;
  defenders: number;
  mergeCount: number;
  chargerLastMerge: number;
  defenderLastMerge: number;
  mergingSpiritA: string;
  mergingSpiritB: string;
  mergingSizeTarget: number;
};
