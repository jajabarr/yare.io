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

function isSamePosition(p1: Position, p2: Position) {
  return p1[0] === p2[0] && p1[1] === p2[1];
}

function TimeSince(lastTimestamp: number) {
  return Date.now() - lastTimestamp;
}

function Merge(spirit: Spirit, other: Spirit) {
  const lastMergeTime = HasTask(spirit, "Defend")
    ? memory.defenderLastMerge
    : memory.chargerLastMerge;

  if (
    memory.mergeLimit >= memory.mergeLimit &&
    TimeSince(lastMergeTime) < 20 * 1000
  ) {
    return;
  }

  if (HasTask(spirit, "Defend")) {
    memory.defenderLastMerge = Date.now();
  } else {
    memory.chargerLastMerge = Date.now();
  }

  memory.mergeCount = memory.mergeCount + 1;
  memory[spirit.id] = "Merge";
  memory[other.id] = "Merge";
  spirit.move(other.position);
  other.move(spirit.position);
  spirit.merge(other);

  memory.mergingSpiritA = spirit.id;
  memory.mergingSpiritB = other.id;

  memory.mergingSizeTarget = spirit.energy_capacity + other.energy_capacity;
}

function FinishMerge(spirit: Spirit) {
  if (
    spirit.id !== memory.mergingSpiritA &&
    spirit.id !== memory.mergingSpiritB
  ) {
    return;
  }

  const other =
    spirit.id === memory.mergingSpiritA
      ? spirits[memory.mergingSpiritB]
      : spirits[memory.mergingSpiritA];

  spirit.move(other.position);
  other.move(spirit.position);
  spirit.merge(other);
}

function Charge(spirit: Spirit) {
  memory[spirit.id] = "Charge";
  if (spirit.position != base.position) {
    spirit.move(base.position);
  }

  spirit.energize(base);
}

function Harvest(spirit: Spirit) {
  memory[spirit.id] = "Harvest";

  if (spirit.position != star_zxq.position) {
    spirit.move(star_zxq.position);
  }

  spirit.energize(spirit);
}

function Defend(spirit: Spirit, structure: Structure) {
  memory[spirit.id] = "Defend";
  spirit.move(structure.position);
}

function isBaseUnderAttack() {
  return base.sight.enemies.length > 0 && base.sight.enemies[0];
}

function Attack(spirit: Spirit, enemy: string) {
  const nearestAttacker = spirits[enemy];
  memory[spirit.id] = "Attack";
  spirit.move(nearestAttacker.position);
  spirit.energize(nearestAttacker);
}

function GetState(spirit: Spirit): SpiritState {
  return memory[spirit.id] as SpiritState;
}

function HasTask(spirit: Spirit, SpiritState: SpiritState): boolean {
  return GetState(spirit) === SpiritState;
}

function AttackEnemyBase(spirit: Spirit) {
  memory[spirit.id] = "Attack";
  spirit.move(enemy_base.position);
  spirit.energize(enemy_base);
}

// init
if (!memory.init) {
  memory.init = true;
  memory.mergeLimit = 1;
  memory.mergeCount = 0;
  memory.defenders = 0;
}

// resolve merge
if (
  spirits[memory.mergingSpiritA] &&
  spirits[memory.mergingSpiritA].energy_capacity == memory.mergingSizeTarget
) {
  Charge(spirits[memory.mergingSpiritA]);
  memory.mergingSizeTarget = -1;
  memory.mergingSpiritA = "";
  memory.mergingSpiritB = "";
}

ForEach(my_spirits, (spirit, index) => {
  // Allow merges to finish
  if (HasTask(spirit, "Merge")) {
    FinishMerge(spirit);
    return;
  }
  // Attack if possible
  const nearestEnemy =
    isBaseUnderAttack() ||
    (spirit.sight.enemies.length > 0 && spirit.sight.enemies[0]);

  if (spirit.energy > Math.floor(spirit.energy_capacity / 2)) {
    if (!!nearestEnemy) {
      Attack(spirit, nearestEnemy);
      return;
    }
  }

  // Always harvest if empty
  if (spirit.energy === 0) {
    Harvest(spirit);
    return;
  }

  // New spirit
  if (!GetState(spirit)) {
    if (spirit.energy === spirit.energy_capacity) {
      // Hire defender
      if ((index + 1) % 3 === 0) {
        // Patrol
        Defend(spirit, (index + 1) % 6 === 0 ? base : star_zxq);
        return;

        // Hire charger
      } else {
        Charge(spirit);
        return;
      }

      // Hire harvester
    } else {
      Harvest(spirit);
      return;
    }
  }

  if (
    spirit.energy < spirit.energy_capacity &&
    (HasTask(spirit, "Harvest") || HasTask(spirit, "Defend"))
  ) {
    Harvest(spirit);
    return;
  }

  if (spirits.energy === spirits.energy_capacity) {
    if (index % 3 === 0) {
      Defend(spirit, index % 6 === 0 ? base : star_zxq);
      return;
    }
  }

  if (spirit.energy <= spirit.energy_capacity) {
    Charge(spirit);
    return;
  }

  // Default
  Harvest(spirit);
});

memory.mergeCount = 0;
// Merge chargers
ForEachIf(
  my_spirits,
  (spirit) =>
    spirit.energy == spirit.energy_capacity &&
    memory.mergeCount < memory.mergeLimit,
  (spirit) => {
    ForEachIf(
      spirit.sight.friends,
      (friendId) => spirits[friendId].energy_capacity == spirit.energy_capacity,
      (friendId) => Merge(spirit, spirits[friendId])
    );
  }
);

memory.mergeCount = 0;
memory.defenders = 0;
ForEachIf(
  my_spirits,
  (spirit) => HasTask(spirit, "Defend"),
  (spirit) => {
    memory.defenders++;
    ForEachIf(
      spirit.sight.friends,
      (friendId) =>
        spirits[friendId].energy_capacity == spirit.energy_capacity &&
        memory.mergeCount < memory.mergeLimit,
      (friendId) => Merge(spirit, spirits[friendId])
    );
  }
);

if (memory.defenders >= 5) {
  ForEachIf(
    my_spirits,
    (spirit) =>
      HasTask(spirit, "Defend") && spirit.energy === spirit.energy_capacity,
    (spirit) => {
      AttackEnemyBase(spirit);
    }
  );
}
