import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  PackagePlus,
  Plus,
  Save,
  Star,
  Tractor,
  Trash2,
  Upload,
  X,
  Eye,
} from 'lucide-react';
import {
  getCategoryName,
  getSubcategoryName,
} from './catalogStore';
import { API_ROOT, fetchCategories, fetchSubcategories } from './catalogApi';
import './adminModule.css';
import './ProductsForm.css';

const PRODUCTS_API_URL = `${API_ROOT}/products`;

const createReview = () => ({
  customer: '',
  rating: '5',
  date: '',
  comment: '',
  verified: true,
});

const createEmptyProduct = () => ({
  id: '',
  name: '',
  sku: '',
  brand: 'Shyam Agro Tools',
  supplier: '',
  categoryId: '',
  subcategoryId: '',
  mrp: '',
  price: '',
  discountType: 'none',
  discountValue: '',
  stock: '',
  status: 'In Stock',
  countryOfOrigin: 'India',
  codAvailable: 'Yes',
  deliveryEstimate: '3-7 business days',
  returnPolicy: 'Easy Returns',
  shortDescription: '',
  description: '',
  productDetails: '',
  packageIncludes: '',
  specifications: {
    weight: '',
    dimensions: '',
    powerSource: '',
    material: '',
    coverage: '',
  },
  keyFeatures: ['', '', '', ''],
  rating: '',
  totalReviews: '',
  ratingBreakdown: {
    5: '',
    4: '',
    3: '',
    2: '',
    1: '',
  },
  reviews: [createReview(), createReview()],
  image: '',
});

const normalizeList = (list, minimumRows, factoryValue = '') => {
  const values = Array.isArray(list) && list.length ? list : [];
  const normalized = values.map((item) => (typeof item === 'string' ? item : String(item || '')));

  while (normalized.length < minimumRows) {
    normalized.push(factoryValue);
  }

  return normalized;
};

const normalizeReviews = (reviews) => {
  const normalized = Array.isArray(reviews) && reviews.length ? reviews : [createReview(), createReview()];

  return normalized.map((review) => ({
    ...createReview(),
    ...review,
    rating: String(review.rating || 5),
    verified: review.verified !== false,
  }));
};

const normalizeProduct = (product) => {
  const emptyProduct = createEmptyProduct();
  const specifications = {
    ...emptyProduct.specifications,
    ...(product.specifications || {}),
    weight: product.specifications?.weight || product.weight || '',
  };

  return {
    ...emptyProduct,
    ...product,
    mrp: String(product.mrp || product.price || ''),
    price: String(product.price || ''),
    discountType: product.discountType || 'none',
    discountValue: String(product.discountValue || ''),
    stock: String(product.stock || ''),
    rating: String(product.rating || ''),
    totalReviews: String(product.totalReviews || ''),
    shortDescription: product.shortDescription || product.shortDesc || product.description || '',
    productDetails: product.productDetails || product.longDesc || product.description || '',
    specifications,
    keyFeatures: normalizeList(product.keyFeatures || product.features, 4),
    ratingBreakdown: {
      ...emptyProduct.ratingBreakdown,
      ...(product.ratingBreakdown || {}),
    },
    reviews: normalizeReviews(product.reviews),
  };
};

const calculateSellingPrice = (mrp, discountType, discountValue) => {
  const basePrice = Math.max(Number(mrp) || 0, 0);
  const enteredDiscount = Math.max(Number(discountValue) || 0, 0);

  if (!basePrice || discountType === 'none') {
    return basePrice;
  }

  const discountAmount =
    discountType === 'percentage'
      ? Math.min(basePrice, (basePrice * Math.min(enteredDiscount, 100)) / 100)
      : Math.min(basePrice, enteredDiscount);

  return Math.round(basePrice - discountAmount);
};

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

const getValue = (source, keys, fallback = '') => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return source[key];
    }
  }

  return fallback;
};

const asString = (value, fallback = '') => (value === undefined || value === null ? fallback : String(value));

const asNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const findByNameOrId = (items, value, fallback = '') => {
  const searchValue = asString(value).trim().toLowerCase();
  if (!searchValue) return fallback;

  return (
    items.find((item) => item.id?.toLowerCase() === searchValue || item.name?.toLowerCase() === searchValue)?.id ||
    fallback
  );
};

const normalizeApiReview = (review) => ({
  customer: asString(getValue(review, ['customer', 'customerName', 'CustomerName'])),
  rating: asString(getValue(review, ['rating', 'Rating'], '5')),
  date: asString(getValue(review, ['date', 'reviewDate', 'ReviewDate', 'dateCreated'])).slice(0, 7),
  comment: asString(getValue(review, ['comment', 'reviewComment', 'ReviewComment'])),
  verified: Boolean(getValue(review, ['verified', 'verifiedPurchase', 'VerifiedPurchase'], true)),
});

const normalizeApiProduct = (product, categories = [], subcategories = []) => {
  const id = getValue(product, ['id', 'Id', 'productId', 'ProductId']);

  // Brand can be an object { id, name, brandName } or a string
  let brandName = 'Shyam Agro Tools';
  const rawBrand = product.brand || product.Brand;
  if (typeof rawBrand === 'string') {
    brandName = rawBrand;
  } else if (rawBrand && typeof rawBrand === 'object') {
    brandName = rawBrand.name || rawBrand.brandName || rawBrand.brand_name || 'Shyam Agro Tools';
  }

  // Supplier / manufacturer — from brand object or direct field
  let supplierName = '';
  if (typeof rawBrand === 'object' && rawBrand) {
    supplierName = rawBrand.name || rawBrand.brandName || '';
  }
  supplierName = asString(getValue(product, ['supplier', 'manufacturer', 'Manufacturer']) || supplierName);

  // Category info: can come from subcategory.categoryId or direct categoryId
  const subcategoryObj = product.subcategory || product.subCategory || product.SubCategory;
  const categoryName = asString(
    getValue(product, ['category', 'Category']) ||
    (typeof subcategoryObj === 'object' ? (subcategoryObj?.categoryName || '') : '')
  );
  const subcategoryName = asString(
    typeof subcategoryObj === 'string' ? subcategoryObj :
    (typeof subcategoryObj === 'object' ? (subcategoryObj?.subcategoryName || subcategoryObj?.name || subcategoryObj?.subcategory_name || '') : '')
  );

  // Resolve categoryId: from product directly, from subcategory object, or by name lookup
  let categoryId = getValue(product, ['categoryId', 'CategoryId']) ||
    (typeof subcategoryObj === 'object' ? asString(subcategoryObj?.categoryId) : '') ||
    findByNameOrId(categories, categoryName, categories[0]?.id || '');
  categoryId = asString(categoryId);

  // Resolve subcategoryId
  let subcategoryId = getValue(product, ['subcategoryId', 'subCategoryId', 'SubCategoryId']) ||
    findByNameOrId(subcategories, subcategoryName, subcategories[0]?.id || '');
  subcategoryId = asString(subcategoryId);

  // Pricing
  const sellingPrice = asNumber(getValue(product, ['sellingPrice', 'SellingPrice', 'price', 'Price']));
  const basePrice = asNumber(getValue(product, ['basePrice', 'BasePrice', 'mrp', 'MRP']), sellingPrice);

  // Stock: API uses stockQuantity
  const stock = asNumber(getValue(product, ['stockQuantity', 'stock', 'Stock']));

  // Status: derive from isActive if no explicit status
  let status = asString(getValue(product, ['status', 'stockStatus', 'StockStatus'], ''));
  if (!status) {
    if (product.isActive === false) {
      status = 'Inactive';
    } else if (stock > 0) {
      status = 'In Stock';
    } else {
      status = 'Out of Stock';
    }
  }

  // Features: API returns [{ featureName, featureValue }] — convert to string array
  let keyFeatures = getValue(product, ['keyFeatures'], null);
  if (!keyFeatures) {
    const rawFeatures = getValue(product, ['features', 'Features'], []);
    if (Array.isArray(rawFeatures) && rawFeatures.length > 0) {
      if (typeof rawFeatures[0] === 'string') {
        keyFeatures = rawFeatures;
      } else {
        // Objects like { featureName, featureValue }
        keyFeatures = rawFeatures.map(f =>
          f.featureName && f.featureValue
            ? `${f.featureName}: ${f.featureValue}`
            : asString(f.featureName || f.featureValue || f.name || f.value || '')
        );
      }
    } else {
      keyFeatures = [];
    }
  }

  // Image: from imageUrl or first media item
  let image = asString(getValue(product, ['image', 'imageUrl', 'ImageUrl', 'imagePath', 'ImagePath']));
  if (!image && Array.isArray(product.media) && product.media.length > 0) {
    image = asString(product.media[0]?.mediaUrl || '');
  }

  return {
    id: asString(id),
    apiId: id,
    name: asString(getValue(product, ['name', 'productName', 'ProductName', 'product_name'])),
    sku: asString(getValue(product, ['sku', 'skuCode', 'SKUCode'])),
    brand: brandName,
    supplier: supplierName,
    categoryId,
    subcategoryId,
    categoryName,
    subcategoryName,
    mrp: basePrice,
    price: sellingPrice,
    discountType: asString(getValue(product, ['discountType', 'DiscountType'], 'none')),
    discountValue: asNumber(getValue(product, ['discountValue', 'discountAmount', 'DiscountAmount'])),
    stock,
    status,
    countryOfOrigin: asString(getValue(product, ['countryOfOrigin', 'CountryOfOrigin'], 'India')),
    codAvailable: asString(getValue(product, ['codAvailable', 'codAvailability', 'CODAvailability'], 'Yes')),
    deliveryEstimate: asString(getValue(product, ['deliveryEstimate', 'estimatedDelivery', 'EstimatedDelivery'], '3-7 business days')),
    returnPolicy: asString(getValue(product, ['returnPolicy', 'deliveryReturn', 'DeliveryReturn'], 'Easy Returns')),
    shortDescription: asString(getValue(product, ['shortDescription', 'ShortDescription', 'shortDesc', 'description'])),
    description: asString(getValue(product, ['shortDescription', 'ShortDescription', 'description'])),
    productDetails: asString(getValue(product, ['productDetails', 'ProductDetails', 'longDesc', 'description'])),
    packageIncludes: asString(getValue(product, ['packageIncludes', 'PackageIncludes'])),
    specifications: {
      weight: asString(getValue(product, ['weight', 'Weight'])),
      dimensions: asString(getValue(product, ['dimensions', 'Dimensions'])),
      powerSource: asString(getValue(product, ['powerSource', 'PowerSource'])),
      material: asString(getValue(product, ['material', 'Material'])),
      coverage: asString(getValue(product, ['coverage', 'coverageUsage', 'CoverageUsage'])),
    },
    keyFeatures,
    rating: asNumber(getValue(product, ['rating', 'averageRating', 'AverageRating'])),
    totalReviews: asNumber(getValue(product, ['totalReviews', 'TotalReviews'])),
    ratingBreakdown: {
      5: asNumber(getValue(product, ['fiveStar', 'FiveStar'])),
      4: asNumber(getValue(product, ['fourStar', 'FourStar'])),
      3: asNumber(getValue(product, ['threeStar', 'ThreeStar'])),
      2: asNumber(getValue(product, ['twoStar', 'TwoStar'])),
      1: asNumber(getValue(product, ['oneStar', 'OneStar'])),
    },
    reviews: (getValue(product, ['reviews', 'Reviews'], []) || []).map(normalizeApiReview),
    image,
  };
};

const toReviewDate = (date) => {
  if (!date) return new Date().toISOString();
  if (/^\d{4}-\d{2}$/.test(date)) return `${date}-01T00:00:00.000Z`;
  return new Date(date).toISOString();
};

const buildProductFormData = (product, imageFiles, videoFile, categories = [], subcategories = []) => {
  const payload = new FormData();

  const append = (key, value) => {
    if (value === undefined || value === null) return;
    payload.append(key, value);
  };

  // Core product fields — use both PascalCase and the API's native field names
  append('Name', product.name);
  append('ProductName', product.name);
  append('SKU', product.sku);
  append('SKUCode', product.sku);
  append('Brand', product.brand);
  append('Manufacturer', product.supplier);
  append('SubCategoryId', Number(product.subcategoryId) || 0);
  append('SubcategoryId', Number(product.subcategoryId) || 0);
  append('Slug', product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  append('Description', product.shortDescription || product.description);
  append('ShortDescription', product.shortDescription);
  append('ProductDetails', product.productDetails);
  append('PackageIncludes', product.packageIncludes);
  append('Weight', product.specifications?.weight);
  append('Dimensions', product.specifications?.dimensions);
  append('PowerSource', product.specifications?.powerSource);
  append('Material', product.specifications?.material);
  append('CoverageUsage', product.specifications?.coverage);
  append('Price', Number(product.price) || Number(product.mrp) || 0);
  append('BasePrice', Number(product.mrp) || 0);
  append('StockQuantity', Number(product.stock) || 0);
  append('Stock', Number(product.stock) || 0);
  append('Unit', product.unit || 'Pieces');
  append('DiscountType', product.discountType);
  append('DiscountAmount', Number(product.discountValue) || 0);
  append('SellingPrice', Number(product.price) || 0);
  append('StockStatus', product.status);
  append('IsActive', true);
  append('AverageRating', Number(product.rating) || 0);
  append('TotalReviews', Number(product.totalReviews) || 0);
  append('FiveStar', Number(product.ratingBreakdown?.[5]) || 0);
  append('FourStar', Number(product.ratingBreakdown?.[4]) || 0);
  append('ThreeStar', Number(product.ratingBreakdown?.[3]) || 0);
  append('TwoStar', Number(product.ratingBreakdown?.[2]) || 0);
  append('OneStar', Number(product.ratingBreakdown?.[1]) || 0);
  append('CountryOfOrigin', product.countryOfOrigin);
  append('CODAvailability', product.codAvailable);
  append('EstimatedDelivery', product.deliveryEstimate);
  append('DeliveryReturn', product.returnPolicy);
  append('Status', 'Active');

  product.keyFeatures
    ?.filter((feature) => feature.trim())
    .forEach((feature) => payload.append('Features', feature));

  product.reviews
    ?.filter((review) => review.customer || review.comment)
    .forEach((review) => {
      payload.append('Reviews', JSON.stringify({
        CustomerName: review.customer,
        Rating: review.rating,
        ReviewDate: toReviewDate(review.date),
        ReviewComment: review.comment,
        VerifiedPurchase: review.verified
      }));
    });

  imageFiles.forEach((file) => {
    payload.append('Images', file);
  });
  if (videoFile) {
    payload.append('Video', videoFile);
  }

  return payload;
};

const fetchProductById = async (id, categories, subcategories) => {
  const response = await axios.get(`${PRODUCTS_API_URL}/${id}`, { 
    timeout: 30000,
    headers: { 'ngrok-skip-browser-warning': 'true' }
  });
  return normalizeApiProduct(response.data?.data || response.data, categories, subcategories);
};

const createProduct = async (product, imageFiles, videoFile, categories, subcategories) => {
  const payload = buildProductFormData(product, imageFiles, videoFile, categories, subcategories);
  const response = await axios.post(PRODUCTS_API_URL, payload, {
    timeout: 45000,
    headers: { 'ngrok-skip-browser-warning': 'true' }
  });

  return normalizeApiProduct(response.data?.data || response.data || product, categories, subcategories);
};

const updateProduct = async (id, product, imageFiles, videoFile, categories, subcategories) => {
  const payload = buildProductFormData(product, imageFiles, videoFile, categories, subcategories);
  const response = await axios.put(`${PRODUCTS_API_URL}/${id}`, payload, {
    timeout: 45000,
    headers: { 'ngrok-skip-browser-warning': 'true' }
  });

  return normalizeApiProduct(response.data?.data || response.data || { ...product, id }, categories, subcategories);
};

const ProductsForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const categoryIdFromQuery = searchParams.get('categoryId');
  const subcategoryIdFromQuery = searchParams.get('subcategoryId');

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoadingTaxonomy, setIsLoadingTaxonomy] = useState(true);

  const [formData, setFormData] = useState({
    ...createEmptyProduct(),
    categoryId: categoryIdFromQuery || '',
    subcategoryId: subcategoryIdFromQuery || '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const isEditing = Boolean(productId);

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchCategories(), fetchSubcategories()]).then(([cats, subcats]) => {
      if (!isMounted) return;
      setCategories(cats);
      setSubcategories(subcats);
      setFormData((current) => ({
        ...current,
        categoryId: current.categoryId || cats[0]?.id || '',
      }));
      setIsLoadingTaxonomy(false);
    }).catch(() => {
      if (isMounted) setIsLoadingTaxonomy(false);
    });
    return () => { isMounted = false; };
  }, []);

  const availableSubcategories = useMemo(
    () => subcategories.filter((subcategory) => String(subcategory.categoryId) === String(formData.categoryId)),
    [formData.categoryId, subcategories]
  );

  const sellingPrice = useMemo(
    () => calculateSellingPrice(formData.mrp, formData.discountType, formData.discountValue),
    [formData.discountType, formData.discountValue, formData.mrp]
  );

  const discountSummary = useMemo(() => {
    const mrp = Number(formData.mrp) || 0;
    if (!mrp || formData.discountType === 'none' || !Number(formData.discountValue)) return 'No active discount';

    const savedAmount = mrp - sellingPrice;
    const percentOff = Math.round((savedAmount / mrp) * 100);

    return `${formatCurrency(savedAmount)} saved (${percentOff}% off)`;
  }, [formData.discountType, formData.discountValue, formData.mrp, sellingPrice]);

  useEffect(() => {
    if (!productId) return;

    let isMounted = true;
    setIsLoadingProduct(true);
    setErrorMessage('');

    fetchProductById(productId, categories, subcategories)
      .then((product) => {
        if (!isMounted) return;
        setFormData(normalizeProduct(product));
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error.response?.data?.message || error.message || 'Unable to load product details.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingProduct(false);
      });

    return () => {
      isMounted = false;
    };
  }, [categories, productId, subcategories]);

  useEffect(() => {
    if (!formData.categoryId) return;
    const hasSelectedSubcategory = availableSubcategories.some(
      (subcategory) => subcategory.id === formData.subcategoryId
    );

    if (!hasSelectedSubcategory) {
      setFormData((current) => ({
        ...current,
        subcategoryId: availableSubcategories[0]?.id || '',
      }));
    }
  }, [availableSubcategories, formData.categoryId, formData.subcategoryId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSpecificationChange = (name, value) => {
    setFormData((current) => ({
      ...current,
      specifications: {
        ...current.specifications,
        [name]: value,
      },
    }));
  };

  const handleRatingBreakdownChange = (rating, value) => {
    setFormData((current) => ({
      ...current,
      ratingBreakdown: {
        ...current.ratingBreakdown,
        [rating]: value,
      },
    }));
  };

  const handleFeatureChange = (index, value) => {
    setFormData((current) => ({
      ...current,
      keyFeatures: current.keyFeatures.map((feature, featureIndex) =>
        featureIndex === index ? value : feature
      ),
    }));
  };

  const addFeature = () => {
    setFormData((current) => ({
      ...current,
      keyFeatures: [...current.keyFeatures, ''],
    }));
  };

  const removeFeature = (index) => {
    setFormData((current) => ({
      ...current,
      keyFeatures: current.keyFeatures.filter((_, featureIndex) => featureIndex !== index),
    }));
  };

  const handleReviewChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      reviews: current.reviews.map((review, reviewIndex) =>
        reviewIndex === index ? { ...review, [field]: value } : review
      ),
    }));
  };

  const addReview = () => {
    setFormData((current) => ({
      ...current,
      reviews: [...current.reviews, createReview()],
    }));
  };

  const removeReview = (index) => {
    setFormData((current) => ({
      ...current,
      reviews: current.reviews.filter((_, reviewIndex) => reviewIndex !== index),
    }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    
    // Check file sizes (max 25MB total to be safe)
    const validFiles = files.filter(f => f.size <= 25 * 1024 * 1024);
    if (validFiles.length < files.length) {
      alert("Some images were too large. Please select images under 25MB.");
    }
    if (!validFiles.length) return;

    const newFiles = validFiles.slice(0, 7); // enforce max 7
    setImageFiles(newFiles);
    // generate previews
    const readers = newFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((results) => {
      setFormData((current) => ({ ...current, image: results[0] })); // keep first as main image preview
    });
  };

  const handleVideoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert("Video file is too large. Please select a video under 25MB.");
      return;
    }

    setVideoFile(file);
    setFormData((current) => ({ ...current, videoPreview: URL.createObjectURL(file) }));
  };

  const saveProduct = async () => {
    if (!isEditing && imageFiles.length < 4) {
      setErrorMessage('Minimum 4 images and maximum 7 images are required.');
      return null;
    }
    if (imageFiles.length > 7) {
      setErrorMessage('Maximum 7 images are allowed.');
      return null;
    }

    const preparedProduct = {
      ...formData,
      price: sellingPrice,
      mrp: Number(formData.mrp) || sellingPrice,
      discountValue: Number(formData.discountValue) || 0,
      rating: Number(formData.rating) || 0,
      totalReviews: Number(formData.totalReviews) || 0,
      stock: Number(formData.stock) || 0,
      shortDesc: formData.shortDescription,
      longDesc: formData.productDetails,
      description: formData.shortDescription,
      weight: formData.specifications.weight,
      keyFeatures: formData.keyFeatures.filter((feature) => feature.trim()),
      reviews: formData.reviews.filter((review) => review.customer || review.comment),
      ratingBreakdown: Object.fromEntries(
        Object.entries(formData.ratingBreakdown).map(([rating, value]) => [rating, Number(value) || 0])
      ),
    };

    setIsSaving(true);
    setErrorMessage('');

    try {
      const savedProduct = isEditing
        ? await updateProduct(productId, preparedProduct, imageFiles, videoFile, categories, subcategories)
        : await createProduct(preparedProduct, imageFiles, videoFile, categories, subcategories);

      setFormData(normalizeProduct(savedProduct));
      setImageFiles([]);
      setVideoFile(null);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2200);
      return savedProduct;
    } catch (error) {
      console.error("API Error Response:", error.response?.data);
      let msg = error.response?.data?.title || error.response?.data?.message || error.message || 'Unable to save product.';
      if (error.response?.data?.errors) {
        if (typeof error.response.data.errors === 'object') {
           const errList = Object.entries(error.response.data.errors).map(([k, v]) => `${k}: ${v}`).join(' | ');
           if (errList) msg = errList;
        }
      }
      setErrorMessage(msg);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await saveProduct();
  };

  if (isLoadingTaxonomy) {
    return (
      <div className="catalog-page">
        <section className="catalog-empty-state">
          <PackagePlus size={34} />
          <h3>Loading Taxonomy</h3>
          <p>Please wait while categories are loaded from the API.</p>
        </section>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="catalog-page">
        <section className="catalog-empty-state">
          <PackagePlus size={34} />
          <h3>Create a category first</h3>
          <p>Products need a category and subcategory. Start by creating your main category.</p>
          <Link to="/admin/catalog/category" className="catalog-btn catalog-btn--primary">
            Create Category
          </Link>
        </section>
      </div>
    );
  }

  if (!subcategories.length) {
    return (
      <div className="catalog-page">
        <section className="catalog-empty-state">
          <PackagePlus size={34} />
          <h3>Create a subcategory first</h3>
          <p>Products must be assigned to a subcategory. Create one under your selected category before adding products.</p>
          <Link to="/admin/catalog/subcategory" className="catalog-btn catalog-btn--primary">
            Create Subcategory
          </Link>
        </section>
      </div>
    );
  }

  if (isLoadingProduct) {
    return (
      <div className="catalog-page">
        <section className="catalog-empty-state">
          <PackagePlus size={34} />
          <h3>Loading product details</h3>
          <p>Please wait while the product information is loaded from the API.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="catalog-page product-form-page">
      <section className="catalog-header">
        <div className="catalog-title-wrap">
          <span className="catalog-kicker">Step 3 of 3</span>
          <h1>{isEditing ? 'Edit Product' : 'Create Product'}</h1>
          <p>Add the product information shown on the customer product page, including discounts, specs, features, and rating summary.</p>
        </div>

        <div className="catalog-header__actions">
          <Link to="/admin/catalog/products" className="catalog-btn">
            <ArrowLeft size={16} /> Products List
          </Link>
          <button type="button" className="catalog-btn catalog-btn--primary" onClick={() => navigate('/admin/catalog/products')}>
            View Products
          </button>
        </div>
      </section>

      <form className="catalog-form" onSubmit={handleSubmit}>
        <div className="catalog-side-grid product-form-layout">
          <div className="catalog-stack">
            <section className="catalog-card">
              <div className="catalog-card__header">
                <div>
                  <h2>Product Details</h2>
                  <p className="catalog-card__subtitle">
                    Current path: {getCategoryName(categories, formData.categoryId)} / {getSubcategoryName(subcategories, formData.subcategoryId)}
                  </p>
                </div>
                {isSaved && (
                  <span className="catalog-alert">
                    <CheckCircle size={16} /> Product saved
                  </span>
                )}
                {errorMessage && (
                  <span className="catalog-alert catalog-alert--warning">
                    {errorMessage}
                  </span>
                )}
              </div>

              <div className="catalog-form-grid">
                <div className="catalog-field">
                  <label htmlFor="product-name">Product Name</label>
                  <input
                    id="product-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Drip Pipes"
                    required
                  />
                </div>

                <div className="catalog-field">
                  <label htmlFor="product-sku">SKU / Item Code</label>
                  <input
                    id="product-sku"
                    name="sku"
                    type="text"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="AG-DRIP-P8"
                    required
                  />
                </div>

                <div className="catalog-field">
                  <label htmlFor="product-brand">Brand</label>
                  <input
                    id="product-brand"
                    name="brand"
                    type="text"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Shyam Agro Tools"
                  />
                </div>

                <div className="catalog-field">
                  <label htmlFor="product-supplier">Manufacturer / Supplier</label>
                  <input
                    id="product-supplier"
                    name="supplier"
                    type="text"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    placeholder="e.g. Shyam Agro Industries"
                  />
                </div>

                <div className="catalog-field">
                  <label htmlFor="product-category">Category</label>
                  <select
                    id="product-category"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="catalog-field">
                  <label htmlFor="product-subcategory">Subcategory</label>
                  <select
                    id="product-subcategory"
                    name="subcategoryId"
                    value={formData.subcategoryId}
                    onChange={handleInputChange}
                    required
                  >
                    {availableSubcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                  {!availableSubcategories.length && (
                    <small>No subcategories found for this category. Add a subcategory first.</small>
                  )}
                </div>
              </div>
            </section>

            <section className="catalog-card">
              <div className="product-section-heading">
                <h2>Storefront Content</h2>
                <p>These fields map to the short description and product details sections on the customer page.</p>
              </div>

              <div className="catalog-field">
                <label htmlFor="product-short-description">Short Description</label>
                <textarea
                  id="product-short-description"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Durable drip irrigation pipe roll for efficient water delivery across crop rows."
                  required
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="product-details">Product Details</label>
                <textarea
                  id="product-details"
                  name="productDetails"
                  value={formData.productDetails}
                  onChange={handleInputChange}
                  placeholder="Built for long runs and consistent water flow, this product helps reduce water waste while improving targeted irrigation."
                  required
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="package-includes">Package Includes</label>
                <textarea
                  id="package-includes"
                  name="packageIncludes"
                  value={formData.packageIncludes}
                  onChange={handleInputChange}
                  placeholder="Main unit, fittings, user manual, warranty card"
                />
              </div>
            </section>

            <section className="catalog-card">
              <div className="product-section-heading">
                <h2>Specifications</h2>
                <p>Shown as specification tiles on the product page.</p>
              </div>

              <div className="catalog-form-grid product-spec-grid">
                <div className="catalog-field">
                  <label htmlFor="spec-weight">Weight</label>
                  <input
                    id="spec-weight"
                    type="text"
                    value={formData.specifications.weight}
                    onChange={(event) => handleSpecificationChange('weight', event.target.value)}
                    placeholder="Approx. 18 kg per coil"
                  />
                </div>

                <div className="catalog-field">
                  <label htmlFor="spec-dimensions">Dimensions</label>
                  <input
                    id="spec-dimensions"
                    type="text"
                    value={formData.specifications.dimensions}
                    onChange={(event) => handleSpecificationChange('dimensions', event.target.value)}
                    placeholder="16mm pipe, 500m roll"
                  />
                </div>

                <div className="catalog-field">
                  <label htmlFor="spec-power-source">Power Source</label>
                  <input
                    id="spec-power-source"
                    type="text"
                    value={formData.specifications.powerSource}
                    onChange={(event) => handleSpecificationChange('powerSource', event.target.value)}
                    placeholder="Water pressure, electric motor, or pump"
                  />
                </div>

                <div className="catalog-field">
                  <label htmlFor="spec-material">Material</label>
                  <input
                    id="spec-material"
                    type="text"
                    value={formData.specifications.material}
                    onChange={(event) => handleSpecificationChange('material', event.target.value)}
                    placeholder="UV-stabilized LLDPE"
                  />
                </div>

                <div className="catalog-field catalog-field--full">
                  <label htmlFor="spec-coverage">Coverage / Usage</label>
                  <input
                    id="spec-coverage"
                    type="text"
                    value={formData.specifications.coverage}
                    onChange={(event) => handleSpecificationChange('coverage', event.target.value)}
                    placeholder="Row crops, gardens, orchards, greenhouse setups"
                  />
                </div>
              </div>
            </section>

            <section className="catalog-card">
              <div className="product-section-heading product-section-heading--inline">
                <div>
                  <h2>Key Features</h2>
                  <p>Use short benefit-led points. These appear as a two-column feature list.</p>
                </div>
                <button type="button" className="catalog-btn" onClick={addFeature}>
                  <Plus size={15} /> Add Feature
                </button>
              </div>

              <div className="product-feature-list">
                {formData.keyFeatures.map((feature, index) => (
                  <div className="product-repeat-row" key={index}>
                    <input
                      type="text"
                      value={feature}
                      onChange={(event) => handleFeatureChange(index, event.target.value)}
                      placeholder="Efficient water distribution for farm irrigation"
                    />
                    <button
                      type="button"
                      className="catalog-btn catalog-btn--danger"
                      onClick={() => removeFeature(index)}
                      disabled={formData.keyFeatures.length <= 1}
                      title="Remove feature"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="catalog-card">
              <div className="product-section-heading">
                <h2>Reviews & Ratings</h2>
                <p>These fields are optional. Use them for seed data or highlighted verified reviews; actual customer reviews can still come from users later.</p>
              </div>

              <div className="catalog-form-grid product-rating-grid">
                <div className="catalog-field">
                  <label htmlFor="average-rating">Average Rating</label>
                  <input
                    id="average-rating"
                    name="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleInputChange}
                    placeholder="4.6"
                  />
                </div>

                <div className="catalog-field">
                  <label htmlFor="total-reviews">Total Reviews</label>
                  <input
                    id="total-reviews"
                    name="totalReviews"
                    type="number"
                    min="0"
                    value={formData.totalReviews}
                    onChange={handleInputChange}
                    placeholder="16"
                  />
                </div>
              </div>

              <div className="product-rating-breakdown">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div className="catalog-field" key={rating}>
                    <label htmlFor={`rating-${rating}`}>
                      {rating} <Star size={12} fill="currentColor" />
                    </label>
                    <input
                      id={`rating-${rating}`}
                      type="number"
                      min="0"
                      value={formData.ratingBreakdown[rating]}
                      onChange={(event) => handleRatingBreakdownChange(rating, event.target.value)}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>

              <div className="product-section-heading product-section-heading--inline product-review-heading">
                <div>
                  <h3>Featured Reviews</h3>
                  <p>Add only reviews you want shown prominently on the product page.</p>
                </div>
                <button type="button" className="catalog-btn" onClick={addReview}>
                  <Plus size={15} /> Add Review
                </button>
              </div>

              <div className="product-review-list">
                {formData.reviews.map((review, index) => (
                  <div className="product-review-editor" key={index}>
                    <div className="catalog-form-grid product-review-grid">
                      <div className="catalog-field">
                        <label htmlFor={`review-customer-${index}`}>Customer Name</label>
                        <input
                          id={`review-customer-${index}`}
                          type="text"
                          value={review.customer}
                          onChange={(event) => handleReviewChange(index, 'customer', event.target.value)}
                          placeholder="Ramesh Babu"
                        />
                      </div>

                      <div className="catalog-field">
                        <label htmlFor={`review-rating-${index}`}>Rating</label>
                        <select
                          id={`review-rating-${index}`}
                          value={review.rating}
                          onChange={(event) => handleReviewChange(index, 'rating', event.target.value)}
                        >
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="3">3 Stars</option>
                          <option value="2">2 Stars</option>
                          <option value="1">1 Star</option>
                        </select>
                      </div>

                      <div className="catalog-field">
                        <label htmlFor={`review-date-${index}`}>Review Date</label>
                        <input
                          id={`review-date-${index}`}
                          type="month"
                          value={review.date}
                          onChange={(event) => handleReviewChange(index, 'date', event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="catalog-field">
                      <label htmlFor={`review-comment-${index}`}>Review Comment</label>
                      <textarea
                        id={`review-comment-${index}`}
                        value={review.comment}
                        onChange={(event) => handleReviewChange(index, 'comment', event.target.value)}
                        placeholder="Good build quality and useful for regular agricultural work."
                      />
                    </div>

                    <div className="product-review-actions">
                      <label className="product-checkbox">
                        <input
                          type="checkbox"
                          checked={review.verified}
                          onChange={(event) => handleReviewChange(index, 'verified', event.target.checked)}
                        />
                        Verified purchase
                      </label>
                      <button
                        type="button"
                        className="catalog-btn catalog-btn--danger"
                        onClick={() => removeReview(index)}
                        disabled={formData.reviews.length <= 1}
                      >
                        <Trash2 size={15} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="catalog-stack product-sticky-panel">
            <section className="catalog-subpanel">
              <h3>Inventory & Pricing</h3>
              <div className="catalog-form-grid product-compact-grid">
                <div className="catalog-field">
                  <label htmlFor="product-mrp">MRP / Base Price</label>
                  <input
                    id="product-mrp"
                    name="mrp"
                    type="number"
                    min="0"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="catalog-field">
                  <label htmlFor="product-stock">Stock</label>
                  <input
                    id="product-stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="catalog-field">
                <label htmlFor="discount-type">Discount Type</label>
                <select id="discount-type" name="discountType" value={formData.discountType} onChange={handleInputChange}>
                  <option value="none">No Discount</option>
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed">Fixed Amount Off</option>
                </select>
              </div>

              <div className="catalog-field">
                <label htmlFor="discount-value">
                  {formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                </label>
                <input
                  id="discount-value"
                  name="discountValue"
                  type="number"
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  disabled={formData.discountType === 'none'}
                  placeholder={formData.discountType === 'percentage' ? '29' : '500'}
                />
              </div>

              <div className="product-price-preview">
                <span>Selling Price</span>
                <strong>{formatCurrency(sellingPrice)}</strong>
                <p>{discountSummary}</p>
              </div>

              <div className="catalog-field">
                <label htmlFor="product-status">Stock Status</label>
                <select id="product-status" name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </section>

            <section className="catalog-subpanel">
              <h3>Delivery & Trust</h3>
              <div className="catalog-field">
                <label htmlFor="country-origin">Country of Origin</label>
                <input
                  id="country-origin"
                  name="countryOfOrigin"
                  type="text"
                  value={formData.countryOfOrigin}
                  onChange={handleInputChange}
                  placeholder="India"
                />
              </div>
              <div className="catalog-field">
                <label htmlFor="cod-available">COD Availability</label>
                <select id="cod-available" name="codAvailable" value={formData.codAvailable} onChange={handleInputChange}>
                  <option value="Yes">COD Available</option>
                  <option value="No">COD Not Available</option>
                </select>
              </div>
              <div className="catalog-field">
                <label htmlFor="delivery-estimate">Estimated Delivery</label>
                <input
                  id="delivery-estimate"
                  name="deliveryEstimate"
                  type="text"
                  value={formData.deliveryEstimate}
                  onChange={handleInputChange}
                  placeholder="3-7 business days"
                />
              </div>
              <div className="catalog-field">
                <label htmlFor="return-policy">Delivery & Return</label>
                <input
                  id="return-policy"
                  name="returnPolicy"
                  type="text"
                  value={formData.returnPolicy}
                  onChange={handleInputChange}
                  placeholder="Easy Returns"
                />
              </div>
            </section>

            <section className="catalog-subpanel">
              <h3>Product Media</h3>
              <label className="catalog-upload" htmlFor="product-images">
                <span className="catalog-upload__box" style={{ height: '100px' }}>
                  {imageFiles.length ? (
                    <div className="image-preview-grid">
                      {imageFiles.map((file, idx) => (
                        <img key={idx} src={URL.createObjectURL(file)} alt="preview" className="image-thumb" />
                      ))}
                    </div>
                  ) : (
                    <Upload size={24} />
                  )}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>Upload Images ({imageFiles.length ? `${imageFiles.length}/7` : '4‑7'})</strong>
                    {imageFiles.length > 0 && (
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
                        onClick={(e) => { e.preventDefault(); setShowImagePreview(true); }}
                        title="Preview Images"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                  </div>
                  <span>Square images work best.</span>
                </span>
                <input id="product-images" type="file" accept="image/*" multiple onChange={handleImageChange} />
              </label>
              <label className="catalog-upload" htmlFor="product-video" style={{ marginTop: '12px' }}>
                <span className="catalog-upload__box" style={{ height: '180px' }}>
                  {formData.videoPreview ? <video src={formData.videoPreview} controls style={{ width: '100%', height: '100%' }} /> : <Upload size={24} />}
                </span>
                <span>
                  <strong>Upload Video (MP4)</strong>
                </span>
                <input id="product-video" type="file" accept="video/mp4" onChange={handleVideoChange} />
              </label>
            </section>

            <div className="product-assurance">
              <Tractor size={20} />
              <div>
                <strong>Customer Page Coverage</strong>
                <p>Pricing, specs, features, details, delivery, and ratings are now captured for the product details view.</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="catalog-actions product-form-actions">
          <button type="submit" className="catalog-btn catalog-btn--primary" disabled={!availableSubcategories.length || isSaving}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Product'}
          </button>
          <button type="button" className="catalog-btn" onClick={() => navigate('/admin/catalog/products')}>
            Cancel
          </button>
        </div>
      </form>

      {showImagePreview && (
        <div className="catalog-modal-overlay" onClick={() => setShowImagePreview(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="catalog-modal" onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="catalog-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Image Previews ({imageFiles.length})</h3>
              <button onClick={() => setShowImagePreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="catalog-modal-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
               {imageFiles.map((file, idx) => (
                 <img key={idx} src={URL.createObjectURL(file)} alt="preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} />
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsForm;
