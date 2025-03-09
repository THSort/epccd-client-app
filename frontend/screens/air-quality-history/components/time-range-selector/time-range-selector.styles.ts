import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 5,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: '#FFD700',
  },
  optionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: 'black',
    fontWeight: 'bold',
  },
}); 