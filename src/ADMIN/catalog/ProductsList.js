import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, Edit, Filter, Package, Plus, Search, Star, Trash2 } from 'lucide-react';
import {
  getCategoryName,
  getSubcategoryName,
} from './catalogStore';
import { deleteProduct as deleteProductApi, fetchCategories, fetchProducts, fetchSubcategories } from './catalogApi';
import './adminModule.css';

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

const getStatusClass = (status) => {
  if (status === 'In Stock') return 'catalog-badge--stock';
  if (status === 'Low Stock') return 'catalog-badge--low';
  return 'catalog-badge--out';
};

const getDiscountLabel = (product) => {
  const mrp = Number(product.mrp) || Number(product.price) || 0;
  const price = Number(product.price) || 0;
  if (!mrp || mrp <= price) return 'No discount';

  const percentage = Math.round(((mrp - price) / mrp) * 100);
  return `${percentage}% off`;
};

const ProductsList = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [cats, subcats] = await Promise.all([
          fetchCategories(),
          fetchSubcategories(),
        ]);
        if (isMounted) {
          setCategories(cats);
          setSubcategories(subcats);
        }

        const apiProducts = await fetchProducts(cats, subcats);
        if (isMounted) setProducts(apiProducts);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || 'Unable to load products.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.toLowerCase();

    return products.filter((product) => {
      const categoryName = getCategoryName(categories, product.categoryId);
      const subcategoryName = getSubcategoryName(subcategories, product.subcategoryId);
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query) ||
        subcategoryName.toLowerCase().includes(query);
      const matchesCategory = selectedCategoryId === 'All' || product.categoryId === selectedCategoryId;
      const matchesStatus = selectedStatus === 'All' || product.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categories, products, searchTerm, selectedCategoryId, selectedStatus, subcategories]);

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setIsDeletingId(id);
    setErrorMessage('');

    try {
      await deleteProductApi(id);
      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (error) {
      setErrorMessage(error.message || 'Unable to delete product.');
    } finally {
      setIsDeletingId('');
    }
  };

  return (
    <div className="catalog-page">
      <section className="catalog-header">
        <div className="catalog-title-wrap">
          <span className="catalog-kicker">Step 3 of 3</span>
          <h1>Products</h1>
          <p>Products are created after category and subcategory setup, keeping inventory organized for filters and reports.</p>
        </div>

        <div className="catalog-header__actions">
          <Link to="/admin/catalog/subcategories" className="catalog-btn">
            View Subcategories
          </Link>
          <Link to="/admin/catalog/products-form" className="catalog-btn catalog-btn--primary">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </section>

      <section className="catalog-card">
        {errorMessage && (
          <div className="catalog-alert catalog-alert--warning">
            {errorMessage}
          </div>
        )}

        <div className="catalog-filterbar">
          <div className="catalog-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search product, SKU, category, or subcategory"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="catalog-inline-actions">
            <label className="catalog-filter">
              <Filter size={16} />
              <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)}>
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="catalog-filter">
              <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                <option value="All">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </label>

            <span className="catalog-count">{filteredProducts.length} products</span>
          </div>
        </div>

        <div className="catalog-table-wrap">
          <table className="catalog-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th className="catalog-number-cell">Price</th>
                <th>Discount</th>
                <th>Rating</th>
                <th className="catalog-center-cell">Stock</th>
                <th>Status</th>
                <th className="catalog-center-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="10" className="catalog-center-cell">
                    Loading products from API...
                  </td>
                </tr>
              )}
              {!isLoading && filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <span className="catalog-badge">
                      <Package size={14} /> {product.id}
                    </span>
                    <div className="catalog-table__title">{product.name}</div>
                    <div className="catalog-table__muted">
                      {product.brand || 'Brand not set'} - {product.specifications?.weight || product.weight || 'Weight not set'}
                    </div>
                  </td>
                  <td className="catalog-path">{product.sku}</td>
                  <td>{getCategoryName(categories, product.categoryId)}</td>
                  <td>{getSubcategoryName(subcategories, product.subcategoryId)}</td>
                  <td className="catalog-number-cell">
                    {formatCurrency(product.price)}
                    {Number(product.mrp) > Number(product.price) && (
                      <div className="catalog-table__muted">MRP {formatCurrency(product.mrp)}</div>
                    )}
                  </td>
                  <td>
                    <span className={`catalog-badge ${Number(product.mrp) > Number(product.price) ? 'catalog-badge--low' : ''}`}>
                      {getDiscountLabel(product)}
                    </span>
                  </td>
                  <td>
                    <span className="catalog-badge">
                      <Star size={13} fill="currentColor" /> {Number(product.rating || 0).toFixed(1)}
                    </span>
                    <div className="catalog-table__muted">{Number(product.totalReviews || 0)} reviews</div>
                  </td>
                  <td className="catalog-center-cell">{product.stock}</td>
                  <td>
                    <span className={`catalog-badge ${getStatusClass(product.status)}`}>
                      {product.status === 'In Stock' ? <Check size={13} /> : <AlertTriangle size={13} />}
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div className="catalog-inline-actions">
                      <Link
                        to={`/admin/catalog/products-form?id=${product.id}`}
                        className="catalog-btn catalog-btn--icon"
                        title="Edit product"
                      >
                        <Edit size={15} />
                      </Link>
                      <button
                        type="button"
                        className="catalog-btn catalog-btn--icon catalog-btn--danger"
                        onClick={() => deleteProduct(product.id)}
                        disabled={isDeletingId === product.id}
                        title="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !filteredProducts.length && (
                <tr>
                  <td colSpan="10" className="catalog-center-cell">
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ProductsList;
