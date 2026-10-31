/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Folder,
  FileText,
  Upload,
  Search,
  Plus,
  Tag,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Eye,
  Star,
  Download,
  UploadCloud,
  Sparkles,
  Filter,
  ShieldCheck,
  FileCheck,
  Lock,
  Moon,
  Sun,
  X,
  FileUp,
  Share2,
  RefreshCw,
  Clock,
  Briefcase,
  HeartPulse,
  Landmark,
  GraduationCap,
  UserCheck,
  FileCode,
  Layers,
  Check,
  User,
  LogIn,
  UserPlus,
  Home,
  LayoutDashboard,
  LogOut,
  ArrowRight,
  Shield,
  Key,
} from "lucide-react";

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  extractedText: string;
  importantNotes: string;
  expiryDate: string | null;
  createdAt: string;
  fileData?: string;
  fileName?: string;
  fileType?: string;
  isStarred?: boolean;
}

const CATEGORIES = [
  "Financial",
  "Legal",
  "Medical",
  "Personal",
  "Education",
  "Work",
  "Govt ID",
  "Other",
];

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-1",
    title: "Aadhaar Card (UIDAI)",
    category: "Govt ID",
    tags: ["identity", "govt", "aadhaar", "verification"],
    summary: "Official Unique Identification Authority of India (UIDAI) card for identity and address proof.",
    extractedText: "UIDAI Government of India. Name: Rajesh Kumar Sharma. DOB: 14/06/1988. Address: Sector 45, Gurgaon, Haryana.",
    importantNotes: "Virtual ID registered. Securely stored for KYC.",
    expiryDate: null,
    createdAt: "2026-01-10T10:00:00Z",
    fileName: "aadhaar_front.jpg",
    fileType: "image/jpeg",
    isStarred: true,
  },
  {
    id: "doc-2",
    title: "Health Insurance Policy 2026",
    category: "Medical",
    tags: ["insurance", "health", "mediclaim", "family"],
    summary: "Comprehensive Family Floater Health Insurance policy covering hospitalization and cashless claims up to ₹10 Lakhs.",
    extractedText: "Policy No: HDF-9982341-26. Insured: Rajesh Kumar & Family. Premium Paid: ₹24,500.",
    importantNotes: "Renew before due date to retain continuity benefits and no-claim bonus.",
    expiryDate: "2027-02-15",
    createdAt: "2026-02-15T14:30:00Z",
    fileName: "health_policy_2026.pdf",
    fileType: "application/pdf",
    isStarred: true,
  },
  {
    id: "doc-3",
    title: "Income Tax Return (ITR-1) AY 2025-26",
    category: "Financial",
    tags: ["tax", "itr", "finance", "income-tax"],
    summary: "Filed Income Tax Return acknowledgment for Assessment Year 2025-26 showing verified tax clearance.",
    extractedText: "Acknowledgment No: 98234710293. Gross Total Income: ₹14,50,000. Tax Paid: Nil after deductions.",
    importantNotes: "Keep safe for home loan processing and visa applications.",
    expiryDate: null,
    createdAt: "2026-07-20T09:15:00Z",
    fileName: "itr_ack_2025.pdf",
    fileType: "application/pdf",
    isStarred: false,
  },
  {
    id: "doc-4",
    title: "B.Tech Degree Certificate",
    category: "Education",
    tags: ["degree", "university", "education", "graduation"],
    summary: "Bachelor of Technology in Computer Science & Engineering from National Institute of Technology.",
    extractedText: "Degree in Computer Science & Engineering. First Class with Distinction. Issued: July 2012.",
    importantNotes: "Original verified copy required for higher studies or international verification.",
    expiryDate: null,
    createdAt: "2026-03-01T11:20:00Z",
    fileName: "btech_degree.jpg",
    fileType: "image/jpeg",
    isStarred: true,
  },
];

export default function App() {
  // Navigation & Auth state
  const [activeTab, setActiveTab] = useState<"home" | "register" | "login" | "dashboard" | "upload" | "listing">("home");
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem("doc_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem("personal_docs_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved docs", e);
      }
    }
    return INITIAL_DOCUMENTS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedExpiryFilter, setSelectedExpiryFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("doc_dark_mode") === "true";
  });

  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Upload form states
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Financial");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string; data: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth form states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    localStorage.setItem("personal_docs_v1", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("doc_dark_mode", String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("doc_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("doc_current_user");
    }
  }, [currentUser]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      setUploadedFile({
        name: file.name,
        type: file.type || "image/jpeg",
        data: base64String,
      });
      if (!uploadTitle) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setUploadTitle(cleanName.replace(/[-_]/g, ' '));
      }
    };
    reader.readAsDataURL(file);
  };

  // Run AI Analysis & Add Document
  const handleAiUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    setIsAnalyzing(true);
    setUploadSuccessMsg(false);
    try {
      const response = await fetch("/api/ai/analyze-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle,
          content: uploadNotes,
          fileData: uploadedFile?.data,
          mimeType: uploadedFile?.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze document");
      }

      const aiResult = await response.json();

      const newDoc: DocumentItem = {
        id: "doc-" + Date.now(),
        title: uploadTitle,
        category: aiResult.category || uploadCategory,
        tags: aiResult.tags || ["document", uploadCategory.toLowerCase()],
        summary: aiResult.summary || uploadNotes || "No summary generated.",
        extractedText: aiResult.extractedText || uploadNotes,
        importantNotes: aiResult.importantNotes || "",
        expiryDate: aiResult.expiryDate || null,
        createdAt: new Date().toISOString(),
        fileName: uploadedFile?.name,
        fileType: uploadedFile?.type,
        fileData: uploadedFile ? `data:${uploadedFile.type};base64,${uploadedFile.data}` : undefined,
        isStarred: false,
      };

      setDocuments([newDoc, ...documents]);
      setUploadSuccessMsg(true);
      resetUploadForm();
      setTimeout(() => {
        setActiveTab("listing");
      }, 1200);
    } catch (err) {
      console.error(err);
      const newDoc: DocumentItem = {
        id: "doc-" + Date.now(),
        title: uploadTitle,
        category: uploadCategory,
        tags: [uploadCategory.toLowerCase(), "manual"],
        summary: uploadNotes || "Manually added document.",
        extractedText: uploadNotes,
        importantNotes: uploadNotes,
        expiryDate: null,
        createdAt: new Date().toISOString(),
        fileName: uploadedFile?.name,
        fileType: uploadedFile?.type,
        fileData: uploadedFile ? `data:${uploadedFile.type};base64,${uploadedFile.data}` : undefined,
        isStarred: false,
      };
      setDocuments([newDoc, ...documents]);
      setUploadSuccessMsg(true);
      resetUploadForm();
      setTimeout(() => {
        setActiveTab("listing");
      }, 1200);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetUploadForm = () => {
    setUploadTitle("");
    setUploadCategory("Financial");
    setUploadNotes("");
    setUploadedFile(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Kya aap sach mein is document ko delete karna chahte hain?")) {
      setDocuments(documents.filter((d) => d.id !== id));
      if (previewDoc?.id === id) setPreviewDoc(null);
    }
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocuments(
      documents.map((d) => (d.id === id ? { ...d, isStarred: !d.isStarred } : d))
    );
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.extractedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "All" ||
        (selectedCategory === "Starred" && doc.isStarred) ||
        doc.category === selectedCategory;

      let matchesExpiry = true;
      if (selectedExpiryFilter === "Expiring Soon") {
        if (!doc.expiryDate) {
          matchesExpiry = false;
        } else {
          const days = Math.ceil(
            (new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          matchesExpiry = days >= 0 && days <= 30;
        }
      } else if (selectedExpiryFilter === "Expired") {
        if (!doc.expiryDate) {
          matchesExpiry = false;
        } else {
          const days = Math.ceil(
            (new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          matchesExpiry = days < 0;
        }
      }

      return matchesSearch && matchesCategory && matchesExpiry;
    });
  }, [documents, searchQuery, selectedCategory, selectedExpiryFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = documents.length;
    const starred = documents.filter((d) => d.isStarred).length;
    const expiringSoon = documents.filter((d) => {
      if (!d.expiryDate) return false;
      const days = Math.ceil(
        (new Date(d.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return days >= 0 && days <= 30;
    }).length;
    const categoriesCount = new Set(documents.map((d) => d.category)).size;
    return { total, starred, expiringSoon, categoriesCount };
  }, [documents]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Financial": return <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "Legal": return <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case "Medical": return <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case "Personal": return <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case "Education": return <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "Work": return <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case "Govt ID": return <FileCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      default: return <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const exportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(documents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `personal_documents_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation Bar - Strict 3-Zone Contract */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div 
          onClick={() => setActiveTab(currentUser ? "dashboard" : "home")}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Folder className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            DocVault Pro
          </span>
        </div>

        {/* Zone 2: Navigation Links based on user request image (Home Page, Registration Page, Login Page, Main Dashboard, Document Upload, Document Listing/Search) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab("home")}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${activeTab === "home" ? "text-indigo-600 dark:text-indigo-400 font-semibold" : ""}`}
          >
            Home Page
          </button>
          {currentUser ? (
            <>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${activeTab === "dashboard" ? "text-indigo-600 dark:text-indigo-400 font-semibold" : ""}`}
              >
                Main Dashboard
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${activeTab === "upload" ? "text-indigo-600 dark:text-indigo-400 font-semibold" : ""}`}
              >
                Document Upload
              </button>
              <button
                onClick={() => setActiveTab("listing")}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${activeTab === "listing" ? "text-indigo-600 dark:text-indigo-400 font-semibold" : ""}`}
              >
                Document Listing/Search
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab("register")}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${activeTab === "register" ? "text-indigo-600 dark:text-indigo-400 font-semibold" : ""}`}
              >
                Registration Page
              </button>
              <button
                onClick={() => setActiveTab("login")}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${activeTab === "login" ? "text-indigo-600 dark:text-indigo-400 font-semibold" : ""}`}
              >
                Login Page
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Action & Theme Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hi, {currentUser.name}
              </span>
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setActiveTab("home");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("login")}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap shrink-0"
              >
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main View Router based on requested features: Home Page, Registration Page, Login Page, Main Dashboard, Document Upload, Document Listing/Search */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {activeTab === "home" && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center text-center gap-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_50%)] pointer-events-none" />
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium backdrop-blur-md border border-indigo-500/30">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI-Powered Personal Document Organizer</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl leading-tight">
                Apne Important Documents Ko Category-Wise Secure & Organized Rakhein
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Upload your files, let Gemini AI extract tags, summaries, and expiry alerts instantly. Access everything securely anytime, anywhere.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setActiveTab(currentUser ? "dashboard" : "register")}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab(currentUser ? "listing" : "login")}
                  className="px-6 py-3 text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-all border border-slate-700"
                >
                  {currentUser ? "View Documents" : "Login to Account"}
                </button>
              </div>
            </div>

            {/* Feature Highlights matching the 6 requested modules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => setActiveTab("dashboard")}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 transition-all cursor-pointer group space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Main Dashboard</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Quick stats, expiration radar, and category breakdown to monitor all your stored documents at a glance.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab("upload")}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 transition-all cursor-pointer group space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Document Upload</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Drag and drop scans, PDFs, or images with AI smart extraction for tags, categories, and summaries.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab("listing")}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 transition-all cursor-pointer group space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Document Listing/Search</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Lightning-fast search across title, extracted OCR text, notes, and tags with grid or table views.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "register" && (
          <div className="max-w-md mx-auto w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl space-y-6 my-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Account</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Register to start managing your personal documents</p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!regName || !regEmail || !regPassword) return;
                const newUser = { name: regName, email: regEmail };
                setCurrentUser(newUser);
                setActiveTab("dashboard");
              }} 
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Rajesh Kumar"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="rajesh@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-md transition-colors"
              >
                Register Account
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <button onClick={() => setActiveTab("login")} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Login here
              </button>
            </div>
          </div>
        )}

        {activeTab === "login" && (
          <div className="max-w-md mx-auto w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl space-y-6 my-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to access your secure document vault</p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const user = { name: loginEmail.split("@")[0] || "User", email: loginEmail || "user@example.com" };
                setCurrentUser(user);
                setActiveTab("dashboard");
              }} 
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="rajesh@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-md transition-colors"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentUser({ name: "Demo User", email: "demo@docvault.com" });
                  setActiveTab("dashboard");
                }}
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs transition-colors"
              >
                Quick Demo Login (One Click)
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
              <button onClick={() => setActiveTab("register")} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Register here
              </button>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Main Dashboard</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Welcome back, {currentUser?.name || "User"}. Here is your document overview.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab("upload")}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
                <button
                  onClick={() => setActiveTab("listing")}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  View All Docs
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Total Documents</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Active Categories</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.categoriesCount}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Folder className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Expiring Soon</div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.expiringSoon}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Starred Documents</div>
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.starred}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Star className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Category Breakdown & Recent Docs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Categories Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Categories Breakdown</h3>
                <div className="space-y-3">
                  {CATEGORIES.map((cat) => {
                    const count = documents.filter((d) => d.category === cat).length;
                    return (
                      <div 
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setActiveTab("listing");
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {getCategoryIcon(cat)}
                          <span>{cat}</span>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Documents Card */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Documents</h3>
                  <button
                    onClick={() => setActiveTab("listing")}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {documents.slice(0, 4).map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setPreviewDoc(doc)}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {getCategoryIcon(doc.category)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{doc.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {doc.category} <span aria-hidden="true">·</span> {new Date(doc.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <div className="max-w-2xl mx-auto w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Document Upload</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Upload documents with AI smart tagging and OCR analysis</p>
              </div>
            </div>

            {uploadSuccessMsg && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Document successfully uploaded and analyzed by AI! Redirecting to listing...</span>
              </div>
            )}

            <form onSubmit={handleAiUploadSubmit} className="space-y-4">
              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select File (Image / PDF / Scan)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/50 flex flex-col items-center justify-center gap-2"
                >
                  <FileUp className="w-10 h-10 text-indigo-500" />
                  {uploadedFile ? (
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {uploadedFile.name}
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Click to upload or drag and drop files here
                      </div>
                      <div className="text-xs text-slate-500">Supports JPEG, PNG, PDF, TXT</div>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,application/pdf,.txt"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electricity Bill, Car Insurance, PAN Card..."
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes / Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add any extra details, account numbers, or notes..."
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI Analyzing Document...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Upload & Analyze</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "listing" && (
          <div className="space-y-6">
            {/* Header & Search Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search document listing by title, notes, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedExpiryFilter}
                  onChange={(e) => setSelectedExpiryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Expiring Soon">Expiring Soon (30 Days)</option>
                  <option value="Expired">Expired</option>
                </select>

                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "grid" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "table" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    Table
                  </button>
                </div>

                <button
                  onClick={() => setActiveTab("upload")}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload</span>
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${selectedCategory === "All" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}
              >
                All Categories ({documents.length})
              </button>
              <button
                onClick={() => setSelectedCategory("Starred")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${selectedCategory === "Starred" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}
              >
                <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>Starred ({documents.filter(d => d.isStarred).length})</span>
              </button>
              {CATEGORIES.map((cat) => {
                const count = documents.filter((d) => d.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${selectedCategory === cat ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}
                  >
                    {getCategoryIcon(cat)}
                    <span>{cat}</span>
                    <span className="opacity-65 text-[11px]">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Document Listing View */}
            {filteredDocuments.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">No documents found</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    Try adjusting your search query or upload a new document.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Upload New Document
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((doc) => {
                  let expiryBadge = null;
                  if (doc.expiryDate) {
                    const days = Math.ceil(
                      (new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    if (days < 0) {
                      expiryBadge = (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                          <AlertCircle className="w-3 h-3" /> Expired
                        </span>
                      );
                    } else if (days <= 30) {
                      expiryBadge = (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3" /> Expires in {days}d
                        </span>
                      );
                    } else {
                      expiryBadge = (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Expires: {doc.expiryDate}
                        </span>
                      );
                    }
                  }

                  return (
                    <div
                      key={doc.id}
                      onClick={() => setPreviewDoc(doc)}
                      className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              {getCategoryIcon(doc.category)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {doc.title}
                              </h4>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span>{doc.category}</span>
                                <span aria-hidden="true">·</span>
                                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => toggleStar(doc.id, e)}
                            className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                          >
                            <Star className={`w-4 h-4 ${doc.isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                          </button>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {doc.summary}
                        </p>

                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            {doc.tags.map((tag, idx) => (
                              <span key={idx} className="inline-flex items-center">
                                #{tag}{idx < doc.tags.length - 1 ? <span className="mx-1.5 text-slate-300 dark:text-slate-700">·</span> : null}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                        <div>{expiryBadge || <span className="text-xs text-slate-400">No expiration</span>}</div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewDoc(doc);
                            }}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc.id);
                            }}
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Document Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Tags</th>
                        <th className="py-3 px-4">Expiry Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredDocuments.map((doc) => (
                        <tr
                          key={doc.id}
                          onClick={() => setPreviewDoc(doc)}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-slate-900 dark:text-white flex items-center gap-2.5">
                            <button
                              onClick={(e) => toggleStar(doc.id, e)}
                              className="text-slate-400 hover:text-amber-400 transition-colors"
                            >
                              <Star className={`w-4 h-4 ${doc.isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                            </button>
                            <span>{doc.title}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            <span className="inline-flex items-center gap-1.5">
                              {getCategoryIcon(doc.category)}
                              {doc.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs">
                            {doc.tags.map((t) => `#${t}`).join(", ")}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 tabular-nums">
                            {doc.expiryDate || "—"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewDoc(doc);
                                }}
                                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(doc.id);
                                }}
                                className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  {getCategoryIcon(previewDoc.category)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {previewDoc.title}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>{previewDoc.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>Added {new Date(previewDoc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Summary Box */}
            <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span>AI Summary & Insights</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {previewDoc.summary}
              </p>
              {previewDoc.importantNotes && (
                <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                  <span className="font-semibold">Key Takeaway / Notes:</span> {previewDoc.importantNotes}
                </div>
              )}
            </div>

            {/* Extracted Text / OCR */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Extracted Text & OCR Content
              </h4>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {previewDoc.extractedText || "No OCR text extracted."}
              </div>
            </div>

            {/* File preview */}
            {previewDoc.fileData && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Attached File Preview ({previewDoc.fileName})
                </h4>
                {previewDoc.fileType?.startsWith("image/") ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 flex items-center justify-center max-h-64">
                    <img
                      src={previewDoc.fileData}
                      alt={previewDoc.title}
                      className="max-h-64 object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium text-slate-900 dark:text-white">{previewDoc.fileName}</span>
                    </div>
                    <a
                      href={previewDoc.fileData}
                      download={previewDoc.fileName || "document"}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Download File
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {previewDoc.tags?.map((t, idx) => (
                  <span key={idx}>#{t}{idx < previewDoc.tags.length - 1 ? <span className="mx-1">·</span> : null}</span>
                ))}
              </div>

              {previewDoc.expiryDate && (
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Expires: {previewDoc.expiryDate}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  handleDelete(previewDoc.id);
                  setPreviewDoc(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors mr-auto flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
