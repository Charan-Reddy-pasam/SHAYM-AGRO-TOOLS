import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, CheckCircle, RefreshCw, AlertCircle, X } from 'lucide-react';
import '../catalog/adminModule.css';

const API_BASE   = 'https://wildlife-unwieldy-devotee.ngrok-free.dev/api/Blog';
const IMG_BASE   = 'https://wildlife-unwieldy-devotee.ngrok-free.dev';
const GET_HEADERS = {
  'ngrok-skip-browser-warning': 'true',
  'Accept': 'application/json',
};

const emptyForm = {
  title:       '',
  category:    'Agriculture',
  authorName:  'Admin',
  publishDate: '',
  summary:     '',
  description: '',
};

const CATEGORIES = ['Agriculture', 'Equipment', 'Irrigation', 'Tips & Tricks', 'Agro News', 'General'];

const BlogForm = () => {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const blogId          = searchParams.get('id');
  const isEditing       = Boolean(blogId);

  const [formData, setFormData]     = useState(emptyForm);
  const [imageFile, setImageFile]   = useState(null);           // new file chosen
  const [imagePreview, setImagePreview] = useState('');         // preview URL
  const [existingImg, setExistingImg]   = useState('');         // current server image path

  const [loading, setLoading]   = useState(isEditing);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');

  /* ── Set today as default date for new blogs ── */
  useEffect(() => {
    if (!isEditing) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, publishDate: today }));
    }
  }, [isEditing]);

  /* ── Load existing blog for edit ── */
  useEffect(() => {
    if (!blogId) return;
    setLoading(true);
    setError('');

    fetch(`${API_BASE}/${blogId}`, { headers: GET_HEADERS })
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setFormData({
          title:       data.title       || '',
          category:    data.category    || 'Agriculture',
          authorName:  data.authorName  || 'Admin',
          publishDate: data.publishDate ? data.publishDate.split('T')[0] : '',
          summary:     data.summary     || '',
          description: data.description || '',
        });
        if (data.coverImage) {
          const src = data.coverImage.startsWith('http')
            ? data.coverImage
            : `${IMG_BASE}${data.coverImage}`;
          setExistingImg(src);
          setImagePreview(src);
        }
      })
      .catch(err => setError(err.message || 'Failed to load article.'))
      .finally(() => setLoading(false));
  }, [blogId]);

  /* ── Field change ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ── Image file select ── */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(existingImg);
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError('Article title is required.'); return; }
    if (!formData.description.trim()) { setError('Full content description is required.'); return; }

    setSaving(true);
    setError('');

    try {
      const body = new FormData();
      body.append('title',       formData.title.trim());
      body.append('category',    formData.category);
      body.append('authorName',  formData.authorName.trim() || 'Admin');
      body.append('publishDate', formData.publishDate || new Date().toISOString().split('T')[0]);
      body.append('summary',     formData.summary.trim() || formData.description.slice(0, 150));
      body.append('description', formData.description.trim());

      if (imageFile) {
        body.append('coverImage', imageFile, imageFile.name);
      }

      const url    = isEditing ? `${API_BASE}/${blogId}` : API_BASE;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Request failed with status ${res.status}`);
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate('/admin/blogs/list');
      }, 1000);

    } catch (err) {
      setError(err.message || 'Failed to save the article. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="catalog-page">
      {/* ── Page Header ── */}
      <section className="catalog-header">
        <div className="catalog-title-wrap">
          <h1>{isEditing ? 'Edit Blog Article' : 'Write Blog Article'}</h1>
          <p>Compose and style informative agricultural content for farmers and retailers.</p>
        </div>
        <div className="catalog-header__actions">
          <Link to="/admin/blogs/list" className="catalog-btn">
            <ArrowLeft size={16} /> Back to Blogs
          </Link>
        </div>
      </section>

      {/* ── Form Card ── */}
      <section className="catalog-card">
        <div className="catalog-card__header">
          <div>
            <h2>Article Details</h2>
            <p className="catalog-card__subtitle">
              {isEditing ? 'Update the article content and republish.' : 'Include a rich description and high-quality cover photo to improve readership.'}
            </p>
          </div>
          {saved && (
            <span className="catalog-alert" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '6px 12px', fontSize: 13 }}>
              <CheckCircle size={16} /> Article {isEditing ? 'updated' : 'published'} successfully!
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="catalog-alert catalog-alert--danger" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="catalog-center-cell" style={{ padding: '64px 0', color: '#94a3b8' }}>
            <RefreshCw size={22} className="spin" style={{ display: 'block', margin: '0 auto 10px' }} />
            Loading article data...
          </div>
        ) : (
          <form className="catalog-form" onSubmit={handleSubmit}>

            {/* Row 1: Title + Category */}
            <div className="catalog-form-grid">
              <div className="catalog-field">
                <label htmlFor="blog-title">Article Title <span style={{ color: '#e30613' }}>*</span></label>
                <input
                  id="blog-title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Modern Drip Irrigation Practices"
                  required
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="blog-category">Category</label>
                <select id="blog-category" name="category" value={formData.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2: Author + Date + Image Upload */}
            <div className="catalog-form-grid catalog-form-grid--three">
              <div className="catalog-field">
                <label htmlFor="blog-author">Author Name</label>
                <input
                  id="blog-author"
                  name="authorName"
                  type="text"
                  value={formData.authorName}
                  onChange={handleChange}
                  placeholder="e.g. Admin, Agri Expert"
                />
              </div>

              <div className="catalog-field">
                <label htmlFor="blog-date">Publish Date <span style={{ color: '#e30613' }}>*</span></label>
                <input
                  id="blog-date"
                  name="publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="catalog-field">
                <label>Featured Cover Image</label>
                <label className="catalog-upload" htmlFor="blog-image" style={{ cursor: 'pointer' }}>
                  <span className="catalog-upload__box" style={{ position: 'relative' }}>
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Cover preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        {imageFile && (
                          <button
                            type="button"
                            onClick={(ev) => { ev.preventDefault(); clearImage(); }}
                            style={{ position: 'absolute', top: 4, right: 4, background: '#e30613', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </>
                    ) : (
                      <Upload size={24} />
                    )}
                  </span>
                  <span>
                    <strong>{imagePreview ? (imageFile ? 'Change Photo' : 'Current Photo (click to change)') : 'Upload Cover Photo'}</strong>
                    <span>Horizontal aspect ratio works best.</span>
                  </span>
                  <input id="blog-image" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="catalog-field">
              <label htmlFor="blog-summary">Short Summary (auto-derived if empty)</label>
              <input
                id="blog-summary"
                name="summary"
                type="text"
                value={formData.summary}
                onChange={handleChange}
                placeholder="A brief 1–2 sentence hook summarising the article..."
              />
            </div>

            {/* Full Description */}
            <div className="catalog-field">
              <label htmlFor="blog-description">Full Content Description <span style={{ color: '#e30613' }}>*</span></label>
              <textarea
                id="blog-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write the full content of the blog post here. Share detailed agrarian tips, crop analysis, or guide instructions."
                rows="12"
                required
              />
            </div>

            {/* Actions */}
            <div className="catalog-actions">
              <button
                type="submit"
                className="catalog-btn catalog-btn--primary"
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {saving
                  ? <><RefreshCw size={15} className="spin" /> Saving...</>
                  : <><Save size={16} /> {isEditing ? 'Update Article' : 'Publish Article'}</>
                }
              </button>
              <button
                type="button"
                className="catalog-btn"
                onClick={() => navigate('/admin/blogs/list')}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default BlogForm;
