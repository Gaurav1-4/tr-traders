import { isMockMode, db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

// 🏛️ THE SINGLE SOURCE OF TRUTH (Heritage IDs are hardcoded to avoid any sync mismatch)
export const HERITAGE_COLLECTION = [
  {
    id: 'h0',
    name: 'Indigo Blue Embroidered Suit Set',
    category: 'Suits',
    fabric: 'Cotton',
    occasion: ['Daily Wear'],
    description: 'An elegant indigo blue straight cut suit with delicate white motifs.',
    price: 3450,
    sizes: ['M', 'L', 'XL'],
    colors: ['Indigo Blue'],
    stock: 'in_stock',
    images: ['/images/suit-blue.jpg'],
    status: 'active',
    featured: true
  },
  {
    id: 'h1',
    name: 'Viscose Glass Organza Tie-Dye Suit',
    category: 'Festive',
    fabric: 'Organza',
    occasion: ['Party'],
    description: 'A vibrant tie-dye pattern on luxurious glass organza with hand-embroidered neckline.',
    price: 4200,
    sizes: ['S', 'M'],
    colors: ['Multi'],
    stock: 'low_stock',
    images: ['/images/suit-tie-dye.jpg'],
    status: 'active',
    featured: true
  },
  {
    id: 'h2',
    name: 'Raghav Lisha Premium Khatli Set',
    category: 'Suits',
    fabric: 'Silk Blend',
    occasion: ['Reception'],
    description: 'Sea-foam green premium suit featuring exquisite mirror work.',
    price: 5800,
    sizes: ['M', 'L', 'XL'],
    colors: ['Sea-Foam Green'],
    stock: 'in_stock',
    images: ['/images/suit-khatli.jpg'],
    status: 'active',
    featured: false
  },
  {
    id: 'h3',
    name: 'Dee Rathila Signature Red Silk Suit',
    category: 'Festive',
    fabric: 'Pure Silk',
    occasion: ['Wedding'],
    description: 'Deep red pure silk kameez featuring an iconic golden bow motif.',
    price: 12500,
    sizes: ['M', 'L'],
    colors: ['Crimson Red'],
    stock: 'in_stock',
    images: ['/images/suit-red-silk.jpg'],
    status: 'active',
    featured: true
  },
  {
    id: 'h4',
    name: 'Premium Print Unstitched Materials',
    category: 'Unstitched',
    fabric: 'Georgette',
    occasion: ['Daily Wear'],
    description: 'High-quality unstitched fabric sets featuring vibrant geometric prints.',
    price: 2800,
    sizes: ['Unstitched'],
    colors: ['Variety'],
    stock: 'in_stock',
    images: ['/images/suit-unstitched.jpg'],
    status: 'active',
    featured: false
  }
];

const getMockData = () => {
  const stored = localStorage.getItem('tr_traders_products');
  return stored ? JSON.parse(stored) : HERITAGE_COLLECTION;
};

export const getProducts = async (includeHidden = false) => {
  if (isMockMode) return getMockData();
  
  try {
    const productsRef = collection(db, "products");
    const querySnapshot = await getDocs(productsRef);
    let cloudProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Total Unification: If cloud is empty, return the hardcoded masters
    if (cloudProducts.length === 0) return HERITAGE_COLLECTION;

    cloudProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return includeHidden ? cloudProducts : cloudProducts.filter(p => p.status === 'active');
  } catch (error) {
    return HERITAGE_COLLECTION;
  }
};

export const getProductById = async (id) => {
  // Direct check for hardcoded IDs to ensure zero-latency detail loading
  const heritageMatch = HERITAGE_COLLECTION.find(p => p.id === id);
  if (heritageMatch) return heritageMatch;

  if (isMockMode) return getMockData().find(p => p.id === id) || null;

  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) { return HERITAGE_COLLECTION.find(p => p.id === id) || null; }
};

export const addProduct = async (productData) => {
  const data = { ...productData, createdAt: new Date().toISOString(), status: productData.status || 'active' };
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
  if (id.startsWith('h')) return { ...HERITAGE_COLLECTION.find(p => p.id === id), ...updates };
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, updates);
  return { id, ...updates };
};
export const deleteProduct = async (id) => {
  if (id.startsWith('h')) return true;
  await deleteDoc(doc(db, "products", id));
  return true;
};
