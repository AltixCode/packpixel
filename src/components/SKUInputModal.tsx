import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Tag, Check, X } from 'lucide-react-native';
import { useImageStore } from '../store/useImageStore';
import { t } from '../i18n';
import { useTheme } from '../theme/useTheme';

interface SKUInputModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SKUInputModal: React.FC<SKUInputModalProps> = ({ visible, onClose }) => {
  const theme = useTheme();
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
        <View className="border rounded-3xl p-6 w-full max-w-sm" style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-blue-500/20 p-2 rounded-xl mr-2">
                <Tag size={18} color={theme.primary} />
              </View>
              <Text className="text-lg font-bold" style={{ color: theme.text }}>{t('skuTitle')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <Text className="text-xs mb-3" style={{ color: theme.textSecondary }}>
            {t('skuSubtitle', { prefix: tempSku || 'SKU' })}
          </Text>

          <TextInput
            value={tempSku}
            onChangeText={setTempSku}
            placeholder={t('skuPlaceholder')}
            placeholderTextColor="#64748B"
            autoCapitalize="characters"
            className="border font-mono px-4 py-3 rounded-xl text-base mb-5" style={{ backgroundColor: theme.background, borderColor: theme.cardBorder, color: theme.text }}
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3 rounded-xl items-center mr-2" style={{ backgroundColor: theme.controlSurface }}
            >
              <Text className="font-semibold text-sm" style={{ color: theme.textSecondary }}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 bg-blue-600 py-3 rounded-xl items-center flex-row justify-center ml-2"
            >
              <Check size={16} color={theme.onPrimary} />
              <Text className="font-bold text-sm ml-1.5" style={{ color: theme.onPrimary }}>{t('applySku')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
