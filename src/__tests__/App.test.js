import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from '../App';

jest.mock('axios');

describe('App', () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    // Default: no runtime env override
    delete window.__ENV__;
    // prevent alert popups in tests
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    window.alert.mockRestore();
  });

  test('fetches products on mount and renders them', async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id: 1, name: 'Laptop', price: 999.99 }],
    });

    render(<App />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/products');
    });

    expect(await screen.findByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText(/Price:/)).toBeInTheDocument();
  });

  test('uses window.__ENV__ to override API base URLs', async () => {
    window.__ENV__ = {
      PRODUCT_API_URL: 'http://product.example',
      ORDER_API_URL: 'http://order.example',
    };

    axios.get.mockResolvedValueOnce({ data: [] });

    render(<App />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://product.example/products');
    });
  });

  test('clicking Buy Now posts an order', async () => {
    window.__ENV__ = {
      PRODUCT_API_URL: 'http://product.example',
      ORDER_API_URL: 'http://order.example',
    };

    axios.get.mockResolvedValueOnce({
      data: [{ id: 7, name: 'Mouse', price: 29.99 }],
    });

    axios.post.mockResolvedValueOnce({
      data: { id: 123, productId: 7, quantity: 1 },
    });

    render(<App />);

    // Wait for product to render
    expect(await screen.findByText('Mouse')).toBeInTheDocument();

    // Click Buy Now
    await userEvent.click(screen.getByRole('button', { name: /buy now/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://order.example/orders', {
        productId: 7,
        quantity: 1,
      });
    });

    expect(window.alert).toHaveBeenCalledWith('Order created!');
  });

  test('if product fetch fails, page still renders', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('boom'));

    render(<App />);

    expect(screen.getByText('E-Commerce Store')).toBeInTheDocument();

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    console.error.mockRestore();
  });
});
