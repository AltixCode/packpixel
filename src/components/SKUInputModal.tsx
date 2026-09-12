import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Tag, Check, X } from 'lucide-react-native';
import { useImageStore } from '../store/useImageStore';

interface SKUInputModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SKUInputModal: React.FC<SKUInputModalProps> = ({ visible, onClose }) => {
  const { skuPrefix, setSkuPrefix } = useImageStore();
  const [tempSku, setTempSku] = useState(skuPrefix);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSkuPrefix(tempSku || 'SKU');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/75 items-center justify-center px-6">
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-blue-500/20 p-2 rounded-xl mr-2">
                <Tag size={18} color="#60A5FA" />
              </View>
              <Text className="text-lg font-bold text-white">SKU Prefix</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text className="text-slate-400 text-xs mb-3">
            Images will be exported sequentially using this prefix (e.g. {tempSku || 'SKU'}_01.jpg,{' '}
            {tempSku || 'SKU'}_02.jpg).
          </Text>

          <TextInput
            value={tempSku}
            onChangeText={setTempSku}
            placeholder="e.g. SHIRT_BLACK"
            placeholderTextColor="#64748B"
            autoCapitalize="characters"
            className="bg-slate-950 border border-slate-700 text-white font-mono px-4 py-3 rounded-xl text-base mb-5"
          />

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-slate-800 py-3 rounded-xl items-center mr-2"
            >
              <Text className="text-slate-300 font-semibold text-sm">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 bg-blue-600 py-3 rounded-xl items-center flex-row justify-center ml-2"
            >
              <Check size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-sm ml-1.5">Apply SKU</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
