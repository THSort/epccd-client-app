import { StyleSheet } from 'react-native';
import { colors } from '../../../../App.styles';
import { hp, wp } from '../../../../utils/responsive.util';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    padding: hp(15),
    width: wp(150),
    height: wp(150),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryWithDarkBg,
  },
  fullWidthContainer: {
    width: '100%',
    height: wp(100),
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: hp(15),
  },
  title: {
    textAlign: 'center',
  },
}); 