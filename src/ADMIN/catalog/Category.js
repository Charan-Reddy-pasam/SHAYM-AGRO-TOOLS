import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Layers, Plus, Save, Upload } from 'lucide-react';
import { slugify } from './catalogStore';
import { fetchCategory, saveCategory as saveCategoryApi } from './catalogApi';
import './adminModule.css';

const emptyCategory = {
  id: '',
  name: '',
  slug: '',
  description: '',
  status: 'Active',
  displayOrder: '',
  metaTitle: '',
  metaDescription: '',
  image: '',
  imageFile: null,
};

const Category = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('id');
  const [formData, setFormData] = useState(emptyCategory);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(categoryId));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(categoryId);

  useEffect(() => {
    if (!categoryId) return;
    let isMounted = true;

    const loadCategory = async () => {
      try {
        setIsLoading(true);
        setError('');
        const existingCategory = await fetchCategory(categoryId);
        if (!isMounted) return;
        setFormData({
          ...emptyCategory,
          ...existingCategory,
          displayOrder: String(existingCategory.displayOrder || ''),
          imageFile: null,
        });
      } catch (apiError) {
        if (isMounted) setError(apiError.message || 'Unable to load category.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCategory();
    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
      slug: name === 'name' && !isEditing ? slugify(value) : current.slug,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((current) => ({ ...current, image: reader.result, imageFile: file }));
    };
    reader.readAsDataURL(file);
  };

  const saveCategory = async () => {
    setIsSaving(true);
    setError('');

    try {
      const savedCategory = await saveCategoryApi({
        ...formData,
        slug: formData.slug || slugify(formData.name),
        metaTitle: formData.metaTitle || `${formData.name} | Shyam Agro Tools`,
        metaDescription: formData.metaDescription || formData.description,
      });

      setFormData((current) => ({ ...current, ...savedCategory, imageFile: null }));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2200);
      return savedCategory;
    } catch (apiError) {
      setError(apiError.message || 'Unable to save category.');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await saveCategory();
  };

  const handleSaveAndAddSubcategory = async () => {
    const savedCategory = await saveCategory();
    if (savedCategory) navigate(`/admin/catalog/subcategory?categoryId=${savedCategory.id}`);
  };

  return (
    <div className="catalog-page">
      <section className="catalog-header">
        <div className="catalog-title-wrap">
          <span className="catalog-kicker">Step 1 of 3</span>
          <h1>{isEditing ? 'Edit Category' : 'Create Category'}</h1>
          <p>Create the main catalog group first. Subcategories and products will depend on this category.</p>
        </div>

        <div className="catalog-header__actions">
          <Link to="/admin/catalog/categories" className="catalog-btn">
            <ArrowLeft size={16} /> Categories List
          </Link>
          <button type="button" className="catalog-btn catalog-btn--primary" onClick={handleSaveAndAddSubcategory}>
            <Plus size={16} /> Save & Add Subcategory
          </button>
        </div>
      </section>

      <section className="catalog-card">
        <div className="catalog-card__header">
          <div>
            <h2>Category Details</h2>
            <p className="catalog-card__subtitle">Keep names clear because they appear in forms, filters, and product organization.</p>
          </div>
          {isSaved && (
            <span className="catalog-alert">
              <CheckCircle size={16} /> Category saved
            </span>
          )}
        </div>

        {error && <div className="catalog-alert catalog-alert--danger">{error}</div>}
        {isLoading ? (
          <div className="catalog-center-cell">Loading category...</div>
        ) : (
          <form className="catalog-form" onSubmit={handleSubmit}>
          <div className="catalog-form-grid">
            <div className="catalog-field">
              <label htmlFor="category-name">Category Name</label>
              <input
                id="category-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Farm Tools & Machinery"
                required
              />
            </div>

            <div className="catalog-field">
              <label htmlFor="category-slug">URL Slug</label>
              <input
                id="category-slug"
                name="slug"
                type="text"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="farm-tools-machinery"
                required
              />
            </div>
          </div>

          <div className="catalog-form-grid catalog-form-grid--three">
            <div className="catalog-field">
              <label htmlFor="category-order">Display Order</label>
              <input
                id="category-order"
                name="displayOrder"
                type="number"
                min="1"
                value={formData.displayOrder}
                onChange={handleInputChange}
                placeholder="1"
              />
            </div>

            <div className="catalog-field">
              <label htmlFor="category-status">Status</label>
              <select id="category-status" name="status" value={formData.status} onChange={handleInputChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="catalog-field">
              <label>Category Image</label>
              <label className="catalog-upload" htmlFor="category-image">
                <span className="catalog-upload__box">
                  {formData.image ? <img src={formData.image} alt="" /> : <Upload size={24} />}
                </span>
                <span>
                  <strong>Upload Image</strong>
                  <span>Square image works best for listings.</span>
                </span>
                <input id="category-image" type="file" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div className="catalog-field">
            <label htmlFor="category-description">Description</label>
            <textarea
              id="category-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what products belong to this category."
              required
            />
          </div>

          <div className="catalog-subpanel">
            <h3>
              <Layers size={15} /> Search Metadata
            </h3>
            <div className="catalog-form-grid">
              <div className="catalog-field">
                <label htmlFor="category-meta-title">Meta Title</label>
                <input
                  id="category-meta-title"
                  name="metaTitle"
                  type="text"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  placeholder="Category page title"
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="category-meta-description">Meta Description</label>
                <input
                  id="category-meta-description"
                  name="metaDescription"
                  type="text"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="Short search description"
                />
              </div>
            </div>
          </div>

          <div className="catalog-actions">
            <button type="submit" className="catalog-btn catalog-btn--primary">
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Category'}
            </button>
            <button type="button" className="catalog-btn" onClick={() => navigate('/admin/catalog/categories')}>
              Cancel
            </button>
          </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default Category;
