(function () {
  // init
  if (!memory.init) {
    memory.init = true;
    memory.workerLastMerge = 0;
    memory.defenderLastMerge = 0;
    memory.mergers = [];
    memory.initialHP = my_spirits[0].hp;
    memory.satelites = {};
    memory.defenders = {};
    memory.spirits = {};
    Satelite(my_spirits[0], star_zxq);
    Satelite(my_spirits[my_spirits.length - 1], base);
  }

  // cleanup
  for (const satelite of Object.keys(memory.satelites)) {
    if (!!spirits[satelite]) {
      delete memory.satelites[satelite];
    }
  }

  for (const defender of Object.keys(memory.defenders)) {
    if (!!spirits[defender]) {
      delete memory.defenders[defender];
    }
  }

  for (const spiritId of Object.keys(memory.spirits)) {
    if (isDead(spiritId)) {
      delete memory.spirits[spiritId];
    }
  }

  for (let i = 0; i < my_spirits.length; ++i) {
    const spirit = my_spirits[i];

    if (HasTask(spirit, 'Satelite')) {
      Satelite(spirit, memory.satelites[spirit.id]);
      continue;
    }

    if (HasTask(spirit, 'Defend')) {
      Defend(spirit, memory.defenders[spirit.id]);
      continue;
    }

    // Allow merges to finish
    if (HasTask(spirit, 'Merge')) {
      continue;
    }

    // Attack if possible
    const nearestEnemy = isBaseUnderAttack() || isStarUnderAttack();

    if (spirit.energy > Math.floor(spirit.energy_capacity / 2)) {
      if (!!nearestEnemy) {
        Attack(spirit, nearestEnemy);
        continue;
      }
    }

    // Always harvest if empty
    if (spirit.energy === 0) {
      Harvest(spirit);
      continue;
    }

    // New spirit
    if (!GetState(spirit)) {
      if (HasSufficientEnergy(spirit)) {
        Charge(spirit);
        continue;
        // Hire harvester
      } else {
        Harvest(spirit);
        continue;
      }
    }

    if (HasTask(spirit, 'Charge') || spirit.energy === spirit.energy_capacity) {
      Charge(spirit);
      continue;
    }

    // Default
    Harvest(spirit);
  }

  for (const mergePair of memory.mergers) {
    const { workerA, workerB, time } = mergePair;

    const [spiritA, spiritB] = [spirits[workerA], spirits[workerB]];

    if (!spiritA || !spiritB) {
      Reset(workerA);
      Reset(workerB);
      PurgeMergers(workerA);
      continue;
    }

    if (TimeSince(time) > 5 * 1000) {
      ResetMergers(workerA, workerB);
      continue;
    }

    spiritA.move(spiritB.position);
    spiritB.move(spiritA.position);
    spiritA.merge(spiritB);
  }

  Debug();
})();
