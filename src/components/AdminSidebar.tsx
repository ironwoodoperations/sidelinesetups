import {
  Calendar,
  Package,
  MapPin,
  Wrench,
  HelpCircle,
  Settings,
  Tag,
  ClipboardList,
  LogOut,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import logoIcon from '@/assets/logo-icon.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const mainItems = [
  { title: 'Bookings', url: '/admin', icon: ClipboardList },
  { title: 'Events', url: '/admin/events', icon: Calendar },
  { title: 'Packages', url: '/admin/packages', icon: Package },
  { title: 'Parks & Fields', url: '/admin/parks', icon: MapPin },
];

const configItems = [
  { title: 'Equipment', url: '/admin/equipment', icon: Wrench },
  { title: 'Discount Codes', url: '/admin/discounts', icon: Tag },
  { title: 'FAQ', url: '/admin/faq', icon: HelpCircle },
  { title: 'SMS', url: '/admin/sms', icon: MessageSquare },
  { title: 'Site Settings', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const location = useLocation();

  const admin = JSON.parse(sessionStorage.getItem('ss.admin') || '{}');

  const handleLogout = () => {
    sessionStorage.removeItem('ss.admin');
    navigate('/admin-login');
  };

  const isActive = (url: string) =>
    url === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 flex items-center gap-2">
          <img src={logoIcon} alt="" className="h-8 w-8 brightness-0 invert" />
          {!collapsed && (
            <span className="font-heading text-sm font-bold text-sidebar-foreground">
              Sideline <span className="text-sidebar-primary">Admin</span>
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url === '/admin'} activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Config</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 space-y-2">
          {!collapsed && admin.name && (
            <p className="text-xs text-sidebar-foreground/70 truncate">{admin.name}</p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
