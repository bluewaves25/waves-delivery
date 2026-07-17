/** Ghana zone pricing (GHS) — Accra-centric delivery tiers */

export default {
  zones: [
    {
      ID: 1,
      NAME: 'Inside Accra',
      AREAS: [] as { NAME: string }[],
      PRICING: {
        SHOPUP_KG05_PRICE: 18,
        SHOPUP_KG1_PRICE: 22,
        SHOPUP_KG2_PRICE: 28,
        SHOPUP_KG3_PRICE: 34,
        SHOPUP_KG4_PRICE: 40,
        SHOPUP_KG5_PRICE: 48,
        SHOPUP_COD: 2,
      },
    },
    {
      ID: 2,
      NAME: 'Greater Accra Suburb',
      AREAS: [] as { NAME: string }[],
      PRICING: {
        SHOPUP_KG05_PRICE: 25,
        SHOPUP_KG1_PRICE: 30,
        SHOPUP_KG2_PRICE: 38,
        SHOPUP_KG3_PRICE: 45,
        SHOPUP_KG4_PRICE: 52,
        SHOPUP_KG5_PRICE: 60,
        SHOPUP_COD: 3,
      },
    },
    {
      ID: 3,
      NAME: 'Outside Accra',
      AREAS: [] as { NAME: string }[],
      PRICING: {
        SHOPUP_KG05_PRICE: 40,
        SHOPUP_KG1_PRICE: 50,
        SHOPUP_KG2_PRICE: 65,
        SHOPUP_KG3_PRICE: 80,
        SHOPUP_KG4_PRICE: 95,
        SHOPUP_KG5_PRICE: 110,
        SHOPUP_COD: 5,
      },
    },
  ],
};
