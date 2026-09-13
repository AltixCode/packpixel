import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { ImageAsset } from '../store/useImageStore';
import { useTheme } from '../theme/useTheme';

interface ImagePreviewCardProps {
  image: ImageAsset;
  index: number;
  onRemove: (id: string) => void;
}

export const ImagePreviewCard: React.FC<ImagePreviewCardProps> = ({
  image,
  index,
  onRemove,
}) => {
  const theme = useTheme();
  return (
    <View className="w-[31%] aspect-square border rounded-xl overflow-hidden relative mb-2.5" style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}>
      <Image
        source={{ uri: image.uri }}
        className="w-full h-full"
        resizeMode="cover"
      />
      {/* Index Badge */}
      <View className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded">
        <Text className="text-[10px] font-mono font-bold" style={{ color: theme.text }}>#{index + 1}</Text>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        onPress={() => onRemove(image.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="absolute top-1 right-1 bg-black/70 p-1 rounded-full"
      >
        <X size={12} color={theme.danger} />
      </TouchableOpacity>
    </View>
  );
};
