export interface MarketplacePreset {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  aspectRatio: string;
  defaultBgColor: string;
  description: string;
  isProOnly?: boolean;
}

export const MARKETPLACE_PRESETS: MarketplacePreset[] = [
  {
    id: 'amazon',
    name: 'Amazon 1:1',
    platform: 'Amazon',
    width: 2000,
    height: 2000,
    aspectRatio: '1:1',
    defaultBgColor: '#FFFFFF',
    description: 'Complies with Amazon pure white background & 2000px zoom requirement.',
  },
  {
    id: 'ebay',
    name: 'eBay 1600px',
    platform: 'eBay',
    width: 1600,
    height: 1600,
    aspectRatio: '1:1',
    defaultBgColor: '#FFFFFF',
    description: 'Optimal 1600px square format for eBay mobile and desktop galleries.',
  },
  {
    id: 'etsy',
    name: 'Etsy 4:3',
    platform: 'Etsy',
    width: 2000,
    height: 1500,
    aspectRatio: '4:3',
    defaultBgColor: '#F5F5F5',
    description: 'Standard Etsy listing ratio to prevent thumbnail cropping in search.',
    isProOnly: true,
  },
  {
    id: 'shopify',
    name: 'Shopify Square',
    platform: 'Shopify',
    width: 2048,
    height: 2048,
    aspectRatio: '1:1',
    defaultBgColor: '#FFFFFF',
    description: 'High-resolution 2048px square recommended by Shopify theme stores.',
    isProOnly: true,
  },
  {
    id: 'vinted_depop',
    name: 'Vinted / Depop',
    platform: 'Vinted / Depop',
    width: 1200,
    height: 1200,
    aspectRatio: '1:1',
    defaultBgColor: '#FAFAFA',
    description: 'Lightweight square format optimized for peer-to-peer apparel feeds.',
    isProOnly: true,
  },
];
