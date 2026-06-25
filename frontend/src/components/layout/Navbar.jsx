import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Kanban, PlusSquare, LogOut, Hexagon, Users, Bell, Upload } from 'lucide-react';
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../services/notification.service';

export const Navbar = () => {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [showNotifications, setShowNotifications] = React.useState(false);

    React.useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // poll every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const [notifs, count] = await Promise.all([
                getMyNotifications(),
                getUnreadCount()
            ]);
            setNotifications(notifs);
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const handleNotificationClick = async (n) => {
        setShowNotifications(false);
        if (!n.isRead) {
            await markAsRead(n.id);
            fetchNotifications();
        }
        if (n.issueId) {
            navigate(`/issue/${n.issueId}`);
        }
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        fetchNotifications();
    };

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const navLinkClass = (path) => 
        `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            location.pathname === path 
            ? 'bg-primary/10 text-primary' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`;

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 text-primary">
                            <Hexagon className="h-8 w-8 fill-primary/20" />
                            <span className="font-bold text-xl tracking-tight text-gray-900">IssueTracker</span>
                        </Link>
                        
                        {user && (
                            <div className="hidden md:flex items-center gap-2">
                                <Link to="/" className={navLinkClass('/')}>
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                {(user.role === 'SUPPORT_STAFF' || user.role === 'ADMIN') && (
                                    <Link to="/import" className={navLinkClass('/import')}>
                                        <Upload className="h-4 w-4" />
                                        Import
                                    </Link>
                                )}
                                {(user.role === 'SUPPORT_STAFF' || user.role === 'DEVELOPER' || user.role === 'QA' || user.role === 'ENGINEERING_MANAGER' || user.role === 'PRODUCT_OWNER' || user.role === 'ADMIN') && (
                                    <Link to="/board" className={navLinkClass('/board')}>
                                        <Kanban className="h-4 w-4" />
                                        Kanban Board
                                    </Link>
                                )}
                                {user.role === 'ADMIN' && (
                                    <Link to="/users" className={navLinkClass('/users')}>
                                        <Users className="h-4 w-4" />
                                        Users
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {user && (
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors relative"
                                >
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2">
                                        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="font-bold text-gray-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={handleMarkAllAsRead} className="text-xs text-primary hover:text-primary/80 font-medium">
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-8 text-center text-gray-500 text-sm">No notifications yet</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div 
                                                        key={n.id} 
                                                        onClick={() => handleNotificationClick(n)}
                                                        className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-transparent'}`}></div>
                                                            <div>
                                                                <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{n.message}</p>
                                                                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-medium text-gray-900">{user.email.split('@')[0]}</div>
                                    <div className="text-xs text-gray-500 font-semibold">{user.role}</div>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
