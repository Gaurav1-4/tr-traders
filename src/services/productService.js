import { isMockMode, db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

// Heritage Signature Collection (Original 5 Pieces)
export const HERITAGE_COLLECTION = [
  {
    name: 'Indigo Blue Embroidered Suit Set',
    category: 'Cotton',
    fabric: 'Premium Cotton',
    occasion: ['Daily Wear', 'Casual'],
    description: 'An elegant indigo blue straight cut suit with delicate white geometric and floral motifs. Includes a beautiful matching printed dupatta.',
    price: 3450,
    sizes: ['M', 'L', 'XL'],
    colors: ['Indigo Blue'],
    stock: 'in_stock',
    images: ['/images/suit-blue.jpg'],
    status: 'active',
    featured: true
  },
  {
    name: 'Viscose Glass Organza Tie-Dye Suit',
    category: 'Festive',
    fabric: 'Glass Organza',
    occasion: ['Haldi', 'Mehendi', 'Party'],
    description: 'A vibrant tie-dye pattern on luxurious glass organza. Features heavy hand-embroidered neckline with mirror and zardozi work.',
    price: 4200,
    sizes: ['S', 'M', 'L'],
    colors: ['Multi', 'Red'],
    stock: 'low_stock',
    images: ['/images/suit-tie-dye.jpg'],
    status: 'active',
    featured: true
  },
  {
    name: 'Raghav Lisha Premium Khatli Set',
    category: 'Formal',
    fabric: 'Silk Blend',
    occasion: ['Reception', 'Festive'],
    description: 'Sea-foam green premium suit featuring exquisite handbead and mirror work (Khatli style). Comes with a digital print dupatta.',
    price: 5800,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Sea-Foam Green', 'Gold'],
    stock: 'in_stock',
    images: ['/images/suit-khatli.jpg'],
    status: 'active',
    featured: false
  },
  {
    name: 'Dee Rathila Signature Red Silk Suit',
    category: 'Bridal',
    fabric: 'Pure Silk',
    occasion: ['Wedding', 'Reception'],
    description: 'A breathtaking deep red pure silk kameez featuring an iconic golden bow motif in heavy zari embroidery.',
    price: 12500,
    sizes: ['Custom Fit'],
    colors: ['Crimson Red'],
    stock: 'in_stock',
    images: ['/images/suit-red-silk.jpg'],
    status: 'active',
    featured: true
  },
  {
    name: 'Premium Print Unstitched Materials',
    category: 'Casual',
    fabric: 'Georgette Blend',
    occasion: ['Daily Wear', 'Office'],
    description: 'High-quality unstitched fabric sets featuring vibrant geometric and abstract prints.',
    price: 2800,
    sizes: ['Unstitched'],
    colors: ['Blue', 'Pink'],
    stock: 'in_stock',
    images: ['/images/suit-unstitched.jpg'],
    status: 'active',
    featured: false
  }
];

const getMockData = () => {
  const stored = localStorage.getItem('tr_traders_products');
  return stored ? JSON.parse(stored) : HERITAGE_COLLECTION.map((p, i) => ({ ...p, id: `h${i}`, createdAt: new Date().toISOString() }));
};

export const getProducts = async (includeHidden = false) => {
  if (isMockMode) {
    const products = getMockData();
    return includeHidden ? products : products.filter(p => p.status === 'active');
  }
  
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    let products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return includeHidden ? products : products.filter(p => p.status === 'active');
  } catch (error) {
    console.error("Cloud Error:", error);
    return getMockData();
  }
};

export const getProductById = async (id) => {
  if (isMockMode || id.startsWith('h')) {
    return getMockData().find(p => p.id === id) || null;
  }
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) { return null; }
};

export const addProduct = async (productData) => {
  const data = { ...productData, createdAt: new Date().toISOString() };
  if (isMockMode) {
    const products = getMockData();
    const newProd = { ...data, id: `p${Date.now()}` };
    localStorage.setItem('tr_traders_products', JSON.stringify([newProd, ...products]));
    return newProd;
  }
  const docRef = await addDoc(collection(db, "products"), data);
  return { id: docRef.id, ...data };
};

export const updateProduct = async (id, updates) => {
  if (isMockMode || id.startsWith('h')) {
    const products = getMockData();
    const idx = products.findIndex(p => p.id === id);
    if (idx > -1) {
      products[idx] = { ...products[idx], ...updates };
      localStorage.setItem('tr_traders_products', JSON.stringify(products));
      return products[idx];
    }
  }
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, updates);
  return { id, ...updates };
};

export const deleteProduct = async (id) => {
  if (isMockMode || id.startsWith('h')) {
    const products = getMockData().filter(p => p.id !== id);
    localStorage.setItem('tr_traders_products', JSON.stringify(products));
    return true;
  }
  await deleteDoc(doc(db, "products", id));
  return true;
};
