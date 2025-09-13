import React, { useState, useEffect, createContext, useContext, useReducer } from 'react';
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
    Mail as MailIcon,
    FileText,
    DollarSign,
    Building,
    User as UserIcon,
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
    AlertTriangle,
    Zap,
    Briefcase,
    ChevronDown,
    ChevronUp,
    Lock as LockIcon,
} from 'lucide-react';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase configuration - Replace with your actual project URL and API key
const SUPABASE_URL = 'https://bjmluyvotwvmkrellnys.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqbWx1eXZvdHd2bWtyZWxsbnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3ODc5MDAsImV4cCI6MjA3MzM2MzkwMH0.MMc-zm1VtnQhrVUwXzg65xJqVKf2PHN0GtlE3PJAjOI';

// Contexts
const SupabaseContext = createContext(null);
const AuthContext = createContext(null);
const DataContext = createContext(null);
const UIContext = createContext(null);

// Providers
const SupabaseProvider = ({ children }) => {
    const [supabase, setSupabase] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            setSupabase(client);
        } catch (e) {
            console.error("Failed to create Supabase client:", e);
        }
        setLoading(false);
    }, []);

    return (
        <SupabaseContext.Provider value={{ supabase, loading }}>
            {children}
        </SupabaseContext.Provider>
    );
};

const AuthProvider = ({ children }) => {
    const { supabase, loading: supabaseLoading } = useContext(SupabaseContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (supabaseLoading) return;
        if (!supabase) {
            setLoading(false);
            return;
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase, supabaseLoading]);

    const value = {
        user,
        loading,
        signIn: async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            return { data, error };
        },
        signUp: async (email, password) => {
            const { data, error } = await supabase.auth.signUp({ email, password });
            return { data, error };
        },
        signOut: async () => {
            const { error } = await supabase.auth.signOut();
            return { error };
        },
        signInWithGoogle: async () => {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            return { data, error };
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

const DataProvider = ({ children }) => {
    const { supabase } = useContext(SupabaseContext);
    const { user } = useContext(AuthContext);
    const [participants, setParticipants] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!supabase || !user) {
            setLoading(false);
            return;
        }

        const fetchInitialData = async () => {
            try {
                const { data: participantsData, error: participantsError } = await supabase
                    .from('participants')
                    .select('*')
                    .eq('user_id', user.id);

                const { data: partnersData, error: partnersError } = await supabase
                    .from('partners')
                    .select('*')
                    .eq('user_id', user.id);

                if (participantsError || partnersError) {
                    console.error('Error fetching data:', participantsError || partnersError);
                } else {
                    setParticipants(participantsData);
                    setPartners(partnersData);
                }
            } catch (e) {
                console.error('Failed to fetch data:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [supabase, user]);

    const value = {
        participants,
        partners,
        loading,
        addParticipant: async (participant) => {
            if (!supabase) return { error: { message: 'Supabase not ready.' } };
            const { data, error } = await supabase
                .from('participants')
                .insert([{ ...participant, user_id: user.id }])
                .select();
            if (error) console.error('Error adding participant:', error);
            return { data, error };
        },
        updateParticipant: async (id, updates) => {
            if (!supabase) return { error: { message: 'Supabase not ready.' } };
            const { data, error } = await supabase
                .from('participants')
                .update(updates)
                .eq('id', id)
                .select();
            if (error) console.error('Error updating participant:', error);
            return { data, error };
        },
        deleteParticipant: async (id) => {
            if (!supabase) return { error: { message: 'Supabase not ready.' } };
            const { error } = await supabase
                .from('participants')
                .delete()
                .eq('id', id);
            if (error) console.error('Error deleting participant:', error);
            return { error };
        }
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

const uiReducer = (state, action) => {
    switch (action.type) {
        case 'SET_ACTIVE_TAB':
            return { ...state, activeTab: action.payload };
        case 'SET_ADD_EP_MODAL_OPEN':
            return { ...state, isAddEPModalOpen: action.payload };
        case 'SET_EP_DETAIL_MODAL_OPEN':
            return { ...state, isEPDetailModalOpen: action.payload };
        case 'SET_SELECTED_EP':
            return { ...state, selectedEP: action.payload };
        case 'SET_SETTINGS_MODAL_OPEN':
            return { ...state, isSettingsModalOpen: action.payload };
        case 'SET_NOTIFICATIONS_PANEL_OPEN':
            return { ...state, isNotificationsPanelOpen: action.payload };
        case 'ADD_NOTIFICATION':
            return { ...state, notifications: [...state.notifications, action.payload] };
        case 'REMOVE_NOTIFICATION':
            return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
        default:
            return state;
    }
};

const UIProvider = ({ children }) => {
    const [state, dispatch] = useReducer(uiReducer, {
        activeTab: 'dashboard',
        isAddEPModalOpen: false,
        isEPDetailModalOpen: false,
        selectedEP: null,
        isSettingsModalOpen: false,
        isNotificationsPanelOpen: false,
        notifications: [],
    });

    const value = {
        ...state,
        dispatch,
        showNotification: (message, type = 'info') => {
            const id = Date.now();
            dispatch({ type: 'ADD_NOTIFICATION', payload: { id, message, type } });
            setTimeout(() => {
                dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
            }, 5000);
        },
        openEPDetailModal: (ep) => {
            dispatch({ type: 'SET_SELECTED_EP', payload: ep });
            dispatch({ type: 'SET_EP_DETAIL_MODAL_OPEN', payload: true });
        },
        setActiveTab: (tab) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
        setIsAddEPModalOpen: (isOpen) => dispatch({ type: 'SET_ADD_EP_MODAL_OPEN', payload: isOpen }),
        setIsEPDetailModalOpen: (isOpen) => dispatch({ type: 'SET_EP_DETAIL_MODAL_OPEN', payload: isOpen }),
        setIsSettingsModalOpen: (isOpen) => dispatch({ type: 'SET_SETTINGS_MODAL_OPEN', payload: isOpen }),
        setIsNotificationsPanelOpen: (isOpen) => dispatch({ type: 'SET_NOTIFICATIONS_PANEL_OPEN', payload: isOpen }),
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};


// --- Components ---
const IconButton = ({ icon: Icon, onClick, className = '' }) => (
    <button onClick={onClick} className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${className}`}>
        <Icon className="w-5 h-5" />
    </button>
);

const Sidebar = () => {
    const { setActiveTab, setIsNotificationsPanelOpen, setIsSettingsModalOpen } = useContext(UIContext);
    const { user, signOut } = useContext(AuthContext);
    const handleSignOut = async () => {
        const { error } = await signOut();
        if (error) console.error('Logout failed:', error);
    };

    const navItems = [
        { id: 'dashboard', name: 'Dashboard', icon: Home },
        { id: 'participants', name: 'Participants', icon: Users },
        { id: 'credits', name: 'Credits', icon: CreditCard },
        { id: 'partners', name: 'Partners', icon: Handshake },
    ];
    
    return (
        <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between rounded-tr-lg rounded-br-lg shadow-lg">
            <div>
                <div className="flex items-center space-x-2 mb-8">
                    <Globe className="w-8 h-8 text-blue-600" />
                    <span className="text-xl font-bold text-gray-800">AIESEC CRM</span>
                </div>
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <div className="space-y-2">
                <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </button>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
                {user && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <img src={`https://placehold.co/32x32/1E40AF/FFFFFF?text=${user.email?.charAt(0).toUpperCase() || 'MR'}`} alt="User avatar" className="w-8 h-8 rounded-full" />
                        <div className="text-sm">
                            <div className="font-semibold text-gray-800">{user.email || 'Anonymous'}</div>
                            <div className="text-gray-500 text-xs truncate w-32">{user.id}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Header = () => {
    const { setIsNotificationsPanelOpen, setIsSettingsModalOpen } = useContext(UIContext);
    const { user } = useContext(AuthContext);
    return (
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
            <div className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search participants, partners, etc."
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
                <IconButton icon={Bell} onClick={() => setIsNotificationsPanelOpen(true)} />
                <IconButton icon={Settings} onClick={() => setIsSettingsModalOpen(true)} />
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'MR'}
                </div>
            </div>
        </header>
    );
};

const DashboardContent = () => {
    const { participants, partners, loading } = useContext(DataContext);
    if (loading) {
        return <p className="p-8">Loading dashboard...</p>;
    }
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-500 font-medium">Participants</p>
                        <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{participants.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Total participants</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-500 font-medium">Approvals</p>
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{participants.filter(p => p.status === 'Approved').length}</p>
                    <p className="text-sm text-gray-500 mt-1">Total approved</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-500 font-medium">Partners</p>
                        <Handshake className="w-6 h-6 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{partners.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Total partners</p>
                </div>
            </div>
        </div>
    );
};

const ParticipantsContent = () => {
    const { participants, loading } = useContext(DataContext);
    const { setIsAddEPModalOpen, openEPDetailModal } = useContext(UIContext);

    const statusColors = {
        'Approved': 'bg-green-100 text-green-800',
        'Realized': 'bg-blue-100 text-blue-800',
        'Applied': 'bg-yellow-100 text-yellow-800',
    };

    if (loading) {
        return <p className="p-8">Loading participants...</p>;
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Participants</h1>
                <button onClick={() => setIsAddEPModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    <span>Add Participant</span>
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {participants.map(p => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.program}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[p.status]}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.country}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center space-x-2">
                                        <button onClick={() => openEPDetailModal(p)} className="text-blue-600 hover:text-blue-900">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const CreditsContent = () => (
    <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900">Credits</h1>
        <p className="mt-2 text-gray-600">This is a mock credits page.</p>
    </div>
);

const PartnersContent = () => {
    const { partners, loading } = useContext(DataContext);
    if (loading) return <p className="p-8">Loading partners...</p>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Partners</h1>
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {partners.map(p => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.contact_person}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.company_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button className="text-blue-600 hover:text-blue-900">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AddEPModal = () => {
    const { isAddEPModalOpen, setIsAddEPModalOpen, showNotification } = useContext(UIContext);
    const { addParticipant } = useContext(DataContext);
    const [formData, setFormData] = useState({ name: '', email: '', program: 'Global Volunteer', status: 'Applied', country: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await addParticipant(formData);
        if (!error) {
            showNotification('Participant added successfully!', 'success');
            setFormData({ name: '', email: '', program: 'Global Volunteer', status: 'Applied', country: '' });
            setIsAddEPModalOpen(false);
        } else {
            showNotification('Failed to add participant.', 'error');
        }
    };

    if (!isAddEPModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-lg mx-4">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Add New Participant</h3>
                    <button onClick={() => setIsAddEPModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="program" className="block text-sm font-medium text-gray-700">Program</label>
                            <select name="program" id="program" value={formData.program} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option>Global Volunteer</option>
                                <option>Global Talent</option>
                                <option>Global Entrepreneur</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option>Applied</option>
                                <option>Approved</option>
                                <option>Realized</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                            <input type="text" name="country" id="country" value={formData.country} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-2">
                        <button type="button" onClick={() => setIsAddEPModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EPDetailModal = () => {
    const { isEPDetailModalOpen, setIsEPDetailModalOpen, selectedEP } = useContext(UIContext);
    if (!isEPDetailModalOpen || !selectedEP) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-lg mx-4">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{selectedEP.name}</h3>
                    <button onClick={() => setIsEPDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-4 text-gray-700">
                    <p><strong>Program:</strong> {selectedEP.program}</p>
                    <p><strong>Status:</strong> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedEP.status === 'Approved' ? 'bg-green-100 text-green-800' : selectedEP.status === 'Realized' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{selectedEP.status}</span></p>
                    <p><strong>Country:</strong> {selectedEP.country}</p>
                    <p><strong>Email:</strong> {selectedEP.email}</p>
                    <p><strong>Phone:</strong> {selectedEP.phone}</p>
                </div>
            </div>
        </div>
    );
};

const SettingsModal = () => {
    const { isSettingsModalOpen, setIsSettingsModalOpen } = useContext(UIContext);
    if (!isSettingsModalOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-lg mx-4">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Settings</h3>
                    <button onClick={() => setIsSettingsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <p>User settings will go here.</p>
            </div>
        </div>
    );
};

const NotificationsPanel = () => {
    const { isNotificationsPanelOpen, setIsNotificationsPanelOpen, notifications } = useContext(UIContext);
    if (!isNotificationsPanelOpen) return null;
    return (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 translate-x-0">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold">Notifications</h3>
                <button onClick={() => setIsNotificationsPanelOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
            </div>
            <div className="p-4 space-y-4">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <div key={n.id} className={`p-4 rounded-lg shadow-md ${n.type === 'success' ? 'bg-green-100' : n.type === 'error' ? 'bg-red-100' : 'bg-blue-100'}`}>
                            <p className={`text-sm ${n.type === 'success' ? 'text-green-800' : n.type === 'error' ? 'text-red-800' : 'text-blue-800'}`}>{n.message}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm text-center">No new notifications.</p>
                )}
            </div>
        </div>
    );
};

const NotificationToast = () => {
    const { notifications } = useContext(UIContext);
    return (
        <div className="fixed bottom-4 right-4 z-[100] space-y-2">
            {notifications.map(n => (
                <div key={n.id} className={`p-4 rounded-lg shadow-lg ${n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                    <p className="font-semibold">{n.message}</p>
                </div>
            ))}
        </div>
    );
};

const LoginPage = () => {
    const { signIn, signUp } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        let result;
        if (isLogin) {
            result = await signIn(email, password);
        } else {
            result = await signUp(email, password);
        }

        if (result.error) {
            setError(result.error.message);
        }
        setLoading(false);
    };

    return (
        <div className="h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
                <div className="text-center">
                    <Globe className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">{isLogin ? 'Welcome Back!' : 'Join AIESEC CRM'}</h1>
                    <p className="text-gray-500 mb-6">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MailIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                required
                                className="block w-full rounded-lg border-gray-300 pl-10 pr-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <LockIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                className="block w-full rounded-lg border-gray-300 pl-10 pr-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <button
                    onClick={() => { console.log('Mocking Google OAuth...'); }}
                    className="w-full py-2 px-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300 shadow-sm flex items-center justify-center space-x-2"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.54-.2-2.28h-9.98v4.19h5.61c-.24 1.34-1.07 2.45-2.29 3.18l-.2.12v2.23l1.83.05c2.72-2.51 4.3-6.42 4.3-11.02z" fill="#4285F4"/>
                        <path d="M12.38 23.36c2.7-.01 5.2-.88 7.15-2.43l-2.03-1.57c-1.39.91-3.13 1.45-5.11 1.45-3.95 0-7.3-2.6-8.49-6.08l-2.04 1.58C3.12 20.37 7.37 23.36 12.38 23.36z" fill="#34A853"/>
                        <path d="M3.89 14.19c-.43-1.3-.43-2.65 0-3.95l-.01-.05L1.84 8.65c-.63 1.29-.99 2.76-.99 4.34s.36 3.05.99 4.34l2.04-1.58z" fill="#FBBC04"/>
                        <path d="M12.38 3.52c2.19 0 4.1.76 5.62 2.15l1.82-1.83C17.58 2.05 15.1 1.05 12.38 1.05 7.37 1.05 3.12 4.04.97 8.35l2.04 1.58c1.19-3.48 4.54-6.08 8.5-6.08z" fill="#EA4335"/>
                    </svg>
                    <span>Sign In with Google</span>
                </button>

                <p className="mt-4 text-center text-sm text-gray-500">
                    {isLogin ? 'Don\'t have an account?' : 'Already have an account?'}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="font-medium text-blue-600 hover:text-blue-500 ml-1"
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

// Main App Component
const App = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const { activeTab } = useContext(UIContext);

    if (authLoading) {
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

    if (!user) {
        return <LoginPage />;
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
            <NotificationToast />
        </div>
    );
};

export default App;
