import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProducts } from '@/components/ProductContext';
import Logo from '@/components/ui/logo';
import Card from '@/components/ui/card1';
import Button from '@/components/ui/button1';

function ProductDetailPage() {
  const { id } = useParams();
  const { products } = useProducts();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <Card className="text-center p-8 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Product Not Found</h2>
          <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Logo />
          <Link to="/dashboard">
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
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{product.product_name}</h2>
            <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">{product.category}</span>
          </div>
          <div className="text-sm text-gray-600 mb-1">Product ID: {product.id}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-gray-500 text-sm">Quantity</h3>
              <p className="font-medium text-gray-800">{product.quantity} {product.unit}</p>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Category</h3>
              <p className="font-medium text-gray-800">{product.category}</p>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Created At</h3>
              <p className="font-medium text-gray-800">{new Date(product.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Updated At</h3>
              <p className="font-medium text-gray-800">{new Date(product.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-gray-500 text-sm mb-1">Additional Notes</h3>
            <p className="text-gray-800">{product.notes || 'No additional notes provided.'}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ProductDetailPage;