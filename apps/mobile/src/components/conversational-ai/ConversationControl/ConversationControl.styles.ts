import { StyleSheet } from 'react-native';
import { darkTheme } from '@somni/theme';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: darkTheme.colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonLoading: {
    backgroundColor: darkTheme.colors.primary,
  },
  buttonConnected: {
    backgroundColor: darkTheme.colors.status.error,
  },
});