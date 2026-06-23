import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, Trash2, Plus, FileText, Calendar, User, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import '../catalog/adminModule.css';

const API_BASE = 'https://wildlife-unwieldy-devotee.ngrok-free.dev/api/Blog';
const IMG_BASE = 'https://wildlife-unwieldy-devotee.ngrok-free.dev';

const HEADERS = {
  'ngrok-skip-browser-warning': 'true',
  'Accept': 'application/json',
};

const formatDate = (isoStr) => {
  if (!isoStr) return '—';
  try {
    return new Date(isoStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch {
    return isoStr;
  }
};

const BlogsList = () => {
  const [blogs, setBlogs]           = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [deletingId, setDeletingId] = useState(null);

  /* ── Fetch all blogs ── */
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_BASE, { headers: HEADERS });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load blog articles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  /* ── Delete a blog ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog article permanently?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: HEADERS,
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setBlogs(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete the article. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Filter ── */
  const filteredBlogs = blogs.filter((blog) => {
    const q = searchTerm.toLowerCase();
    return (
      (blog.title      || '').toLowerCase().includes(q) ||
      (blog.category   || '').toLowerCase().includes(q) ||
      (blog.authorName || '').toLowerCase().includes(q) ||
      (blog.summary    || '').toLowerCase().includes(q) ||
      (blog.description|| '').toLowerCase().includes(q)
    );
  });

  const resolveImage = (src) => {
    if (!src) return null;
    if (src.startsWith('http')) return src;
    return `${IMG_BASE}${src}`;
  };

  return (
    <div className="catalog-page">
      {/* ── Header ── */}
      <section className="catalog-header">
        <div className="catalog-title-wrap">
          <h1>Blog Articles</h1>
          <p>Create and manage educational articles, crop tips, and agro news displayed to users.</p>
        </div>

        <div className="catalog-header__actions">
          <Link to="/" className="catalog-btn" target="_blank" rel="noopener noreferrer">
            <Eye size={16} /> View Shop Phase
          </Link>
          <button className="catalog-btn" onClick={fetchBlogs} disabled={loading} title="Refresh">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <Link to="/admin/blogs/form" className="catalog-btn catalog-btn--primary">
            <Plus size={16} /> Write New Blog
          </Link>
        </div>
      </section>

      {/* ── Error Banner ── */}
      {error && (
        <div className="catalog-alert catalog-alert--danger" style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} /> {error}
          <button
            onClick={fetchBlogs}
            style={{ marginLeft: 'auto', background: 'none', border: '1px solid currentColor', borderRadius: 4, padding: '2px 10px', cursor: 'pointer', fontSize: 12 }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Table Card ── */}
      <section className="catalog-card">
        <div className="catalog-filterbar">
          <div className="catalog-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by title, author, category or summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="catalog-count">
            {loading ? 'Loading…' : `${filteredBlogs.length} article${filteredBlogs.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="catalog-table-wrap">
          <table className="catalog-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Author</th>
                <th>Category</th>
                <th>Publish Date</th>
                <th className="catalog-center-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="catalog-center-cell" style={{ padding: '48px 0', color: '#94a3b8' }}>
                    <RefreshCw size={20} className="spin" style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                    Loading articles from server...
                  </td>
                </tr>
              ) : filteredBlogs.length > 0 ? (
                filteredBlogs.map((blog) => {
                  const imgSrc = resolveImage(blog.coverImage);
                  return (
                    <tr key={blog.id}>
                      {/* Article column */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={blog.title}
                              style={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 5, border: '1px solid #e2e8f0', flexShrink: 0 }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div style={{ width: 64, height: 40, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, border: '1px solid #e2e8f0', flexShrink: 0 }}>
                              <FileText size={16} color="#94a3b8" />
                            </div>
                          )}
                          <div>
                            <div className="catalog-table__title" style={{ fontWeight: 600, color: '#1e293b', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {blog.title || 'Untitled'}
                            </div>
                            <div className="catalog-table__muted" style={{ fontSize: 11, color: '#94a3b8', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                              {blog.summary || (blog.description ? blog.description.slice(0, 80) + '…' : '—')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#475569', fontSize: 13 }}>
                          <User size={13} color="#94a3b8" />
                          {blog.authorName || 'Admin'}
                        </span>
                      </td>

                      {/* Category */}
                      <td>
                        <span style={{ fontSize: 11, background: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: 4, fontWeight: 700, border: '1px solid #bbf7d0' }}>
                          {blog.category || 'General'}
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b', fontSize: 13 }}>
                          <Calendar size={13} color="#94a3b8" />
                          {formatDate(blog.publishDate)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="catalog-inline-actions" style={{ justifyContent: 'center' }}>
                          <Link
                            to={`/admin/blogs/form?id=${blog.id}`}
                            className="catalog-btn catalog-btn--icon"
                            title="Edit article"
                          >
                            <Edit size={15} />
                          </Link>
                          <button
                            type="button"
                            className="catalog-btn catalog-btn--icon catalog-btn--danger"
                            onClick={() => handleDelete(blog.id)}
                            disabled={deletingId === blog.id}
                            title="Delete article"
                          >
                            {deletingId === blog.id
                              ? <RefreshCw size={14} className="spin" />
                              : <Trash2 size={15} />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="catalog-center-cell" style={{ padding: '48px 0', color: '#94a3b8' }}>
                    {searchTerm ? 'No articles match your search.' : 'No blog articles found. Write your first article!'}
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

export default BlogsList;
