import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [restaurants, setRestaurants] = useState(JSON.parse(localStorage.getItem('evalData')) || []);

  useEffect(() => {
    localStorage.setItem('evalData', JSON.stringify(restaurants));
  }, [restaurants]);

  const login = (email, password) => {
    let role = null;
    if (email === 'admin@gmail.com' && password === 'admin1234') role = 'admin';
    else if (email === 'customer@gmail.com' && password === 'customer1234') role = 'customer';

    if (role) {
      const userData = { email, role };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return role;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AppContext.Provider value={{ user, login, logout, restaurants, setRestaurants }}>
      {children}
    </AppContext.Provider>
  );
};

// --- 2. PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AppContext);
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const RestaurantList = ({ isAdmin }) => {
  const { restaurants, setRestaurants, logout } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [parkingFilter, setParkingFilter] = useState('');
  const searchRef = useRef();
  const navigate = useNavigate();

  useEffect(() => { if (searchRef.current) searchRef.current.focus(); }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      setRestaurants(restaurants.filter(r => r.restaurantID !== id));
      alert("Successful deletion");
    }
  };

  const filteredData = restaurants.filter(r => {
    const matchesSearch = r.restaurantName.toLowerCase().includes(search.toLowerCase()) || 
                          r.address.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === '' || r.type === typeFilter;
    const matchesParking = parkingFilter === '' || r.parkingLot.toString() === parkingFilter;
    return matchesSearch && matchesType && matchesParking;
  });

  return (
    <div>
      <nav style={{ padding: '10px', background: '#151a68ff', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input ref={searchRef} placeholder="Search name or address..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {["Rajasthani", "Gujarati", "Mughlai", "Jain", "Thai", "North Indian", "South Indian"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select onChange={(e) => setParkingFilter(e.target.value)}>
          <option value="">All Parking</option>
          <option value="true">Parking Available</option>
          <option value="false">No Parking</option>
        </select>
        <button onClick={() => { logout(); navigate('/'); }}>Logout</button>
      </nav>

      <div style={{ display: 'flex',flexWrap:'wrap', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', padding: '15px' }}>
        {filteredData.map(res => (
          <div key={res.restaurantID} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
            <img src={"https://coding-platform.s3.amazonaws.com/dev/lms/tickets/7524df6e-46fa-4506-8766-eca8da47c2f1/2izhqnTaNLdenHYF.jpeg"} alt={res.restaurantName} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            <h3>{res.restaurantName}</h3>
            <p><b>Address:</b> {res.address}</p>
            <p><b>Type:</b> {res.type}</p>
            <p><b>Parking:</b> {res.parkingLot ? "Available" : "Not Available"}</p>
            {isAdmin && (
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => navigate('/admin/restaurants/update', { state: res })}>Update</button>
                <button onClick={() => handleDelete(res.restaurantID)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const role = login(email, password);
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'customer') navigate('/customers/dashboard');
    else alert('Invalid email or password');
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left' }}>
        <input type="email" placeholder="Email" required onChange={e => setEmail(e.target.value)} /><br /><br />
        <input type="password" placeholder="Password" required onChange={e => setPassword(e.target.value)} /><br /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

const AdminDashboard = () => {
  const { setRestaurants } = useContext(AppContext);
  const [form, setForm] = useState({
    restaurantName: '', address: '', type: 'Rajasthani', parkingLot: true,
    image: "coding-platform.s3.amazonaws.com"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRes = { ...form, restaurantID: Date.now() };
    setRestaurants(prev => [...prev, newRes]);
    alert("Successful addition");
    setForm({ ...form, restaurantName: '', address: '' }); 
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '300px', padding: '20px', borderRight: '2px solid #c4b3b3ff', height: '100vh' }}>
        <h3>Add Restaurant</h3>
        <form onSubmit={handleSubmit}>
          <input placeholder="Name" value={form.restaurantName} required onChange={e => setForm({...form, restaurantName: e.target.value})} style={{width:'90%'}}/><br/><br/>
          <input placeholder="Address" value={form.address} required onChange={e => setForm({...form, address: e.target.value})} style={{width:'90%'}}/><br/><br/>
          <label>Type:</label><br/>
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{width:'95%'}}>
            {["Rajasthani", "Gujarati", "Mughlai", "Jain", "Thai", "North Indian", "South Indian"].map(t => <option key={t} value={t}>{t}</option>)}
          </select><br/><br/>
          <label>Parking:</label><br/>
          <select value={form.parkingLot} onChange={e => setForm({...form, parkingLot: e.target.value === 'true'})} style={{width:'95%'}}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select><br/><br/>
          <button type="submit">Add Restaurant</button>
        </form>
      </div>
      <div style={{ flex: 1 }}>
        <RestaurantList isAdmin={true} />
      </div>
    </div>
  );
};

const UpdatePage = () => {
  const { state } = useLocation();
  const { restaurants, setRestaurants } = useContext(AppContext);
  const [form, setForm] = useState(state);
  const navigate = useNavigate();

  if (!state) return <Navigate to="/admin/dashboard" />;

  const handleUpdate = (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to update?")) {
      setRestaurants(restaurants.map(r => r.restaurantID === form.restaurantID ? form : r));
      alert("Successful update");
      navigate('/admin/dashboard');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Update Restaurant</h2>
      <form onSubmit={handleUpdate} style={{ maxWidth: '400px' }}>
        <input value={form.restaurantName} required onChange={e => setForm({...form, restaurantName: e.target.value})} style={{width:'100%'}} /><br/><br/>
        <input value={form.address} required onChange={e => setForm({...form, address: e.target.value})} style={{width:'100%'}} /><br/><br/>
        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{width:'100%'}}>
          {["Rajasthani", "Gujarati", "Mughlai", "Jain", "Thai", "North Indian", "South Indian"].map(t => <option key={t} value={t}>{t}</option>)}
        </select><br/><br/>
        <select value={form.parkingLot} onChange={e => setForm({...form, parkingLot: e.target.value === 'true'})} style={{width:'100%'}}>
          <option value="true">Parking Available</option>
          <option value="false">No Parking</option>
        </select><br/><br/>
        <button type="submit">Update</button>
        <button type="button" onClick={() => navigate('/admin/dashboard')}>Cancel</button>
      </form>
    </div>
  );
};
export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/restaurants/update" element={<ProtectedRoute role="admin"><UpdatePage /></ProtectedRoute>} />
          <Route path="/customers/dashboard" element={<ProtectedRoute role="customer"><RestaurantList isAdmin={false} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
