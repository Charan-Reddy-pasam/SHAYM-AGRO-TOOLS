import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import './brands.css';

// Inline API utilities
const API_BASE = 'https://excretory-powdering-mocker.ngrok-free.dev/api/Catalog/brands';

export const fetchBrands = async () => {
  const res = await fetch(API_BASE, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch brands: ${res.status} ${err}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export const createBrand = async (brand) => {
  const res = await fetch(API_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(brand) });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create brand failed: ${res.status} ${err}`);
  }
  return await res.json();
};

export const updateBrand = async (brand) => {
  const url = `${API_BASE}/${encodeURIComponent(brand.id)}`;
  const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(brand) });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Update brand failed: ${res.status} ${err}`);
  }
  return await res.json();
};

const BrandForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const brandIdFromQuery = searchParams.get('id');
  const isEditing = Boolean(brandIdFromQuery);

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto‑generate ID on mount if in create mode
  useEffect(() => {
    const load = async () => {
      try {
        const brands = await fetchBrands();
        if (isEditing) {
          const existing = brands.find(b => b.id.toLowerCase() === brandIdFromQuery.toLowerCase());
          if (existing) {
            setId(existing.id);
            setName(existing.name);
            setLogo(existing.logo || '');
          } else {
            setErrorMsg('Brand not found.');
          }
        } else {
          // Auto‑generate next ID based on fetched brands
          const nextNum = brands.reduce((largest, b) => {
            const match = String(b.id || '').match(/BRD-(\d+)/i);
            if (match) {
              const num = parseInt(match[1], 10);
              return num > largest ? num : largest;
            }
            return largest;
          }, 0) + 1;
          setId(`BRD-${String(nextNum).padStart(3, '0')}`);
        }
      } catch (e) {
        setErrorMsg(e.message);
      }
    };
    load();
  }, [isEditing, brandIdFromQuery]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 2MB.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLogo('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Brand Name is required.');
      return;
    }

    if (!id.trim()) {
      setErrorMsg('Brand ID is required.');
      return;
    }

    try {
      if (isEditing) {
        await updateBrand({ id: id.trim(), name: name.trim(), logo });
      } else {
        await createBrand({ id: id.trim(), name: name.trim(), logo });
      }
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        navigate('/admin/brands/list');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save brand details.');
    }
  };

  return (
    <div className="brands-page">
      {/* Page Header */}
      <div className="brands-header">
        <div className="brands-title-wrap">
          <p className="catalog-kicker" style={{ color: '#2f855a', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', marginBottom: '7px' }}>Catalog Settings</p>
          <h1>{isEditing ? 'Edit Brand' : 'Create Brand'}</h1>
          <p>Define basic brand details used for catalog categorization and filtering.</p>
        </div>
        <div>
          <Link to="/admin/brands/list" className="catalog-btn">
            <ArrowLeft size={16} /> Back to Brands
          </Link>
        </div>
      </div>

      <div className="brand-form-container">
        <div className="brand-form-card">
          <div className="brand-form-header">
            <h2>Brand Information</h2>
            <p>Please enter the brand identifier, upload its logo, and input the display name.</p>
          </div>

          <form onSubmit={handleSubmit} className="brand-form">
            {/* Visual feedback notifications */}
            {isSaved && (
              <div className="catalog-alert" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <CheckCircle size={16} /> Brand saved successfully! Redirecting...
              </div>
            )}
            
            {errorMsg && (
              <div className="catalog-alert catalog-alert--warning" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            {/* Brand ID Field */}
            <div className="brand-form-group">
              <label htmlFor="brand-id">Brand ID</label>
              <input
                id="brand-id"
                type="text"
                value={id}
                onChange={(e) => !isEditing && setId(e.target.value)}
                placeholder="e.g. BRD-001"
                disabled={isEditing}
                required
              />
              <small style={{ color: '#64748b', fontSize: '12px' }}>
                {isEditing ? 'Brand ID cannot be modified once created.' : 'Auto-generated but customizable.'}
              </small>
            </div>

            {/* Brand Name Field */}
            <div className="brand-form-group">
              <label htmlFor="brand-name">Brand Name</label>
              <input
                id="brand-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shyam Agro Tools"
                required
                autoFocus
              />
            </div>

            {/* Brand Logo Upload Field */}
            <div className="brand-form-group">
              <label>Brand Logo</label>
              
              {logo ? (
                <div className="brand-image-preview">
                  <div className="brand-image-preview__box">
                    <img src={logo} alt="Preview" className="brand-image-preview__img" />
                  </div>
                  <div className="brand-image-preview__actions">
                    <button
                      type="button"
                      className="catalog-btn catalog-btn--danger"
                      onClick={handleRemoveLogo}
                    >
                      <Trash2 size={14} /> Remove Logo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="brand-image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <div className="brand-image-upload__content">
                    <div className="brand-image-upload__icon">
                      <Upload size={24} />
                    </div>
                    <div className="brand-image-upload__text">
                      <strong>Click to upload logo</strong>
                      <span>PNG, JPG, SVG up to 2MB</span>
                    </div>
                  </div>
                </label>
              )}
            </div>

            {/* Form Actions */}
            <div className="brand-form-actions">
              <button
                type="button"
                className="catalog-btn"
                onClick={() => navigate('/admin/brands/list')}
                disabled={isSaved}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="catalog-btn catalog-btn--primary"
                disabled={isSaved}
              >
                <Save size={16} /> Save Brand
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BrandForm;
