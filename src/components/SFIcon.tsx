/**
 * Thin wrapper around expo-symbols SymbolView for consistent sizing and defaults.
 */
import { SymbolView, type SFSymbol, type SymbolWeight } from "expo-symbols";
import { type ColorValue, type ViewStyle } from "react-native";

interface SFIconProps {
  name: SFSymbol;
  size?: number;
  tintColor?: ColorValue;
  weight?: SymbolWeight;
  style?: ViewStyle;
}

export function SFIcon({
  name,
  size = 20,
  tintColor,
  weight = "regular",
  style,
}: SFIconProps) {
  return (
    <SymbolView
      name={name}
      tintColor={tintColor as string}
      weight={weight}
      style={[{ width: size, height: size }, style]}
    />
  );
}
