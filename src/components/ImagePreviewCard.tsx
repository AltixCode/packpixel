import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { ImageAsset } from '../store/useImageStore';

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
  return (
    <View className="w-[31%] aspect-square bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative mb-2.5">
      <Image
        source={{ uri: image.uri }}
        className="w-full h-full"
        resizeMode="cover"
      />
      {/* Index Badge */}
      <View className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded">
        <Text className="text-[10px] font-mono font-bold text-white">#{index + 1}</Text>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        onPress={() => onRemove(image.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="absolute top-1 right-1 bg-black/70 p-1 rounded-full"
      >
        <X size={12} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
};
