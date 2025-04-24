import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '@/components/ProductContext';
import Logo from '@/components/ui/logo';
import Card from '@/components/ui/card1';
import Input from '@/components/ui/input1';
import Button from '@/components/ui/button1';
import TextArea from '@/components/ui/textarea1';

function AddProductPage() {
  const { addProduct, error, loading } = useProducts();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    quantity: '',
    unit: '',
    notes: '',
    deliveryLocation: '', // Added delivery location
    requiredDateTime: '', // Added required date and time
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting form data:', formData); // Debug log
      await addProduct({
        product_name: formData.product_name,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        notes: formData.notes || null,
        deliveryLocation: formData.deliveryLocation, // Include delivery location
        requiredDateTime: formData.requiredDateTime || null, // Include required date and time
      });
      navigate('/buyer/dashboard');
    } catch (err) {
      console.error('Error adding product:', err); // Debug log
      // Error handled by ProductContext
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Logo />
          <Link to="/buyer/dashboard">
            <Button
              variant="outline"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
              }
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <Card className="shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Add New Product</h2>
          <p className="text-gray-600 mb-6">Fill in the details below to add a wanted product</p>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Product Name"
              name="product_name"
              placeholder="Enter product name"
              value={formData.product_name}
              onChange={handleChange}
              required
            />
            <div>
              <label className="block text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select category</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Paddy">Paddy</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Quantity</label>
              <div className="relative">
                <input
                  type="number"
                  name="quantity"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0.01"
                  className="w-full border border-gray-300 rounded-md py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">{formData.unit || 'unit'}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select unit</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="pcs">pcs</option>
              </select>
            </div>
            <Input
              label="Delivery Location"
              name="deliveryLocation"
              placeholder="Enter delivery location (e.g., Coimbatore)"
              value={formData.deliveryLocation}
              onChange={handleChange}
              required
            />
            <Input
              label="Required Date and Time"
              name="requiredDateTime"
              type="datetime-local"
              value={formData.requiredDateTime}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)} // Prevent past dates
            />
            <TextArea
              label="Additional Notes (Optional)"
              name="notes"
              placeholder="Add any specific requirements or notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />
            <Button variant="primary" fullWidth type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default AddProductPage;