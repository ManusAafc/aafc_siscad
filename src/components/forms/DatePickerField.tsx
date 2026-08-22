import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../config/constants';
import { formatDate } from '../../utils/formatters';

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
}

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  error,
  required,
  placeholder = 'Selecione uma data',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(value?.getDate() || 1);
  const [selectedMonth, setSelectedMonth] = useState(value?.getMonth() ?? 0);
  const [selectedYear, setSelectedYear] = useState(value?.getFullYear() || new Date().getFullYear());

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    onChange(date);
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.dateText, !value && styles.placeholder]}>
          {value ? formatDate(value.toISOString()) : placeholder}
        </Text>
        <MaterialCommunityIcons
          name="calendar"
          size={20}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={showPicker} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Dia</Text>
                <FlatList
                  data={DAYS}
                  keyExtractor={(item) => String(item)}
                  style={styles.pickerList}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.pickerItem, item === selectedDay && styles.pickerItemSelected]}
                      onPress={() => setSelectedDay(item)}
                    >
                      <Text style={[styles.pickerItemText, item === selectedDay && styles.pickerItemTextSelected]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Mês</Text>
                <FlatList
                  data={MONTHS}
                  keyExtractor={(item) => item}
                  style={styles.pickerList}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={[styles.pickerItem, index === selectedMonth && styles.pickerItemSelected]}
                      onPress={() => setSelectedMonth(index)}
                    >
                      <Text style={[styles.pickerItemText, index === selectedMonth && styles.pickerItemTextSelected]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Ano</Text>
                <FlatList
                  data={YEARS}
                  keyExtractor={(item) => String(item)}
                  style={styles.pickerList}
                  showsVerticalScrollIndicator={false}
                  initialScrollIndex={YEARS.indexOf(selectedYear)}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.pickerItem, item === selectedYear && styles.pickerItemSelected]}
                      onPress={() => setSelectedYear(item)}
                    >
                      <Text style={[styles.pickerItemText, item === selectedYear && styles.pickerItemTextSelected]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  required: {
    color: Colors.error,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
  },
  dateText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  placeholder: {
    color: Colors.textTertiary,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pickerRow: {
    flexDirection: 'row',
    padding: 16,
    height: 250,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  pickerList: {
    flex: 1,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: Colors.primary,
  },
  pickerItemText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  pickerItemTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  confirmButton: {
    marginHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
