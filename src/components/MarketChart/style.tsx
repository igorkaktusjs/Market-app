
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#BDC1CA",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal:10,
  },
  legendRow: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 12,
  },
});
