import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Plus, Save, Tags, Upload } from 'lucide-react';
import {
  slugify,
} from './catalogStore';
import { fetchCategories, fetchSubcategory, saveSubcategory as saveSubcategoryApi } from './catalogApi';
import './adminModule.css';

const emptySubcategory = {
  id: '',
  name: '',
  slug: '',
  categoryId: '',
  description: '',
  status: 'Active',
  displayOrder: '',
  image: '',
  imageFile: null,
};

const SubcategoryForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subcategoryId = searchParams.get('id');
  const preselectedCategoryId = searchParams.get('categoryId');
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    ...emptySubcategory,
    categoryId: preselectedCategoryId || '',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(subcategoryId);

  useEffect(() => {
    let isMounted = true;

    const loadFormData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [loadedCategories, existingSubcategory] = await Promise.all([
          fetchCategories(),
          subcategoryId ? fetchSubcategory(subcategoryId) : Promise.resolve(null),
        ]);

        if (!isMounted) return;
        setCategories(loadedCategories);
        setFormData((current) => ({
          ...emptySubcategory,
          ...current,
          ...(existingSubcategory || {}),
          categoryId: existingSubcategory?.categoryId || preselectedCategoryId || loadedCategories[0]?.id || '',
          displayOrder: existingSubcategory ? String(existingSubcategory.displayOrder || '') : current.displayOrder,
          imageFile: null,
        }));
      } catch (apiError) {
        if (isMounted) setError(apiError.message || 'Unable to load subcategory form data.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadFormData();
    return () => {
      isMounted = false;
    };
  }, [preselectedCategoryId, subcategoryId]);

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

  const saveSubcategory = async () => {
    setIsSaving(true);
    setError('');

    try {
      const savedSubcategory = await saveSubcategoryApi({
        ...formData,
        slug: formData.slug || slugify(formData.name),
      });

      setFormData((current) => ({ ...current, ...savedSubcategory, imageFile: null }));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2200);
      return savedSubcategory;
    } catch (apiError) {
      setError(apiError.message || 'Unable to save subcategory.');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await saveSubcategory();
  };

  const handleSaveAndAddProduct = async () => {
    const savedSubcategory = await saveSubcategory();
    if (savedSubcategory) {
      navigate(`/admin/catalog/products-form?categoryId=${savedSubcategory.categoryId}&subcategoryId=${savedSubcategory.id}`);
    }
  };

  if (!isLoading && !categories.length) {
    return (
      <div className="catalog-page">
        <section className="catalog-empty-state">
          <Tags size={34} />
          <h3>Create a category first</h3>
          <p>Subcategories must belong to a category. Add a category, then come back to add subcategories under it.</p>
          <Link to="/admin/catalog/category" className="catalog-btn catalog-btn--primary">
            <Plus size={16} /> Add Category
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <section className="catalog-header">
        <div className="catalog-title-wrap">
          <span className="catalog-kicker">Step 2 of 3</span>
          <h1>{isEditing ? 'Edit Subcategory' : 'Create Subcategory'}</h1>
          <p>Attach each subcategory to a category so products can be grouped cleanly.</p>
        </div>

        <div className="catalog-header__actions">
          <Link to="/admin/catalog/subcategories" className="catalog-btn">
            <ArrowLeft size={16} /> Subcategories List
          </Link>
          <button type="button" className="catalog-btn catalog-btn--primary" onClick={handleSaveAndAddProduct}>
            <Plus size={16} /> Save & Add Product
          </button>
        </div>
      </section>

      <section className="catalog-card">
        <div className="catalog-card__header">
          <div>
            <h2>Subcategory Details</h2>
            <p className="catalog-card__subtitle">Choose the parent category before adding product-specific groups.</p>
          </div>
          {isSaved && (
            <span className="catalog-alert">
              <CheckCircle size={16} /> Subcategory saved
            </span>
          )}
        </div>

        {error && <div className="catalog-alert catalog-alert--danger">{error}</div>}
        {isLoading ? (
          <div className="catalog-center-cell">Loading subcategory...</div>
        ) : (
        <form className="catalog-form" onSubmit={handleSubmit}>
          <div className="catalog-form-grid">
            <div className="catalog-field">
              <label htmlFor="subcategory-name">Subcategory Name</label>
              <input
                id="subcategory-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Power Tillers"
                required
              />
            </div>

            <div className="catalog-field">
              <label htmlFor="subcategory-slug">URL Slug</label>
              <input
                id="subcategory-slug"
                name="slug"
                type="text"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="power-tillers"
                required
              />
            </div>
          </div>

          <div className="catalog-form-grid catalog-form-grid--three">
            <div className="catalog-field">
              <label htmlFor="subcategory-category">Parent Category</label>
              <select
                id="subcategory-category"
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
              <label htmlFor="subcategory-order">Display Order</label>
              <input
                id="subcategory-order"
                name="displayOrder"
                type="number"
                min="1"
                value={formData.displayOrder}
                onChange={handleInputChange}
                placeholder="1"
              />
            </div>

            <div className="catalog-field">
              <label htmlFor="subcategory-status">Status</label>
              <select id="subcategory-status" name="status" value={formData.status} onChange={handleInputChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="catalog-field">
            <label htmlFor="subcategory-description">Description</label>
            <textarea
              id="subcategory-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe this product group."
              required
            />
          </div>

          <div className="catalog-field">
            <label>Subcategory Image</label>
            <label className="catalog-upload" htmlFor="subcategory-image">
              <span className="catalog-upload__box">
                {formData.image ? <img src={formData.image} alt="" /> : <Upload size={24} />}
              </span>
              <span>
                <strong>Upload Image</strong>
                <span>Useful for category landing sections and filters.</span>
              </span>
              <input id="subcategory-image" type="file" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>

          <div className="catalog-actions">
            <button type="submit" className="catalog-btn catalog-btn--primary">
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Subcategory'}
            </button>
            <button type="button" className="catalog-btn" onClick={() => navigate('/admin/catalog/subcategories')}>
              Cancel
            </button>
          </div>
        </form>
        )}
      </section>
    </div>
  );
};

export default SubcategoryForm;
