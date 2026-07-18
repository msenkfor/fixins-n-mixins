import type { SFSymbol } from "expo-symbols";
import { View, Text } from "react-native";
import { SFIcon } from "@/src/components/sf-icon";
import { colors, fonts } from "@/src/theme";

interface MetaItemProps {
  icon: SFSymbol;
  label: string;
  value: string;
}

export function MetaItem({ icon, label, value }: MetaItemProps) {
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <SFIcon
        name={icon}
        size={18}
        tintColor={colors.primary as string}
        style={{ marginBottom: 2 }}
      />
      <Text
        style={{
          fontFamily: fonts.body.bold,
          fontSize: 17,
          color: colors.primary,
          fontVariant: ["tabular-nums"],
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: fonts.body.medium,
          fontSize: 11,
          color: colors.textMuted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
