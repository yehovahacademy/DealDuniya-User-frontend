// Sample data — no longer used by the UI (products come from /api/products). Helpers below are shared.
export const PRODUCTS = [
  { id: 1, category: "Electronics", image: "/images/p1.jpg", name: "Sony WH-CH720N Wireless Headphones", brand: "Sony", rating: 4.5, reviews: 12840, price: 7990, mrp: 14990, fast: true },
  { id: 2, category: "Mobiles", image: "/images/p2.jpg", name: "Nova X5 5G (8GB/256GB)", brand: "Nova", rating: 4.4, reviews: 9210, price: 24999, mrp: 32999, fast: true },
  { id: 3, category: "Fashion", image: "/images/p3.jpg", name: "AirStride Running Shoes – Men", brand: "AirStride", rating: 4.2, reviews: 5320, price: 2199, mrp: 4999, fast: false },
  { id: 4, category: "Home", image: "/images/p4.jpg", name: "Oakline 3-Seater Fabric Sofa", brand: "Oakline", rating: 4.3, reviews: 1890, price: 18499, mrp: 29999, fast: false },
  { id: 5, category: "Beauty", image: "/images/p5.jpg", name: "Glow Vitamin C Serum 30ml", brand: "Glow", rating: 4.6, reviews: 22100, price: 499, mrp: 899, fast: true },
  { id: 6, category: "Grocery", image: "/images/p6.jpg", name: "Farm Fresh Almonds 1kg", brand: "FarmFresh", rating: 4.5, reviews: 8700, price: 649, mrp: 899, fast: true },
  { id: 7, category: "Sports", image: "/images/p7.jpg", name: "ProFlex Yoga Mat 6mm", brand: "ProFlex", rating: 4.4, reviews: 3120, price: 699, mrp: 1499, fast: false },
  { id: 8, category: "Books", image: "/images/p8.jpg", name: "Atomic Habits – Paperback", brand: "Penguin", rating: 4.8, reviews: 56200, price: 399, mrp: 799, fast: true },
  { id: 9, category: "Toys", image: "/images/p9.jpg", name: "BuildBlocks 500-piece Set", brand: "Brix", rating: 4.5, reviews: 4020, price: 899, mrp: 1799, fast: false },
  { id: 10, category: "Auto", image: "/images/p10.jpg", name: "DashCam Pro 2K Night Vision", brand: "DriveX", rating: 4.1, reviews: 2760, price: 2999, mrp: 5999, fast: true },
  { id: 11, category: "Electronics", image: "/images/p11.jpg", name: "PulseFit AMOLED Smartwatch", brand: "PulseFit", rating: 4.3, reviews: 15400, price: 2499, mrp: 6999, fast: true },
  { id: 12, category: "Electronics", image: "/images/p12.jpg", name: 'Lumen 14" Laptop i5 16GB', brand: "Lumen", rating: 4.4, reviews: 3980, price: 48990, mrp: 62990, fast: false },
  { id: 13, category: "Fashion", image: "/images/p13.jpg", name: "Linen Summer Dress – Women", brand: "Weave", rating: 4.2, reviews: 2210, price: 1299, mrp: 2599, fast: false },
  { id: 14, category: "Home", image: "/images/p14.jpg", name: "Brew+ Espresso Maker", brand: "Brew+", rating: 4.2, reviews: 1760, price: 5999, mrp: 9999, fast: false },
];

export const CATEGORIES = ["Electronics", "Mobiles", "Fashion", "Home", "Beauty", "Grocery", "Sports", "Books", "Toys", "Auto"].map(
  (name) => ({ name, image: `/images/cat-${name.toLowerCase()}.jpg` })
);

export const BRANDS = [
  ["Sony", "Audio"], ["Nova", "Mobiles"], ["Oakline", "Furniture"],
  ["Glow", "Beauty"], ["PulseFit", "Wearables"], ["Penguin", "Books"],
];

export const POPULAR_SEARCHES = ["iPhone 17", "smart TV", "school bags", "protein powder"];

export const inr = (n) => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
export const discount = (p) => (p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0);
// Works for numeric ids and the backend's string ids.
export const tint = (p) => "c" + ([...String(p.id)].reduce((h, ch) => h + ch.charCodeAt(0), 0) % 4);
export const findProduct = (id) => PRODUCTS.find((p) => p.id === Number(id));
