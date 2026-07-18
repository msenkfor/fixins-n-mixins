import "@testing-library/react-native/matchers";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "Light", Medium: "Medium", Heavy: "Heavy" },
}));

jest.mock("expo-symbols", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SymbolView: ({ name, ...props }: { name: string }) =>
      React.createElement(View, {
        ...props,
        accessibilityLabel: `symbol-${name}`,
        testID: `symbol-${name}`,
      }),
  };
});

jest.mock("lottie-react-native", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: object) =>
      React.createElement(View, { ...props, testID: "lottie" }),
  };
});

jest.mock("expo-image", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    Image: (props: object) =>
      React.createElement(View, { ...props, testID: "expo-image" }),
  };
});

jest.mock("expo-router", () => {
  const { createExpoRouterMock } = require("./__tests__/helpers/expo-router-mock");
  return createExpoRouterMock();
});

jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Animated = {
    View,
    createAnimatedComponent: (Component: unknown) => Component,
  };
  return {
    __esModule: true,
    default: Animated,
    useSharedValue: (v: unknown) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withRepeat: (v: unknown) => v,
    withTiming: (v: unknown) => v,
    withSequence: (...args: unknown[]) => args[0],
    Easing: { linear: jest.fn(), inOut: jest.fn(), ease: jest.fn() },
    FadeIn: {},
    FadeOut: {},
  };
});

jest.mock("react-native-worklets", () => ({}));

jest.mock("react-native-safe-area-context", () => {
  const inset = { top: 47, right: 0, bottom: 34, left: 0 };
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => inset,
  };
});
