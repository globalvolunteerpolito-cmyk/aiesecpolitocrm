import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Upload, 
  Download,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Building,
  User,
  Globe,
  Plane,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  LogOut,
  Bell,
  Home,
  CreditCard,
  Handshake,
  Save,
  X,
  Eye,
  EyeOff,
  Check,
  AlertTriangle
} from 'lucide-react';

// Mock Supabase client (replace with real supabase client)
const createClient = (url, key) => ({
  auth: {
    signInWithOAuth: async (provider) => {
      // Mock Google OAuth
      if (provider.provider === 'google') {
        // Simulate OAuth flow
        const mockUser = {
          id: 'user_123',
          email: 'maria.rossi@aiesec.it',
          user_metadata: {
            full_name: 'Maria Rossi',
            avatar_url: '/api/placeholder/32/32'
          }
        };
        return { data: { user: mockUser }, error: null };
      }
    },
    signOut: async () => ({ error: null }),
    getUser: async () => ({
      data: {
        user: {
          id: 'user_123',
          email: 'maria.rossi@aiesec.it',
          user_metadata: {
            full_name: 'Maria Rossi',
            avatar_url: '/api/placeholder/32/32'
          }
        }
      },
      error: null
    }),
    onAuthStateChange: (callback) => {
      // Mock auth state change
      setTimeout(() => {
        callback('SIGNED_IN', {
          id: 'user_123',
          email: 'maria.rossi@aiesec.it',
          user_metadata: {
            full_name: 'Maria Rossi',
            avatar_url: '/api/placeholder/32/32'
          }
        });
      }, 100);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: (table) => ({
    select: (columns = '*') => ({
      eq: (column, value) => ({
        data: mockData[table]?.filter(item => item[column] === value) || [],
        error: null
      }),
      order: (column) => ({
        data: mockData[table] || [],
        error: null
      }),
      data: mockData[table] || [],
      error: null
    }),
    insert: (data) => ({
      select: () => ({
        data: [{ ...data, id: Date.now() }],
        error: null
      })
    }),
    update: (data) => ({
      eq: (column, value) => ({
        select: () => ({
          data: [data],
          error: null
        })
      })
    }),
    delete: () => ({
      eq: (column, value) => ({
        data: [],
        error: null
      })
    })
  })
});

// Mock data storage
const mockData = {
  exchange_participants: [
    {
      id: 1,
      apl_id: 'APL001',
      ep_id: 'EP2024001',
      full_name: 'Alessandro Bianchi',
      opp_id: 'OPP001',
      home_lc: 'Torino',
      home_mc: 'Italy',
      assigned_to: 'Marco Verdi',
      assigned_by: 'Maria Rossi',
      status: 'In Progress',
      flight_booked: true,
      standards_completed: 3,
      total_standards: 6,
      notes: 'Exchange going well, needs flight confirmation',
      created_at: '2024-01-15'
    },
    {
      id: 2,
      apl_id: 'APL002',
      ep_id: 'EP2024002',
      full_name: 'Sofia Romano',
      opp_id: 'OPP002',
      home_lc: 'Milano',
      home_mc: 'Italy',
      assigned_to: 'Laura Conti',
      assigned_by: 'Maria Rossi',
      status: 'Completed',
      flight_booked: true,
      standards_completed: 6,
      total_standards: 6,
      notes: 'Successful completion of all requirements',
      created_at: '2024-01-10'
    }
  ],
  credits: [
    {
      id: 1,
      ep_name: 'Alessandro Bianchi',
      amount: 150.00,
      type: 'Registration Fee',
      status: 'Paid',
      due_date: '2024-02-01',
      paid_date: '2024-01-20'
    },
    {
      id: 2,
      ep_name: 'Sofia Romano',
      amount: 200.00,
      type: 'Program Fee',
      status: 'Pending',
      due_date: '2024-02-15',
      paid_date: null
    }
  ],
  partners: [
    {
      id: 1,
      name: 'Green Future NGO',
      contact: 'Paolo Verdi',
      email: 'paolo@greenfuture.org',
      phone: '+39 011 123456',
      address: 'Via Roma 123, Torino',
      contract_status: 'Active',
      projects: 3,
      last_contact: '2024-01-20'
    },
    {
      id: 2,
      name: 'Tech Solutions SRL',
      contact: 'Anna Belli',
      email: 'anna@techsolutions.it',
      phone: '+39 02 987654',
      address: 'Via Milano 45, Milano',
      contract_status: 'Pending',
      projects: 1,
      last_contact: '2024-01-18'
    }
  ]
};

// Initialize Supabase client
const supabase = createClient(
  'https://your-project.supabase.co', // Replace with your Supabase URL
  'your-anon-key' // Replace with your Supabase anon key
);

// Context for authentication
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          hd: 'aiesec.it' // Restrict to aiesec.it domain
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Notification Context
const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'New EP Added',
      message: 'Alessandro Bianchi has been added to the system',
      read: false,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      type: 'warning',
      title: 'Payment Overdue',
      message: 'Sofia Romano has an overdue payment',
      read: false,
      created_at: new Date().toISOString()
    }
  ]);

  const addNotification = (notification) => {
    setNotifications(prev => [{
      id: Date.now(),
      created_at: new Date().toISOString(),
      read: false,
      ...notification
    }, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Login Component
// Component is now exported so it can be used in other files if needed
export const LoginPage = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!formData.email.endsWith('@aiesec.it')) {
      setError('Only @aiesec.it email addresses are allowed');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (isSignUp) {
      if (!formData.fullName.trim()) {
        setError('Full name is required');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const { error } = await signUp(formData.email, formData.password, formData.fullName);
      if (error) {
        setError(error.message);
      }
    } else {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        setError(error.message);
      }
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AIESEC CRM</h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Create your account' : 'Sign in to manage your operations'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                required={isSignUp}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your.name@aiesec.it"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required={isSignUp}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setFormData({
                email: '',
                password: '',
                fullName: '',
                confirmPassword: ''
              });
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"
            }
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Only @aiesec.it email addresses are allowed
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs font-medium text-blue-800 mb-1">Demo Credentials:</p>
          <p className="text-xs text-blue-700">Email: demo@aiesec.it</p>
          <p className="text-xs text-blue-700">Password: demo123</p>
        </div>
      </div>
    </div>
  );
};

// Main CRM Component
// Component is now exported so it can be used in other files if needed
export const AiesecCRM = () => {
  const { user, signOut } = useAuth();
  const { notifications, addNotification, markAsRead, markAllAsRead } = useNotifications();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedEP, setSelectedEP] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [exchangeParticipants, setExchangeParticipants] = useState([]);
  const [credits, setCredits] = useState([]);
  const [partners, setPartners] = useState([]);
  
  const [newEP, setNewEP] = useState({
    apl_id: '',
    ep_id: '',
    full_name: '',
    opp_id: '',
    home_lc: '',
    home_mc: '',
    assigned_to: '',
    notes: ''
  });

  const [userProfile, setUserProfile] = useState({
    full_name: user?.user_metadata?.full_name || '',
    role: 'Vice President',
    email: user?.email || '',
    phone: '',
    notifications_enabled: true
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // For demo purposes, use sample data
      // In real implementation, these would be actual Supabase calls
      setExchangeParticipants(mockData.exchange_participants.map((ep, index) => ({
        ...ep,
        id: index + 1,
        created_at: new Date().toISOString()
      })));
      
      setCredits(mockData.credits.map((credit, index) => ({
        ...credit,
        id: index + 1
      })));
      
      setPartners(mockData.partners.map((partner, index) => ({
        ...partner,
        id: index + 1
      })));
      
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to empty arrays
      setExchangeParticipants([]);
      setCredits([]);
      setPartners([]);
    }
    setLoading(false);
  };

  const handleAddEP = async () => {
    setLoading(true);
    try {
      const epData = {
        ...newEP,
        assigned_by: user.user_metadata.full_name,
        status: 'New',
        flight_booked: false,
        standards_completed: 0,
        total_standards: 6,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('exchange_participants')
        .insert(epData)
        .select();

      if (error) throw error;

      setExchangeParticipants(prev => [data[0], ...prev]);
      addNotification({
        type: 'success',
        title: 'EP Added',
        message: `${newEP.full_name} has been added successfully`
      });
      
      setNewEP({
        apl_id: '',
        ep_id: '',
        full_name: '',
        opp_id: '',
        home_lc: '',
        home_mc: '',
        assigned_to: '',
        notes: ''
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding EP:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add EP. Please try again.'
      });
    }
    setLoading(false);
  };

  const handleUpdateEP = async (updatedEP) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exchange_participants')
        .update(updatedEP)
        .eq('id', updatedEP.id)
        .select();

      if (error) throw error;

      setExchangeParticipants(prev => 
        prev.map(ep => ep.id === updatedEP.id ? data[0] : ep)
      );
      
      addNotification({
        type: 'success',
        title: 'EP Updated',
        message: `${updatedEP.full_name} has been updated successfully`
      });
    } catch (error) {
      console.error('Error updating EP:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update EP. Please try again.'
      });
    }
    setLoading(false);
  };

  const handleDeleteEP = async (id) => {
    if (!window.confirm('Are you sure you want to delete this EP?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('exchange_participants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExchangeParticipants(prev => prev.filter(ep => ep.id !== id));
      addNotification({
        type: 'info',
        title: 'EP Deleted',
        message: 'Exchange participant has been removed'
      });
    } catch (error) {
      console.error('Error deleting EP:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete EP. Please try again.'
      });
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'New': return 'bg-gray-100 text-gray-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEPs = exchangeParticipants.filter(ep =>
    ep.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ep.ep_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ep.home_lc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalEPs: exchangeParticipants.length,
    activeEPs: exchangeParticipants.filter(ep => ep.status === 'In Progress').length,
    completedEPs: exchangeParticipants.filter(ep => ep.status === 'Completed').length,
    pendingPayments: credits.filter(c => c.status === 'Pending').length
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Components
  const Sidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AIESEC CRM</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'participants', label: 'Exchange Participants', icon: Users },
            { id: 'credits', label: 'Credit Management', icon: CreditCard },
            { id: 'partners', label: 'Partners', icon: Handshake }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userProfile.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{userProfile.role}</p>
          </div>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const Header = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'participants' && 'Exchange Participants'}
            {activeTab === 'credits' && 'Credit Management'}
            {activeTab === 'partners' && 'Partners'}
          </h2>
          <p className="text-gray-600 mt-1">
            {activeTab === 'dashboard' && 'Overview of your AIESEC operations'}
            {activeTab === 'participants' && 'Manage and track exchange participants'}
            {activeTab === 'credits' && 'Track payments and financial information'}
            {activeTab === 'partners' && 'Manage partner organizations and contacts'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(true)}
              className="p-2 text-gray-400 hover:text-gray-600 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
          </div>
          
          {activeTab === 'participants' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Participant
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const DashboardContent = () => (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total EPs', value: stats.totalEPs, icon: Users, color: 'blue' },
          { label: 'Active EPs', value: stats.activeEPs, icon: Clock, color: 'blue' },
          { label: 'Completed', value: stats.completedEPs, icon: CheckCircle, color: 'green' },
          { label: 'Pending Payments', value: stats.pendingPayments, icon: AlertCircle, color: 'red' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : 'text-red-500'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color === 'blue' ? 'bg-blue-100' : stat.color === 'green' ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Icon className={`w-6 h-6 ${stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : 'text-red-500'}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Participants</h3>
          <div className="space-y-4">
            {exchangeParticipants.slice(0, 3).map((ep) => (
              <div key={ep.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{ep.full_name}</p>
                    <p className="text-sm text-gray-500">{ep.home_lc} • {ep.ep_id}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ep.status)}`}>
                  {ep.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
          <div className="space-y-4">
            {credits.slice(0, 3).map((credit) => (
              <div key={credit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{credit.ep_name}</p>
                  <p className="text-sm text-gray-500">{credit.type} • €{credit.amount}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  credit.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {credit.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ParticipantsContent = () => (
    <div className="p-6 space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search participants..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IDs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEPs.map((ep) => (
                <tr key={ep.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{ep.full_name}</div>
                        <div className="text-sm text-gray-500">Added {ep.created_at?.split('T')[0]}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">EP: {ep.ep_id}</div>
                    <div className="text-sm text-gray-500">APL: {ep.apl_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ep.home_lc}</div>
                    <div className="text-sm text-gray-500">{ep.home_mc}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ep.assigned_to || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">{ep.standards_completed}/{ep.total_standards}</div>
                      <div className="ml-2 w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${(ep.standards_completed / ep.total_standards) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ep.status)}`}>
                      {ep.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedEP(ep)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEP(ep.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const CreditsContent = () => (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payment Tracking</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {credits.map((credit) => (
                <tr key={credit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {credit.ep_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {credit.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    €{credit.amount?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {credit.due_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      credit.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {credit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <DollarSign className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const PartnersContent = () => (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Partner Organizations</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Add Partner
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {partners.map((partner) => (
            <div key={partner.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{partner.name}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                    partner.contract_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {partner.contract_status}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  {partner.contact}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {partner.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {partner.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {partner.address}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">{partner.projects} projects</span>
                <span className="text-sm text-gray-500">Last contact: {partner.last_contact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Add EP Modal
  const AddEPModal = () => (
    showAddModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Add Exchange Participant</h3>
            <button 
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleAddEP(); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">APL ID</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newEP.apl_id}
                  onChange={(e) => setNewEP({...newEP, apl_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EP ID</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newEP.ep_id}
                  onChange={(e) => setNewEP({...newEP, ep_id: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newEP.full_name}
                onChange={(e) => setNewEP({...newEP, full_name: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OPP ID</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newEP.opp_id}
                  onChange={(e) => setNewEP({...newEP, opp_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home LC</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newEP.home_lc}
                  onChange={(e) => setNewEP({...newEP, home_lc: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home MC</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newEP.home_mc}
                  onChange={(e) => setNewEP({...newEP, home_mc: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newEP.assigned_to}
                onChange={(e) => setNewEP({...newEP, assigned_to: e.target.value})}
              >
                <option value="">Select team member...</option>
                <option value="Marco Verdi">Marco Verdi</option>
                <option value="Laura Conti">Laura Conti</option>
                <option value="Giuseppe Rossi">Giuseppe Rossi</option>
                <option value="Anna Ferrari">Anna Ferrari</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
                value={newEP.notes}
                onChange={(e) => setNewEP({...newEP, notes: e.target.value})}
                placeholder="Add any relevant notes..."
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Participant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  // EP Detail Modal
  const EPDetailModal = () => {
    const [editData, setEditData] = useState(selectedEP ? { ...selectedEP } : null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
      if (selectedEP) {
        setEditData({ ...selectedEP });
      }
    }, [selectedEP]);

    const handleSave = async () => {
      if (editData) {
        await handleUpdateEP(editData);
        setSelectedEP(null);
        setIsEditing(false);
      }
    };

    if (!selectedEP || !editData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{editData.full_name}</h3>
              <p className="text-gray-500">EP ID: {editData.ep_id}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1 rounded-lg text-sm ${isEditing ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}
              >
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </button>
              <button 
                onClick={() => setSelectedEP(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'APL ID', field: 'apl_id' },
                        { label: 'EP ID', field: 'ep_id' },
                        { label: 'Full Name', field: 'full_name' },
                        { label: 'OPP ID', field: 'opp_id' },
                        { label: 'Home LC', field: 'home_lc' },
                        { label: 'Home MC', field: 'home_mc' }
                      ].map((item) => (
                        <div key={item.field}>
                          <label className="block text-sm font-medium text-gray-600 mb-1">{item.label}</label>
                          {isEditing ? (
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              value={editData[item.field] || ''}
                              onChange={(e) => setEditData({...editData, [item.field]: e.target.value})}
                            />
                          ) : (
                            <p className="text-sm text-gray-900">{editData[item.field]}</p>
                          )}
                        </div>
                      ))}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Assigned To</label>
                        {isEditing ? (
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={editData.assigned_to || ''}
                            onChange={(e) => setEditData({...editData, assigned_to: e.target.value})}
                          >
                            <option value="">Select team member...</option>
                            <option value="Marco Verdi">Marco Verdi</option>
                            <option value="Laura Conti">Laura Conti</option>
                            <option value="Giuseppe Rossi">Giuseppe Rossi</option>
                            <option value="Anna Ferrari">Anna Ferrari</option>
                          </select>
                        ) : (
                          <p className="text-sm text-gray-900">{editData.assigned_to || 'Unassigned'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                        {isEditing ? (
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={editData.status || ''}
                            onChange={(e) => setEditData({...editData, status: e.target.value})}
                          >
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(editData.status)}`}>
                            {editData.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Progress Status</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>AIESEC Standards</span>
                          <span>{editData.standards_completed}/{editData.total_standards}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${(editData.standards_completed / editData.total_standards) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Plane className={`w-4 h-4 ${editData.flight_booked ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="text-sm">
                          Flight {editData.flight_booked ? 'Booked' : 'Not Booked'}
                        </span>
                        {isEditing && (
                          <input
                            type="checkbox"
                            checked={editData.flight_booked || false}
                            onChange={(e) => setEditData({...editData, flight_booked: e.target.checked})}
                            className="ml-2"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Standards Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">AIESEC Exchange Standards</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Pre-departure Training',
                    'Arrival Confirmation',
                    'Mid-term Evaluation',
                    'Final Evaluation',
                    'Certificate Upload',
                    'Experience Sharing'
                  ].map((standard, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm">{standard}</span>
                      <div className="flex items-center gap-2">
                        {index < editData.standards_completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                        )}
                        <button className="text-blue-600 text-sm hover:underline">
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes & Comments</h4>
                {isEditing ? (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500"
                    value={editData.notes || ''}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    placeholder="Add notes and comments..."
                  />
                ) : (
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{editData.notes || 'No notes available'}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={() => setSelectedEP(null)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            {isEditing && (
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Settings Modal
  const SettingsModal = () => (
    showSettingsModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Account Settings</h3>
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Profile Section */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Profile Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={userProfile.full_name}
                    onChange={(e) => setUserProfile({...userProfile, full_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    value={userProfile.email}
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={userProfile.role}
                    onChange={(e) => setUserProfile({...userProfile, role: e.target.value})}
                  >
                    <option value="Vice President">Vice President</option>
                    <option value="Team Leader">Team Leader</option>
                    <option value="Member">Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                    placeholder="+39 123 456 7890"
                  />
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Notification Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive notifications via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userProfile.notifications_enabled}
                    onChange={(e) => setUserProfile({...userProfile, notifications_enabled: e.target.checked})}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">EP Updates</p>
                    <p className="text-xs text-gray-500">Get notified about participant updates</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Reminders</p>
                    <p className="text-xs text-gray-500">Receive overdue payment alerts</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-medium text-red-600 mb-3">Danger Zone</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-red-800">Sign Out</p>
                    <p className="text-xs text-red-600">Sign out of your account</p>
                  </div>
                  <button
                    onClick={signOut}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Notifications Panel
  const NotificationsPanel = () => (
    showNotifications && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadNotifications > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </button>
              )}
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' :
                        notification.type === 'error' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );

  if (loading && exchangeParticipants.length === 0) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading AIESEC CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'participants' && <ParticipantsContent />}
          {activeTab === 'credits' && <CreditsContent />}
          {activeTab === 'partners' && <PartnersContent />}
        </main>
      </div>
      
      <AddEPModal />
      <EPDetailModal />
      <SettingsModal />
      <NotificationsPanel />
    </div>
  );
};

// Main App Component
const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <NotificationProvider>
      <AiesecCRM />
    </NotificationProvider>
  );
};

// Export wrapped with AuthProvider
export default () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);