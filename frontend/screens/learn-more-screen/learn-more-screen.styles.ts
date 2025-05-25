import { StyleSheet } from 'react-native';
import { colors } from '../../App.styles';
import { hp, wp, fontScale } from '../../utils/responsive.util';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(15),
    borderBottomColor: colors.secondaryWithDarkBg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    alignSelf: 'center',
    paddingHorizontal: wp(15),
    marginRight: wp(20),
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(15),
    paddingBottom: hp(20),
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: hp(15),
    gap:  wp(20),
  },
  lastRow: {
    width: '100%',
    marginBottom: hp(15),
    paddingHorizontal: wp(10),
  },
  topicContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(15),
  },
  placeholderText: {
    color: colors.primaryWithDarkBg,
    fontSize: fontScale(18),
    textAlign: 'center',
  },
});
