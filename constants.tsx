
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileEdit, 
  FileText, 
  Calendar, 
  Briefcase, 
  ClipboardList, 
  Camera, 
  RefreshCcw, 
  Receipt, 
  ShieldCheck, 
  Truck, 
  Copy, 
  Settings, 
  BarChart3,
  Search,
  Plus,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  ChevronRight,
  MoreVertical,
  Phone,
  Mail,
  User,
  HardHat,
  Construction,
  Layers,
  FileSearch,
  MessageSquare,
  TrendingUp,
  Lock,
  Unlock,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Database,
  BookOpen,
  Scale,
  GraduationCap
} from 'lucide-react';

export const OPS_NAVIGATION = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'leads', label: 'Leads (CRM)', icon: <Users size={20} /> },
  { id: 'estimates', label: 'Estimates', icon: <FileEdit size={20} /> },
  { id: 'proposals', label: 'Proposals', icon: <FileText size={20} /> },
  { id: 'schedule', label: 'Schedule', icon: <Calendar size={20} /> },
  { id: 'jobs', label: 'Jobs', icon: <Briefcase size={20} /> },
  { id: 'datacenter', label: 'Data Center', icon: <Database size={20} /> },
  { id: 'logs', label: 'Daily Logs', icon: <ClipboardList size={20} /> },
  { id: 'photos', label: 'Photos', icon: <Camera size={20} /> },
  { id: 'change-orders', label: 'Change Orders', icon: <RefreshCcw size={20} /> },
  { id: 'invoices', label: 'Invoices', icon: <Receipt size={20} /> },
  { id: 'warranty', label: 'Warranty Claims', icon: <ShieldCheck size={20} /> },
  { id: 'vendors', label: 'Vendors', icon: <Truck size={20} /> },
  { id: 'templates', label: 'Templates', icon: <Copy size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
];

export const KB_NAVIGATION = [
  { id: 'kb/sops', label: 'SOPs', icon: <BookOpen size={20} /> },
  { id: 'kb/standards', label: 'Standards', icon: <Scale size={20} /> },
  { id: 'kb/checklists', label: 'Standard Checklists', icon: <CheckCircle2 size={20} /> },
  { id: 'kb/policies', label: 'Company Policies', icon: <ShieldCheck size={20} /> },
  { id: 'kb/production-rates', label: 'Production Rates', icon: <TrendingUp size={20} /> },
  { id: 'kb/training', label: 'Training', icon: <GraduationCap size={20} /> },
];

export const ICONS = {
  // Add LayoutDashboard to fix Error in file components/Sidebar.tsx on line 99
  LayoutDashboard, Search, Plus, Bell, CheckCircle2, AlertCircle, Clock, MapPin, ChevronRight, 
  MoreVertical, Phone, Mail, User, Users, Truck, Briefcase, Calendar, 
  ClipboardList, Camera, RefreshCcw, Receipt, ShieldCheck, FileEdit, FileText,
  HardHat, Construction, Layers, FileSearch, MessageSquare, TrendingUp, Lock, Unlock, Trash2, GripVertical, ImageIcon,
  BarChart3, Database, BookOpen, Scale, GraduationCap
};