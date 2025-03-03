import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import type { LocationModalProps } from './location-modal.types';
import { styles } from './location-modal.styles';

const areas = [
  { name: 'Lahore', locations: ['Lahore location 1', 'Lahore location 2'] },
  { name: 'Islamabad', locations: [] },
  { name: 'Karachi', locations: [] },
];

export function LocationModal({ visible, onClose }: LocationModalProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.container}>
        <View style={styles.overlay} />
        <View style={styles.modalContent}>
          <Text style={styles.title}>Area</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <FlatList
            data={areas}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View>
                <TouchableOpacity
                  onPress={() => setSelectedArea(item.name)}
                  style={styles.areaButton}
                >
                  <Text style={styles.areaText}>{item.name}</Text>
                </TouchableOpacity>
                {selectedArea === item.name &&
                  item.locations.map((location) => (
                    <TouchableOpacity key={location} style={styles.locationButton}>
                      <Text style={styles.locationText}>{location}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}
