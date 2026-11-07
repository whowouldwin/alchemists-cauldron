interface ReactionNotes {
  readonly condition: string;
  readonly effect: string;
}

export const REACTION_NOTES: Readonly<Record<string, ReactionNotes>> = {
  bubbling: {
    condition: "Fairy Dust + Caustic Acid.",
    effect: "Multiplies Magic Power by 1.5 and costs 10 seconds on activation.",
  },
  "solar-frost": {
    condition: "Dragon Tears + Frost Lotus.",
    effect: "Sets Temperature to 0 and multiplies Density by 1.2.",
  },
  "volatile-mix": {
    condition: "Phoenix Feather + Essence of the Void.",
    effect: "Causes an explosion: lose one life and empty the cauldron.",
  },
  "rooted-steam": {
    condition: "Mandrake Root + Toad Slime.",
    effect: "Multiplies Density by 1.25 and Magic Power by 0.9.",
  },
  "ashen-bloom": {
    condition: "Phoenix Feather + Fairy Dust.",
    effect: "Adds 10 to Temperature and multiplies Magic Power by 1.25.",
  },
  annihilation: {
    condition:
      "At least one ingredient above +15 Temperature and another below −15.",
    effect: "Sets Temperature to 0 and doubles Density.",
  },
  "pressure-spike": {
    condition: "Total Density is at least 70.",
    effect: "Sets Density to 70 and multiplies Magic Power by 1.1.",
  },
  "magma-flux": {
    condition: "Total Temperature is at least +60.",
    effect: "Multiplies Density by 0.9 and Magic Power by 1.2.",
  },
  "deep-freeze": {
    condition: "Total Temperature is −20 or lower.",
    effect: "Multiplies Density by 1.15 and Magic Power by 0.85.",
  },
  "arcane-saturation": {
    condition: "Total Magic Power is at least 80.",
    effect: "Adds 5 to Temperature and sets Magic Power to 80.",
  },
  "steam-burst": {
    condition:
      "Dragon Tears + Caustic Acid, with total Temperature at least +35.",
    effect: "Adds 10 to Temperature and costs 5 seconds on activation.",
  },
  "black-ice": {
    condition:
      "Frost Lotus + Essence of the Void, with total Density at 0 or lower.",
    effect: "Subtracts 10 from Temperature and multiplies Magic Power by 1.2.",
  },
  "heavy-spark": {
    condition: "Fairy Dust + Toad Slime, with total Density at least 40.",
    effect: "Multiplies Density by 1.2 and Magic Power by 1.1.",
  },
  "burning-root": {
    condition:
      "Mandrake Root + Phoenix Feather, with total Temperature at least +40.",
    effect: "Adds 15 to Temperature and multiplies Density by 0.9.",
  },
  "void-resonance": {
    condition:
      "Essence of the Void + Dragon Tears, with total Magic Power at least 50.",
    effect: "Subtracts 5 from Temperature and multiplies Magic Power by 1.3.",
  },
};
