import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    
    width: '100%',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap', 
    gap: 16,
  },
  checkboxColumn: {
    flex: 1,
  },
  buttonColumn: {
    alignSelf: 'flex-end',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 2,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0A0A7C',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: 400
  },
  warning: {
    textAlign: 'center',
    color: 'red',
    marginTop: 12,
    fontSize: 14,
  },
});




