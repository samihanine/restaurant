export const priceToString = (price?: number) => `${(price || 0).toFixed(2).toString().replace('.', ',')}€`;
