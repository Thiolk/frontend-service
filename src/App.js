import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Runtime-configured API base URLs (Option B)
  const PRODUCT_API_BASE =
    window.__ENV__?.PRODUCT_API_URL || 'http://localhost:5000';
  const ORDER_API_BASE =
    window.__ENV__?.ORDER_API_URL || 'http://localhost:5001';

  useEffect(() => {
    // Fetch products
    axios
      .get(`${PRODUCT_API_BASE}/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, [PRODUCT_API_BASE]);

  const createOrder = (productId) => {
    axios
      .post(`${ORDER_API_BASE}/orders`, {
        productId: productId,
        quantity: 1,
      })
      .then((res) => {
        alert('Order created!');
        setOrders([...orders, res.data]);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h1>E-Commerce Store</h1>
      <h2>Products</h2>
      <div>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              margin: '10px',
            }}
          >
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            <button onClick={() => createOrder(product.id)}>Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
