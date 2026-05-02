export interface AmazonProductData {
  imageUrl: string;
  title: string;
  price: number;
  sold?: boolean;
}

export interface AmazonProductDocument extends AmazonProductData {
  id: string;
}
