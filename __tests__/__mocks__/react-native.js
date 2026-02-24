// React Native mock for Jest
module.exports = {
  Platform: { OS: 'ios', select: (opts) => opts.ios || opts.default },
  Dimensions: { get: () => ({ width: 390, height: 844 }) },
  StyleSheet: { create: (s) => s },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Linking: { canOpenURL: jest.fn().mockResolvedValue(false) },
  Alert: { alert: jest.fn() },
};
