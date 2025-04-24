import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/components/AuthContext';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const { sessionId } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8000/wanted-products', {
        headers: { 'x-session-id': sessionId },
      });
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/wanted-products', product, {
        headers: { 'x-session-id': sessionId },
      });
      setProducts((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Error adding product');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    setLoading(true);
    setError('');
    try {
      await axios.delete(`http://localhost:8000/wanted-products/${productId}`, {
        headers: { 'x-session-id': sessionId },
      });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Error deleting product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchProducts();
    }
  }, [sessionId]);

  return (
    <ProductContext.Provider value={{ products, loading, error, addProduct, deleteProduct, fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);