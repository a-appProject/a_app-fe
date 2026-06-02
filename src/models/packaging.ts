const packagingMap: Record<string, string> = {
  Box: 'Кор.',
  Pack: 'Пак.',
  Package: 'Уп.',
  Roll: 'Рулон',
  Piece: 'Шт.',
  Keg: 'Кег.',
  Kg: 'Кг.',
  '1kg': '1кг',
  '300pcs': '300шт',
  Sleeve: 'Рук.'
};

export default packagingMap

export type Packaging = {
  count: number,
  id: string,
  name: string
}