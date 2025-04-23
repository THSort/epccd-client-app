import { StyleSheet } from 'react-native';
import {hp} from '../../../../utils/responsive.util.ts';

export const styles = StyleSheet.create({
  scrollContainer: {
    marginTop: hp(10),
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 5,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 3,
    minWidth: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: '#FFD700',
  },
  optionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: 'black',
    fontWeight: 'bold',
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
