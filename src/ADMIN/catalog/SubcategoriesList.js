import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Edit, Filter, Plus, Search, Tags, Trash2, X } from 'lucide-react';
import { getCategoryName } from './catalogStore';
import {
  deleteSubcategory as deleteSubcategoryApi,
  fetchCategories,
  fetchProducts,
  fetchSubcategories,
  saveSubcategory,
} from './catalogApi';
import './adminModule.css';

const SubcategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadCatalogData = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [loadedCategories, rawSubcategories, loadedProducts] = await Promise.all([
          fetchCategories(),
          fetchSubcategories().catch(() => []),
          fetchProducts().catch(() => [])
        ]);

        const normalizedProducts = loadedProducts.map(p => ({
          id: String(p.id || p.productId || p.Id || p.ProductId || ''),
          subcategoryId: String(p.subcategoryId || p.SubCategoryId || ''),
        }));

        if (isMounted) {
          setCategories(loadedCategories);
          setSubcategories(rawSubcategories);
          setProducts(normalizedProducts);
        }
      } catch (apiError) {
        if (isMounted) setError(apiError.message || 'Unable to load subcategories.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCatalogData();
    return () => {
      isMounted = false;
    };
  }, []);

  const productCounts = useMemo(() => {
    const counts = subcategories.reduce((currentCounts, subcategory) => {
      if (Array.isArray(subcategory.products)) {
        currentCounts[subcategory.id] = subcategory.products.length;
      }
      return currentCounts;
    }, {});

    return products.reduce((currentCounts, product) => {
      if (currentCounts[product.subcategoryId] !== undefined) return currentCounts;
      currentCounts[product.subcategoryId] = (currentCounts[product.subcategoryId] || 0) + 1;
      return currentCounts;
    }, counts);
  }, [products, subcategories]);

  const filteredSubcategories = subcategories.filter((subcategory) => {
    const query = searchTerm.toLowerCase();
    const categoryName = getCategoryName(categories, subcategory.categoryId).toLowerCase();
    const matchesSearch =
      subcategory.name.toLowerCase().includes(query) ||
      subcategory.slug.toLowerCase().includes(query) ||
      categoryName.includes(query);
    const matchesCategory = selectedCategoryId === 'All' || subcategory.categoryId === selectedCategoryId;

    return matchesSearch && matchesCategory;
  });

  const toggleStatus = async (id) => {
    const subcategory = subcategories.find((item) => item.id === id);
    if (!subcategory) return;

    const updatedSubcategory = {
      ...subcategory,
      status: subcategory.status === 'Active' ? 'Inactive' : 'Active',
    };
    const previousSubcategories = subcategories;
    setSubcategories((current) => current.map((item) => (item.id === id ? updatedSubcategory : item)));

    try {
      const savedSubcategory = await saveSubcategory(updatedSubcategory);
      setSubcategories((current) => current.map((item) => (item.id === id ? savedSubcategory : item)));
    } catch (apiError) {
      setSubcategories(previousSubcategories);
      setError(apiError.message || 'Unable to update subcategory status.');
    }
  };

  const deleteSubcategory = async (id) => {
    if (productCounts[id]) {
      window.alert('Move or delete linked products before deleting this subcategory.');
      return;
    }

    if (!window.confirm('Delete this subcategory?')) return;
    try {
      await deleteSubcategoryApi(id);
      setSubcategories((current) => current.filter((subcategory) => subcategory.id !== id));
    } catch (apiError) {
      setError(apiError.message || 'Unable to delete subcategory.');
    }
  };

  return (
    <div className="catalog-page">
      <section className="catalog-header">
        <div className="catalog-title-wrap">
          <span className="catalog-kicker">Step 2 of 3</span>
          <h1>Subcategories</h1>
          <p>Subcategories sit under categories and become the required product grouping.</p>
        </div>

        <div className="catalog-header__actions">
          <Link to="/admin/catalog/categories" className="catalog-btn">
            View Categories
          </Link>
          <Link to="/admin/catalog/subcategory" className="catalog-btn catalog-btn--primary">
            <Plus size={16} /> Add Subcategory
          </Link>
        </div>
      </section>

      <section className="catalog-card">
        {error && <div className="catalog-alert catalog-alert--danger">{error}</div>}
        <div className="catalog-filterbar">
          <div className="catalog-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search subcategory, slug, or category"
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
            <span className="catalog-count">{filteredSubcategories.length} subcategories</span>
          </div>
        </div>

        <div className="catalog-table-wrap">
          <table className="catalog-table">
            <thead>
              <tr>
                <th>Subcategory</th>
                <th>Parent Category</th>
                <th>Slug</th>
                <th>Description</th>
                <th className="catalog-center-cell">Products</th>
                <th>Status</th>
                <th className="catalog-center-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="7" className="catalog-center-cell">
                    Loading subcategories...
                  </td>
                </tr>
              )}
              {!isLoading && filteredSubcategories.map((subcategory) => (
                <tr key={subcategory.id}>
                  <td>
                    <span className="catalog-badge">
                      <Tags size={14} /> {subcategory.id}
                    </span>
                    <div className="catalog-table__title">{subcategory.name}</div>
                  </td>
                  <td>{getCategoryName(categories, subcategory.categoryId)}</td>
                  <td className="catalog-path">{subcategory.slug}</td>
                  <td>
                    <div className="catalog-table__muted">{subcategory.description}</div>
                  </td>
                  <td className="catalog-center-cell">{productCounts[subcategory.id] || 0}</td>
                  <td>
                    <button
                      type="button"
                      className={`catalog-badge ${
                        subcategory.status === 'Active' ? 'catalog-badge--active' : 'catalog-badge--inactive'
                      }`}
                      onClick={() => toggleStatus(subcategory.id)}
                    >
                      {subcategory.status === 'Active' ? <Check size={13} /> : <X size={13} />}
                      {subcategory.status}
                    </button>
                  </td>
                  <td>
                    <div className="catalog-inline-actions">
                      <Link
                        to={`/admin/catalog/subcategory?id=${subcategory.id}`}
                        className="catalog-btn catalog-btn--icon"
                        title="Edit subcategory"
                      >
                        <Edit size={15} />
                      </Link>
                      <button
                        type="button"
                        className="catalog-btn catalog-btn--icon catalog-btn--danger"
                        onClick={() => deleteSubcategory(subcategory.id)}
                        title="Delete subcategory"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !filteredSubcategories.length && (
                <tr>
                  <td colSpan="7" className="catalog-center-cell">
                    No subcategories match your filters.
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

export default SubcategoriesList;
