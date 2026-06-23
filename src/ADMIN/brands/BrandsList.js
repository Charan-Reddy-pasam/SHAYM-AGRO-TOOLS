import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Edit, Trash2, Plus, Image as ImageIcon, Tag } from 'lucide-react';

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

export const deleteBrand = async (id) => {
  const url = `${API_BASE}/${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Delete brand failed: ${res.status} ${err}`);
  }
  return true;
};
const BrandsList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [brands, setBrands] = useState([]);
const [searchTerm, setSearchTerm] = useState('');

useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchBrands();
        setBrands(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the brand "${name}"?`)) {
      try {
        await deleteBrand(id);
        setBrands(prev => prev.filter(b => b.id !== id));
      } catch (e) {
        setError(e.message);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/brands/form?id=${id}`);
  };

  const filteredBrands = brands.filter(brand => {
    const query = searchTerm.toLowerCase();
    return (
      (brand.name || '').toLowerCase().includes(query) ||
      (brand.id || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="brands-page">
      {/* Page Header */}
      <div className="brands-header">
        <div className="brands-title-wrap">
          <p className="catalog-kicker" style={{ color: '#2f855a', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', marginBottom: '7px' }}>Catalog settings</p>
          <h1>Brands</h1>
          <p>Create and manage manufacturers and brands assigned to storefront products.</p>
        </div>
        <div>
          <Link to="/admin/brands/form" className="catalog-btn catalog-btn--primary">
            <Plus size={16} /> Add Brand
          </Link>
        </div>
      </div>

      {/* Toolbar / Search Filter */}
      <div className="brands-toolbar">
        <div className="brands-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search brands by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="brands-count">
          {filteredBrands.length} {filteredBrands.length === 1 ? 'brand' : 'brands'}
        </span>
      </div>

      {/* Cards Grid */}
      {loading && <div className="catalog-alert">Loading brands...</div>}
      {error && <div className="catalog-alert catalog-alert--warning">{error}</div>}
      {(!loading && !error && filteredBrands.length === 0) && (
        <div className="brands-empty-state">
          <Tag size={40} style={{ color: '#94a3b8' }} />
          <h3>No brands found</h3>
          <p>{searchTerm ? "We couldn't find any brands matching your search term." : "There are no brands registered in the catalog yet."}</p>
          {!searchTerm && (
            <Link to="/admin/brands/form" className="catalog-btn catalog-btn--primary">
              <Plus size={16} /> Add Your First Brand
            </Link>
          )}
        </div>
      )}
      {(!loading && !error && filteredBrands.length > 0) && (
        <div className="brands-grid">
          {filteredBrands.map((brand) => (
            <div className="brand-card" key={brand.id}>
              <div className="brand-card__content">
                <div className="brand-card__logo-frame">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="brand-card__logo" onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }} />
                  ) : null}
                  <div className="brand-card__logo-placeholder" style={{ display: brand.logo ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <ImageIcon size={36} />
                  </div>
                </div>
                <span className="brand-card__id">{brand.id}</span>
                <h3 className="brand-card__name">{brand.name}</h3>
              </div>
              <div className="brand-card__actions">
                <button type="button" className="brand-card__action-btn brand-card__action-btn--edit" onClick={() => handleEdit(brand.id)} title="Edit brand"><Edit size={14} /> Edit</button>
                <button type="button" className="brand-card__action-btn brand-card__action-btn--delete" onClick={() => handleDelete(brand.id, brand.name)} title="Delete brand"><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandsList;
