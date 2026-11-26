import api from "./api.js";

// "kitchen-accessories" / "men's clothing" -> "Kitchen Accessories" / "Men's Clothing"
const label = (name) =>
  name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c, i, s) => (s[i - 1] === "'" ? c : c.toUpperCase()));

// Map a backend Product (with category + images) to the shape the UI uses.
export function toUiProduct(p) {
  const price = Number(p.price);
  const images = [...(p.images || [])].sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category?.name ? label(p.category.name) : "Other",
    image: images[0]?.imageUrl || "",
    images: images.map((i) => i.imageUrl).filter(Boolean),
    price,
    mrp: p.compareAtPrice ? Number(p.compareAtPrice) : price,
    stock: p.stock,
    brand: "",
    fast: p.stock > 20,
  };
}

export const getProducts = () =>
  api.get("/products").then((r) => (r.data.products || []).map(toUiProduct));
