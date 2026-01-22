
import { Product, Supermarket, PriceRecord } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', productName: 'Arroz Agulhinha Tipo 1 Tio João 5kg', barcode: '7891234567890', category: 'Mercearia', brand: 'Tio João', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'p2', productName: 'Feijão Carioca Camil 1kg', barcode: '7891234567891', category: 'Mercearia', brand: 'Camil', imageUrl: 'https://images.unsplash.com/photo-1551462147-37885acc3c41?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'p3', productName: 'Leite Integral Itambé 1L', barcode: '7891234567892', category: 'Laticínios', brand: 'Itambé', imageUrl: 'https://images.unsplash.com/photo-1550583724-125581fe2f8a?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'p4', productName: 'Detergente Líquido Ypê Neutro 500ml', barcode: '7891234567893', category: 'Limpeza', brand: 'Ypê', imageUrl: 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'p5', productName: 'Café Melitta Vácuo 500g', barcode: '7891234567894', category: 'Mercearia', brand: 'Melitta', imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'p6', productName: 'Pão de Forma Pullman 450g', barcode: '7891234567895', category: 'Padaria', brand: 'Pullman', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'p7', productName: 'Sabonete Dove Original 90g', barcode: '7891234567896', category: 'Higiene', brand: 'Dove', imageUrl: 'https://images.unsplash.com/photo-1626784213176-f48d80bb81e6?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'p8', productName: 'Banana Prata kg', barcode: '7891234567897', category: 'Hortifruti', brand: 'Produtor Local', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ad990261a7ee?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'p9', productName: 'Tomate Italiano kg', barcode: '7891234567898', category: 'Hortifruti', brand: 'Horta Fresca', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'p10', productName: 'Cerveja Heineken Long Neck 330ml', barcode: '7891234567900', category: 'Bebidas Alcoólicas', brand: 'Heineken', imageUrl: 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'p11', productName: 'Vinho Tinto Casillero del Diablo Cabernet 750ml', barcode: '7891234567901', category: 'Bebidas Alcoólicas', brand: 'Concha y Toro', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=300&h=300' },
];

export const INITIAL_SUPERMARKETS: Supermarket[] = [
  { id: 's1', name: 'Supermercado Econômico', logoUrl: 'https://picsum.photos/seed/market1/100/100' },
  { id: 's2', name: 'Hipermercado Preço Bom', logoUrl: 'https://picsum.photos/seed/market2/100/100' },
];

export const INITIAL_PRICES: PriceRecord[] = [
  { id: 'pr1', productId: 'p1', supermarketId: 's1', price: 24.90, originalPrice: 29.90, stock: 50, lastUpdated: Date.now() },
  { id: 'pr2', productId: 'p1', supermarketId: 's2', price: 26.50, stock: 20, lastUpdated: Date.now() },
  { id: 'pr3', productId: 'p2', supermarketId: 's1', price: 7.80, stock: 100, lastUpdated: Date.now() },
  { id: 'pr4', productId: 'p2', supermarketId: 's2', price: 5.95, originalPrice: 8.50, stock: 15, lastUpdated: Date.now() },
  { id: 'pr5', productId: 'p3', supermarketId: 's1', price: 4.50, stock: 60, lastUpdated: Date.now() },
  { id: 'pr6', productId: 'p3', supermarketId: 's2', price: 3.99, originalPrice: 5.20, stock: 40, lastUpdated: Date.now() },
  { id: 'pr7', productId: 'p6', supermarketId: 's1', price: 6.50, originalPrice: 9.00, stock: 25, lastUpdated: Date.now() },
  { id: 'pr8', productId: 'p8', supermarketId: 's1', price: 4.90, originalPrice: 6.50, stock: 80, lastUpdated: Date.now() },
  { id: 'pr9', productId: 'p8', supermarketId: 's2', price: 5.20, stock: 35, lastUpdated: Date.now() },
  { id: 'pr10', productId: 'p9', supermarketId: 's1', price: 8.90, stock: 45, lastUpdated: Date.now() },
  { id: 'pr11', productId: 'p9', supermarketId: 's2', price: 7.45, originalPrice: 9.90, stock: 12, lastUpdated: Date.now() },
  { id: 'pr12', productId: 'p10', supermarketId: 's1', price: 5.99, stock: 200, lastUpdated: Date.now() },
  { id: 'pr13', productId: 'p10', supermarketId: 's2', price: 5.49, originalPrice: 6.50, stock: 100, lastUpdated: Date.now() },
  { id: 'pr14', productId: 'p11', supermarketId: 's1', price: 45.90, originalPrice: 59.90, stock: 30, lastUpdated: Date.now() },
];
