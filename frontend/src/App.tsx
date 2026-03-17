import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import NewProduct from './pages/NewProduct';
import './App.css';

export default function App() {
  const location = useLocation();

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">⚖️</span>
          <span className="brand-text">Product Compliance Engine</span>
        </div>
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive || location.pathname.startsWith('/products') ? 'nav-link active' : 'nav-link'}>
            Products
          </NavLink>
          <NavLink to="/new" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            + New Product
          </NavLink>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/new" element={<NewProduct />} />
        </Routes>
      </main>
    </div>
  );
}
