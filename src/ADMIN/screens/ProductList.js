import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Package } from 'lucide-react';
import '../catalog/adminModule.css';

const PRODUCTS_API_URL = 'https://excretory-powdering-mocker.ngrok-free.dev/api/Catalog/products';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [productCount, setProductCount] = useState(0);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    // Abort any previous request
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get(PRODUCTS_API_URL, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json'
        },
        timeout: 30000,
        signal: abortControllerRef.current.signal
      });
      console.log('Raw API response:', response.data);

      // Locate the product array from various possible response shapes
      let rawArray = [];
      if (Array.isArray(response.data)) {
        rawArray = response.data;
      } else if (Array.isArray(response.data?.products)) {
        rawArray = response.data.products;
      } else if (Array.isArray(response.data?.items)) {
        rawArray = response.data.items;
      } else if (Array.isArray(response.data?.data?.products)) {
        rawArray = response.data.data.products;
      } else if (Array.isArray(response.data?.data?.items)) {
        rawArray = response.data.data.items;
      } else if (Array.isArray(response.data?.data)) {
        rawArray = response.data.data;
      } else if (Array.isArray(response.data?.value)) {
        rawArray = response.data.value;
      }

      // Normalize each product to a flat shape our table expects
      const normalizedData = rawArray.map(p => {
        // Brand can be an object or a string
        let brandName = 'Generic';
        if (typeof p.brand === 'string') {
          brandName = p.brand;
        } else if (p.brand && typeof p.brand === 'object') {
          brandName = p.brand.name || p.brand.brandName || p.brand.brand_name || 'Generic';
        } else if (p.Brand) {
          brandName = typeof p.Brand === 'string' ? p.Brand : (p.Brand?.name || 'Generic');
        }

        // Category can be nested inside subcategory or be a direct string
        let categoryName = 'Uncategorized';
        if (typeof p.category === 'string') {
          categoryName = p.category;
        } else if (p.Category && typeof p.Category === 'string') {
          categoryName = p.Category;
        } else if (p.subcategory && typeof p.subcategory === 'object') {
          categoryName = p.subcategory.subcategoryName || p.subcategory.name || p.subcategory.subcategory_name || 'Uncategorized';
        }

        // Stock can be stockQuantity or stock
        const stock = p.stockQuantity ?? p.stock ?? p.Stock ?? 0;

        // Status: derive from isActive / stock if not provided
        let status = p.status || p.Status || p.stockStatus || p.StockStatus || '';
        if (!status) {
          if (p.isActive === false) {
            status = 'Inactive';
          } else if (stock > 0) {
            status = 'In Stock';
          } else {
            status = 'Out of Stock';
          }
        }

        return {
          id: p.id || p.productId || p.Id || p.ProductId,
          name: p.name || p.productName || p.product_name || p.Name || p.ProductName || 'Unnamed Product',
          brand: brandName,
          sku: p.sku || p.Sku || p.skuCode || p.SKUCode || 'N/A',
          category: categoryName,
          price: p.price || p.Price || p.sellingPrice || p.SellingPrice || 0,
          stock: stock,
          status: status
        };
      });

      setProducts(normalizedData);
      setProductCount(normalizedData.length);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.warn('Request cancelled');
      } else {
        setError(err.response?.status ? `Error ${err.response.status}: ${err.response?.data?.message || err.message}` : err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${PRODUCTS_API_URL}/${id}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
        timeout: 30000,
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error deleting product.');
    }
  };

  return (
    <div className="catalog-page">
      <section className="catalog-header">
        <div className="catalog-title-wrap">
          <h1>Product Lists</h1>
          <p>Inventory management and product updates.</p>
          <p>{productCount} products</p>
        </div>
        <div className="catalog-header__actions">
          <Link to="/admin/catalog/products-form" className="catalog-btn catalog-btn--primary">
            Add New Product
          </Link>
        </div>
      </section>

      <section className="catalog-card">
        {error && <div className="catalog-alert catalog-alert--warning">{error}</div>}

        <div className="catalog-table-wrap">
          <table className="catalog-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th className="catalog-number-cell">Price</th>
                <th className="catalog-center-cell">Stock</th>
                <th>Status</th>
                <th className="catalog-center-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="catalog-center-cell">Loading products from API...</td>
                </tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <span className="catalog-badge">
                        <Package size={14} /> {product.id}
                      </span>
                      <div className="catalog-table__title">{product.name}</div>
                      <div className="catalog-table__muted">{product.brand}</div>
                    </td>
                    <td className="catalog-path">{product.sku}</td>
                    <td>{product.category}</td>
                    <td className="catalog-number-cell">
                      INR {Number(product.price).toLocaleString('en-IN')}
                    </td>
                    <td className="catalog-center-cell">{product.stock}</td>
                    <td>
                      <span className={`catalog-badge ${product.status === 'In Stock' ? 'catalog-badge--stock' : 'catalog-badge--out'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="catalog-inline-actions">
                        <Link to={`/admin/catalog/products-form?id=${product.id}`} className="catalog-btn catalog-btn--icon" title="Edit product">
                          <Edit size={15} />
                        </Link>
                        <button
                          type="button"
                          className="catalog-btn catalog-btn--icon catalog-btn--danger"
                          onClick={() => deleteProduct(product.id)}
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="catalog-center-cell">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ProductList;
