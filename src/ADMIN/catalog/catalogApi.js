export const API_ROOT = 'https://wildlife-unwieldy-devotee.ngrok-free.dev/api/Catalog';
const ASSET_ROOT = 'https://wildlife-unwieldy-devotee.ngrok-free.dev';
const SUBCATEGORY_CACHE_KEY = 'sat_api_subcategories_cache';

const isStorageAvailable = () => typeof window !== 'undefined' && window.localStorage;

const readCachedSubcategories = () => {
  if (!isStorageAvailable()) return [];

  try {
    const cached = window.localStorage.getItem(SUBCATEGORY_CACHE_KEY);
    const parsed = cached ? JSON.parse(cached) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeCachedSubcategories = (subcategories) => {
  if (!isStorageAvailable()) return;
  window.localStorage.setItem(SUBCATEGORY_CACHE_KEY, JSON.stringify(subcategories));
};

const upsertCachedSubcategory = (subcategory) => {
  const cachedSubcategories = readCachedSubcategories();
  const exists = cachedSubcategories.some((item) => item.id === subcategory.id);
  const updated = exists
    ? cachedSubcategories.map((item) => (item.id === subcategory.id ? subcategory : item))
    : [...cachedSubcategories, subcategory];
  writeCachedSubcategories(updated);
};

const removeCachedSubcategory = (id) => {
  const updated = readCachedSubcategories().filter((subcategory) => subcategory.id !== String(id));
  writeCachedSubcategories(updated);
};

const isSerializationCycleError = (message) =>
  message.includes('possible object cycle') || message.includes('SerializerCycleDetected');

const request = async (url, options = {}) => {
  const headers = options.body instanceof FormData
    ? { ...options.headers, 'ngrok-skip-browser-warning': 'true' }
    : { 'Content-Type': 'application/json', ...(options.headers || {}), 'ngrok-skip-browser-warning': 'true' };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    if (isSerializationCycleError(message)) {
      throw new Error('Backend serialization error: the API is returning a circular Category/SubCategories object graph.');
    }
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  return response.json();
};

const normalizeStatus = (status, isActive = true) => {
  if (typeof isActive === 'boolean') return isActive ? 'Active' : 'Inactive';
  const value = String(status || 'ACTIVE').toLowerCase();
  return value === 'inactive' || value === 'false' ? 'Inactive' : 'Active';
};

const toApiIsActive = (status) => String(status || 'Active').toLowerCase() !== 'inactive';

const unwrapList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.value)) return data.value;
  if (Array.isArray(data?.Value)) return data.Value;
  return [];
};

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${ASSET_ROOT}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

export const mapCategoryFromApi = (category = {}) => ({
  id: String(category.id ?? ''),
  code: category.categoryCode || category.id || '',
  name: category.name || category.categoryName || category.categoryName || '',
  slug: category.slug || '',
  description: category.description || '',
  status: normalizeStatus(category.status, category.isActive),
  displayOrder: category.displayOrder ?? '',
  metaTitle: category.metaTitle || '',
  metaDescription: category.metaDescription || '',
  image: resolveImageUrl(category.imageUrl),
  imageUrl: category.imageUrl || '',
  subCategories: category.subCategories || category.subcategories || [],
  products: category.products || [],
});

export const mapSubcategoryFromApi = (subcategory = {}) => ({
  id: String(subcategory.id ?? ''),
  categoryId: String(subcategory.categoryId ?? ''),
  name: subcategory.name || subcategory.subCategoryName || subcategory.subcategoryName || subcategory.subcategory_name || '',
  slug: subcategory.slug || '',
  description: subcategory.description || '',
  status: normalizeStatus(subcategory.status, subcategory.isActive),
  displayOrder: subcategory.displayOrder ?? '',
  image: resolveImageUrl(subcategory.imageUrl),
  imageUrl: subcategory.imageUrl || '',
  categoryName: subcategory.categoryName || subcategory.category?.categoryName || '',
  products: subcategory.products || [],
});

const subcategoriesFromCategories = (categories) =>
  categories.flatMap((category) => {
    const subcategories = Array.isArray(category.subCategories) ? category.subCategories : [];
    return subcategories.map((subcategory) =>
      mapSubcategoryFromApi({
        ...subcategory,
        categoryId: subcategory.categoryId ?? category.id,
        categoryName: subcategory.categoryName ?? category.name,
      })
    );
  });

const categoryFormData = (category) => {
  return JSON.stringify({
    name: category.name,
    description: category.description,
    imageUrl: category.imageUrl || category.image || '',
    isActive: toApiIsActive(category.status),
  });
};

const subcategoryFormData = (subcategory) => {
  return JSON.stringify({
    categoryId: Number(subcategory.categoryId),
    name: subcategory.name,
    description: subcategory.description,
  });
};

export const mapProductFromApi = (product = {}, categories = [], subcategories = []) => {
  const subcategory = product.subcategory || product.subCategory || {};
  const subcategoryId = String(product.subcategoryId ?? product.subCategoryId ?? subcategory.id ?? '');
  const categoryId = String(product.categoryId ?? subcategory.categoryId ?? '');
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const media = Array.isArray(product.media) ? product.media : [];
  const stock = Number(product.stockQuantity ?? product.stock ?? 0);

  return {
    id: String(product.id ?? ''),
    name: product.name || product.productName || product.product_name || '',
    sku: product.sku || '',
    brand: product.brand?.name || product.brand?.brandName || product.brand || 'Shyam Agro Tools',
    categoryId: categoryId || subcategories.find((item) => item.id === subcategoryId)?.categoryId || categories[0]?.id || '',
    subcategoryId: subcategoryId || subcategories[0]?.id || '',
    mrp: Number(product.mrp ?? product.basePrice ?? product.price ?? 0),
    price: Number(product.price ?? 0),
    stock,
    status: product.isActive === false ? 'Inactive' : stock > 0 ? 'In Stock' : 'Out of Stock',
    specifications: {
      weight: product.weight || '',
    },
    weight: product.weight || '',
    rating: Number(product.rating ?? product.averageRating ?? 0),
    totalReviews: Number(product.totalReviews ?? reviews.length ?? 0),
    reviews,
    image: resolveImageUrl(product.imageUrl || media[0]?.mediaUrl || ''),
    imageUrl: product.imageUrl || media[0]?.mediaUrl || '',
    raw: product,
  };
};

export const fetchCategories = async () => {
  const categories = await request(`${API_ROOT}/categories`);
  return unwrapList(categories)
    .map(mapCategoryFromApi)
    .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder));
};

export const fetchCategory = async (id) => {
  const category = await request(`${API_ROOT}/categories/${id}`);
  return mapCategoryFromApi(category);
};

export const saveCategory = async (category) => {
  const isEditing = Boolean(category.id);
  const saved = await request(`${API_ROOT}/categories${isEditing ? `/${category.id}` : ''}`, {
    method: isEditing ? 'PUT' : 'POST',
    body: categoryFormData(category),
  });
  return saved ? mapCategoryFromApi(saved) : category;
};

export const deleteCategory = (id) => request(`${API_ROOT}/categories/${id}`, { method: 'DELETE' });

export const fetchSubcategories = async () => {
  try {
    const subcategories = await request(`${API_ROOT}/subcategories`);
    const mappedSubcategories = unwrapList(subcategories)
      .map(mapSubcategoryFromApi)
      .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder));
    writeCachedSubcategories(mappedSubcategories);
    return mappedSubcategories;
  } catch (error) {
    const categories = await fetchCategories();
    const fallbackSubcategories = subcategoriesFromCategories(categories);
    if (fallbackSubcategories.length) return fallbackSubcategories;
    if (error.message?.includes('Backend serialization error')) {
      return readCachedSubcategories();
    }
    throw error;
  }
};

export const fetchSubcategory = async (id) => {
  try {
    const subcategory = await request(`${API_ROOT}/subcategories/${id}`);
    return mapSubcategoryFromApi(subcategory);
  } catch (error) {
    const cachedSubcategory = readCachedSubcategories().find((subcategory) => subcategory.id === String(id));
    if (cachedSubcategory) return cachedSubcategory;
    throw error;
  }
};

export const saveSubcategory = async (subcategory) => {
  const isEditing = Boolean(subcategory.id);
  const saved = await request(`${API_ROOT}/subcategories${isEditing ? `/${subcategory.id}` : ''}`, {
    method: isEditing ? 'PUT' : 'POST',
    body: subcategoryFormData(subcategory),
  });
  const mappedSubcategory = saved ? mapSubcategoryFromApi(saved) : subcategory;
  upsertCachedSubcategory(mappedSubcategory);
  return mappedSubcategory;
};

export const deleteSubcategory = async (id) => {
  await request(`${API_ROOT}/subcategories/${id}`, { method: 'DELETE' });
  removeCachedSubcategory(id);
};

export const fetchProducts = async (categories = [], subcategories = []) => {
  const products = await request(`${API_ROOT}/products`);
  return unwrapList(products).map((product) => mapProductFromApi(product, categories, subcategories));
};

export const fetchProduct = async (id, categories = [], subcategories = []) => {
  const product = await request(`${API_ROOT}/products/${id}`);
  return mapProductFromApi(product, categories, subcategories);
};

export const deleteProduct = (id) => request(`${API_ROOT}/products/${id}`, { method: 'DELETE' });
