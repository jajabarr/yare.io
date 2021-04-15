function ForEachIf<T>(
  items: T[],
  testFn: (item: T) => boolean,
  callback: (item: T, index: number) => void
) {
  let i = 0;
  for (const item of items) {
    if (testFn(item)) {
      callback(item, i++);
    }
  }
}

function ForEach<T>(items: T[], callback: (item: T, index: number) => void) {
  let i = 0;
  for (const item of items) {
    callback(item, i++);
  }
}

function TimeSince(lastTimestamp: number) {
  return Date.now() - lastTimestamp;
}

function Distance(lhs: Interactable, rhs: Interactable) {
  const [lx, ly] = lhs.position;
  const [rx, ry] = rhs.position;
  return Math.floor(Math.sqrt(Math.pow(lx - rx, 2) + Math.pow(ly - ry, 2)));
}

function GiveTask(spirit: Spirit, task: SpiritState) {
  memory.spirits[spirit.id] = task;
}

function Charge(spirit: Spirit) {
  GiveTask(spirit, 'Charge');

  if (Distance(spirit, base) >= 200) {
    spirit.move(base.position);
  }

  spirit.energize(base);
}

function Satelite(spirit: Spirit, structure?: Structure) {
  GiveTask(spirit, 'Satelite');

  const home = structure || base;
  memory.satelites[spirit.id] = home;

  const [x, y] = home.position;
  spirit.move([x, y + 200]);
  spirit.energize(spirit);
}

function Harvest(spirit: Spirit) {
  GiveTask(spirit, 'Harvest');

  if (Distance(spirit, star_zxq) >= 200) {
    spirit.move(star_zxq.position);
  }

  spirit.energize(spirit);
}

function Defend(spirit: Spirit, structure?: Structure) {
  GiveTask(spirit, 'Defend');

  const home = structure || base;
  memory.defenders[spirit.id] = home;

  const [x, y] = home.position;
  spirit.move([x, y + 200]);
}

function Attack(spirit: Spirit, enemy: string) {
  GiveTask(spirit, 'Attack');

  const nearestAttacker = spirits[enemy];
  spirit.move(nearestAttacker.position);
  spirit.energize(nearestAttacker);
}

function AttackEnemyBase(spirit: Spirit) {
  GiveTask(spirit, 'Attack');

  spirit.move(enemy_base.position);
  spirit.energize(enemy_base);
}

function Reset(spiritId: string) {
  if (!!spirits[spiritId]) {
    GiveTask(spirits[spiritId], ('' as unknown) as SpiritState);
  }
}

function isDead(spiritId: string): boolean {
  return !spirits[spiritId];
}

function isBaseUnderAttack() {
  return base.sight.enemies.length > 0 && base.sight.enemies[0];
}

function isStarUnderAttack() {
  return (
    my_spirits[0].sight.enemies.length > 0 && my_spirits[0].sight.enemies[0]
  );
}

function HasSufficientEnergy(spirit: Spirit) {
  return spirit.energy >= Math.ceil(spirit.energy_capacity / 2);
}

function ElligibleDefender(spirit: Spirit) {
  return spirit.hp >= memory.initialHP * 5;
}

function Merge(spirit: Spirit, other: Spirit) {
  for (const mergePair of memory.mergers) {
    if (mergePair.workerA === spirit.id || mergePair.workerB === spirit.id) {
      return;
    }
  }

  const lastMergeTime = HasTask(spirit, 'Defend')
    ? memory.defenderLastMerge
    : memory.workerLastMerge;

  if (TimeSince(lastMergeTime) < 20 * 1000) {
    return;
  }

  if (HasTask(spirit, 'Defend')) {
    memory.defenderLastMerge = Date.now();
  } else {
    memory.workerLastMerge = Date.now();
  }

  GiveTask(spirit, 'Merge');
  GiveTask(other, 'Merge');

  spirit.move(other.position);
  other.move(spirit.position);
  spirit.merge(other);

  memory.mergers.push({
    workerA: spirit.id,
    workerB: other.id,
    time: Date.now()
  });
}

function GetState(spirit: Spirit): SpiritState {
  return memory.spirits[spirit.id] as SpiritState;
}

function HasTask(spirit: Spirit, SpiritState: SpiritState): boolean {
  return GetState(spirit) === SpiritState;
}

function PurgeMergers(spiritAId: string) {
  memory.mergers = memory.mergers.filter((mergePair) => {
    const { workerA, workerB } = mergePair;

    return workerA !== spiritAId && workerB !== spiritAId;
  });
}

function ResetMergers(spiritAId: string, spiritBId: string) {
  Reset(spiritAId);
  Reset(spiritBId);

  PurgeMergers(spiritAId);
}

function Debug() {
  for (const spirit of my_spirits) {
    console.log(`${spirit.id}: ${memory.spirits[spirit.id]}\n`);
  }
  // console.log(debugString);
}
