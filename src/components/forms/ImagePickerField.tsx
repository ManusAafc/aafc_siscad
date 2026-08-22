import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../config/constants';

interface ImagePickerFieldProps {
  label: string;
  value: string | null;
  onChange: (uri: string | null) => void;
  error?: string;
  placeholder?: string;
}

export const ImagePickerField: React.FC<ImagePickerFieldProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder = 'Selecionar imagem',
}) => {
  const pickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, maxWidth: 512, maxHeight: 512 },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Erro', response.errorMessage || 'Erro ao selecionar imagem');
          return;
        }
        if (response.assets && response.assets[0]?.uri) {
          onChange(response.assets[0].uri);
        }
      }
    );
  };

  const takePhoto = () => {
    launchCamera(
      { mediaType: 'photo', quality: 0.8, maxWidth: 512, maxHeight: 512 },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Erro', response.errorMessage || 'Erro ao tirar foto');
          return;
        }
        if (response.assets && response.assets[0]?.uri) {
          onChange(response.assets[0].uri);
        }
      }
    );
  };

  const clearImage = () => {
    onChange(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {value ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: value }} style={styles.preview} />
          <TouchableOpacity style={styles.removeButton} onPress={clearImage}>
            <MaterialCommunityIcons name="close-circle" size={24} color={Colors.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
            <MaterialCommunityIcons name="image" size={24} color={Colors.primary} />
            <Text style={styles.pickText}>{placeholder}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickButton} onPress={takePhoto}>
            <MaterialCommunityIcons name="camera" size={24} color={Colors.primary} />
            <Text style={styles.pickText}>Tirar Foto</Text>
          </TouchableOpacity>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
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
  previewContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  pickText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.primary,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
});
