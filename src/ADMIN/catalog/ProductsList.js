import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, Edit, Filter, Package, Plus, Search, Star, Trash2 } from 'lucide-react';
import {
  getCategoryName,
  getSubcategoryName,
} from './catalogStore';
import {
  deleteProduct as deleteProductApi,
  fetchCategories,
  fetchProducts,
  fetchSubcategories,
  searchProducts,
} from './productsApi';
import './adminModule.css';

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

const getStatusClass = (status) => {
  if (status === 'In Stock') return 'catalog-badge--stock';
  if (status === 'Low Stock') return 'catalog-badge--low';
  return 'catalog-badge--out';
};

const getDiscountLabel = (product) => {
  const mrp = Number(product.mrp) || 0;
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
  const [isSearching, setIsSearching] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ── Load taxonomy & full product list on mount ────────────────────────────
  const loadAll = useCallback(async (isMounted) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [cats, subcats] = await Promise.all([
        fetchCategories(),
        fetchSubcategories(),
      ]);
      if (!isMounted) return;
      setCategories(cats);
      setSubcategories(subcats);

      const apiProducts = await fetchProducts(cats, subcats);
      if (isMounted) setProducts(apiProducts);
    } catch (error) {
      if (isMounted) setErrorMessage(error.message || 'Unable to load products.');
    } finally {
      if (isMounted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    loadAll(isMounted);
    return () => { isMounted = false; };
  }, [loadAll]);

  // ── API-side search (debounced 400 ms) ────────────────────────────────────
  useEffect(() => {
    if (!searchTerm.trim()) return; // empty → show all from local state

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchProducts(searchTerm.trim(), categories, subcategories);
        if (!cancelled) setProducts(results);
      } catch (err) {
        if (!cancelled) setErrorMessage(err.message || 'Search failed.');
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm, categories, subcategories]);

  // When search is cleared, reload the full list
  useEffect(() => {
    if (searchTerm.trim()) return;
    let isMounted = true;
    loadAll(isMounted);
    return () => { isMounted = false; };
  }, [searchTerm, loadAll]);

  // ── Client-side filter by category + status ───────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategoryId === 'All' || product.categoryId === selectedCategoryId;
      const matchesStatus =
        selectedStatus === 'All' || product.status === selectedStatus;
      return matchesCategory && matchesStatus;
    });
  }, [products, selectedCategoryId, selectedStatus]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setIsDeletingId(id);
    setErrorMessage('');
    try {
      await deleteProductApi(id);
      setProducts((current) => current.filter((p) => p.id !== id));
    } catch (error) {
      setErrorMessage(error.message || 'Unable to delete product.');
    } finally {
      setIsDeletingId('');
    }
  };

  const busy = isLoading || isSearching;

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
          {/* API-backed search */}
          <div className="catalog-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search product name, SKU…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="catalog-inline-actions">
            {/* Category filter */}
            <label className="catalog-filter">
              <Filter size={16} />
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Status filter */}
            <label className="catalog-filter">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </label>

            <span className="catalog-count">
              {busy ? '…' : filteredProducts.length} products
            </span>
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
                <th className="catalog-number-cell">MRP / Price</th>
                <th>Discount</th>
                <th>Rating</th>
                <th className="catalog-center-cell">Stock</th>
                <th>Status</th>
                <th className="catalog-center-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {busy && (
                <tr>
                  <td colSpan="10" className="catalog-center-cell">
                    {isLoading ? 'Loading products from API…' : 'Searching…'}
                  </td>
                </tr>
              )}

              {!busy && filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <span className="catalog-badge">
                      <Package size={14} /> #{product.id}
                    </span>
                    <div className="catalog-table__title">{product.name}</div>
                    <div className="catalog-table__muted">
                      {product.brand || 'Brand not set'} · {product.specifications?.weight || 'Weight N/A'}
                    </div>
                  </td>
                  <td className="catalog-path">{product.sku || '—'}</td>
                  <td>{getCategoryName(categories, product.categoryId)}</td>
                  <td>{getSubcategoryName(subcategories, product.subcategoryId)}</td>
                  <td className="catalog-number-cell">
                    {formatCurrency(product.price)}
                    {Number(product.mrp) > Number(product.price) && (
                      <div className="catalog-table__muted">
                        MRP {formatCurrency(product.mrp)}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      className={`catalog-badge ${
                        Number(product.mrp) > Number(product.price) ? 'catalog-badge--low' : ''
                      }`}
                    >
                      {getDiscountLabel(product)}
                    </span>
                  </td>
                  <td>
                    <span className="catalog-badge">
                      <Star size={13} fill="currentColor" />{' '}
                      {Number(product.rating || 0).toFixed(1)}
                    </span>
                    <div className="catalog-table__muted">
                      {Number(product.totalReviews || 0)} reviews
                    </div>
                  </td>
                  <td className="catalog-center-cell">{product.stock}</td>
                  <td>
                    <span className={`catalog-badge ${getStatusClass(product.status)}`}>
                      {product.status === 'In Stock' ? (
                        <Check size={13} />
                      ) : (
                        <AlertTriangle size={13} />
                      )}
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
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeletingId === product.id}
                        title="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!busy && !filteredProducts.length && (
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
