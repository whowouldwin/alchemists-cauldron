import cauldronIcon from "../../assets/cauldron.svg";
import causticAcidIcon from "../../assets/ingredients/caustic-acid.svg";
import dragonTearsIcon from "../../assets/ingredients/dragon-tears.svg";
import essenceOfTheVoidIcon from "../../assets/ingredients/essence-of-the-void.svg";
import fairyDustIcon from "../../assets/ingredients/fairy-dust.svg";
import frostLotusIcon from "../../assets/ingredients/frost-lotus.svg";
import mandrakeRootIcon from "../../assets/ingredients/mandrake-root.svg";
import phoenixFeatherIcon from "../../assets/ingredients/phoenix-feather.svg";
import toadSlimeIcon from "../../assets/ingredients/toad-slime.svg";

export const CAULDRON_ICON = cauldronIcon;

export const INGREDIENT_ICONS: Readonly<Record<string, string>> = {
  "dragon-tears": dragonTearsIcon,
  "fairy-dust": fairyDustIcon,
  "frost-lotus": frostLotusIcon,
  "mandrake-root": mandrakeRootIcon,
  "caustic-acid": causticAcidIcon,
  "essence-of-the-void": essenceOfTheVoidIcon,
  "phoenix-feather": phoenixFeatherIcon,
  "toad-slime": toadSlimeIcon,
};
