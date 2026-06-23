import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Edit, Layers, Plus, Search, Trash2, X } from 'lucide-react';
import { deleteCategory as deleteCategoryApi, fetchCategories, saveCategory } from './catalogApi';
import './adminModule.css';

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setError('');

        const [loadedCategories, rawProductsRes] = await Promise.all([
          fetchCategories(),
          fetch('https://excretory-powdering-mocker.ngrok-free.dev/api/Catalog/products', {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          }).then(r => r.json()).catch(() => [])
        ]);

        let loadedProducts = [];
        if (Array.isArray(rawProductsRes)) {
          loadedProducts = rawProductsRes;
        } else if (rawProductsRes && Array.isArray(rawProductsRes.data)) {
          loadedProducts = rawProductsRes.data;
        } else if (rawProductsRes && Array.isArray(rawProductsRes.products)) {
          loadedProducts = rawProductsRes.products;
        }

        const normalizedProducts = loadedProducts.map(p => ({
          id: String(p.id || p.productId || p.Id || p.ProductId || ''),
          categoryId: String(p.categoryId || p.CategoryId || ''),
        }));

        if (isMounted) {
          setCategories(loadedCategories);
          setProducts(normalizedProducts);
        }
      } catch (apiError) {
        if (isMounted) setError(apiError.message || 'Unable to load categories.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const categoryStats = useMemo(() => {
    return categories.reduce((stats, category) => {
      const childSubcategories = Array.isArray(category.subCategories) ? category.subCategories : [];
      const childProducts = Array.isArray(category.products)
        ? category.products
        : products.filter((product) => product.categoryId === category.id);

      stats[category.id] = {
        subcategories: childSubcategories.length,
        products: childProducts.length,
      };

      return stats;
    }, {});
  }, [categories, products]);

  const filteredCategories = categories.filter((category) => {
    const query = searchTerm.toLowerCase();
    return (
      category.name.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query)
    );
  });

  const toggleStatus = async (id) => {
    const category = categories.find((item) => item.id === id);
    if (!category) return;

    const updatedCategory = {
      ...category,
      status: category.status === 'Active' ? 'Inactive' : 'Active',
    };
    const previousCategories = categories;
    setCategories((current) => current.map((item) => (item.id === id ? updatedCategory : item)));

    try {
      const savedCategory = await saveCategory(updatedCategory);
      setCategories((current) => current.map((item) => (item.id === id ? savedCategory : item)));
    } catch (apiError) {
      setCategories(previousCategories);
      setError(apiError.message || 'Unable to update category status.');
    }
  };

  const deleteCategory = async (id) => {
    const stats = categoryStats[id] || { subcategories: 0, products: 0 };
    if (stats.subcategories || stats.products) {
      window.alert('Move or delete linked subcategories and products before deleting this category.');
      return;
    }

    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategoryApi(id);
      setCategories((current) => current.filter((category) => category.id !== id));
    } catch (apiError) {
      setError(apiError.message || 'Unable to delete category.');
    }
  };

  return (
    <div className="catalog-page">
      <section className="catalog-header">
        <div className="catalog-title-wrap">
          <span className="catalog-kicker">Step 1 of 3</span>
          <h1>Categories</h1>
          <p>Create category groups first. Subcategories and products are linked from here.</p>
        </div>

        <div className="catalog-header__actions">
          <Link to="/admin/catalog/subcategories" className="catalog-btn">
            View Subcategories
          </Link>
          <Link to="/admin/catalog/category" className="catalog-btn catalog-btn--primary">
            <Plus size={16} /> Add Category
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
              placeholder="Search category name, slug, or description"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <span className="catalog-count">{filteredCategories.length} categories</span>
        </div>

        <div className="catalog-table-wrap">
          <table className="catalog-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Description</th>
                <th className="catalog-center-cell">Subcategories</th>
                <th className="catalog-center-cell">Products</th>
                <th>Status</th>
                <th className="catalog-center-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="7" className="catalog-center-cell">
                    Loading categories...
                  </td>
                </tr>
              )}
              {!isLoading && filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="catalog-inline-actions">
                      <span className="catalog-badge">
                        <Layers size={14} /> {category.code || category.id}
                      </span>
                    </div>
                    <div className="catalog-table__title">{category.name}</div>
                  </td>
                  <td className="catalog-path">{category.slug}</td>
                  <td>
                    <div className="catalog-table__muted">{category.description}</div>
                  </td>
                  <td className="catalog-center-cell">{categoryStats[category.id]?.subcategories || 0}</td>
                  <td className="catalog-center-cell">{categoryStats[category.id]?.products || 0}</td>
                  <td>
                    <button
                      type="button"
                      className={`catalog-badge ${
                        category.status === 'Active' ? 'catalog-badge--active' : 'catalog-badge--inactive'
                      }`}
                      onClick={() => toggleStatus(category.id)}
                    >
                      {category.status === 'Active' ? <Check size={13} /> : <X size={13} />}
                      {category.status}
                    </button>
                  </td>
                  <td>
                    <div className="catalog-inline-actions">
                      <Link
                        to={`/admin/catalog/category?id=${category.id}`}
                        className="catalog-btn catalog-btn--icon"
                        title="Edit category"
                      >
                        <Edit size={15} />
                      </Link>
                      <button
                        type="button"
                        className="catalog-btn catalog-btn--icon catalog-btn--danger"
                        onClick={() => deleteCategory(category.id)}
                        title="Delete category"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !filteredCategories.length && (
                <tr>
                  <td colSpan="7" className="catalog-center-cell">
                    No categories match your search.
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

export default CategoriesList;
