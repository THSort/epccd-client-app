import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  leftButton: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightButton: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  selectedButton: {
    backgroundColor: '#FFD700',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  selectedButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
}); 