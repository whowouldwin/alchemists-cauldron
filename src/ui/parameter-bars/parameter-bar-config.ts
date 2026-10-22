import type {
  CauldronParameter,
  ParameterTargetRange,
} from "../../logic/parameter-bar-scale.ts";

export interface ParameterBarConfig {
  readonly name: CauldronParameter;
  readonly label: string;
  readonly supportsNegativeValues: boolean;
}

export const PARAMETER_BAR_CONFIGS: readonly ParameterBarConfig[] = [
  {
    name: "temperature",
    label: "Temperature",
    supportsNegativeValues: true,
  },
  { name: "density", label: "Density", supportsNegativeValues: true },
  {
    name: "magicPower",
    label: "Magic Power",
    supportsNegativeValues: false,
  },
];

export type CauldronTargetRanges = Readonly<
  Record<CauldronParameter, ParameterTargetRange>
>;
