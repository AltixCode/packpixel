# PackPixel — Implementation Plan & Technical Blueprint

## 1. Product Summary & Value Proposition
* **Title:** PackPixel: Batch Photo Resizer
* **Subtitle:** E-Commerce & Marketplace Prep
* **Price:** $9.99 Lifetime Non-Consumable IAP
* **Keywords:** batch resize, photo resizer, image compressor, etsy photo size, amazon product photo, product photo prep, bulk crop, sku rename
* **Description:** PackPixel automates batch canvas padding, aspect ratio conformances, and SKU file renaming on-device in a single workflow.

## 2. Target Navigation & Screen Architecture
* `app/_layout.tsx`: Dark theme wrapper, safe area context, purchases initialization.
* `app/index.tsx`: Primary functional interface.
* `app/paywall.tsx`: Pro Lifetime unlock paywall with anti-subscription copy: *"No Subscriptions. No Accounts. 100% On-Device Privacy. Own It Forever."*

## 3. Algorithmic & On-Device Processing
All compute executes strictly locally using on-device modules.

## 4. Phased Roadmap
* Phase 0: Scaffolding, configuration, and boilerplate (Complete)
* Phase 1: Core engine and UI implementation
* Phase 2: RevenueCat and offline persistence integration
* Phase 3: Simulator verification & CI/CD deployment
