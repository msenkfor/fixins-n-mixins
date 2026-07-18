/** Shared expo-router mock: Color stubs for theme + configurable router. */

const Color = {
  ios: {
    systemBackground: "#FFFAF5",
    secondarySystemBackground: "#FFFFFF",
    systemOrange: "#E86A33",
    systemGreen: "#5B8C5A",
    systemRed: "#D4534B",
    label: "#2D2016",
    secondaryLabel: "#8A7968",
    tertiaryLabel: "#B8A898",
    separator: "#F0E6DA",
  },
  android: {
    dynamic: {
      surface: "#FFFAF5",
      surfaceContainer: "#FFFFFF",
      primary: "#E86A33",
      tertiary: "#5B8C5A",
      error: "#D4534B",
      onSurface: "#2D2016",
      onSurfaceVariant: "#8A7968",
      outline: "#B8A898",
      outlineVariant: "#F0E6DA",
    },
  },
};

type RouterFns = {
  push?: jest.Mock;
  replace?: jest.Mock;
  back?: jest.Mock;
  canGoBack?: jest.Mock;
};

export function createExpoRouterMock(router: RouterFns = {}) {
  return {
    Color,
    useRouter: () => ({
      push: router.push ?? jest.fn(),
      replace: router.replace ?? jest.fn(),
      back: router.back ?? jest.fn(),
      canGoBack: router.canGoBack ?? jest.fn(() => true),
    }),
    useLocalSearchParams: () => ({}),
  };
}

export { Color };
