import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { 
  Plus, Edit2, Trash2, QrCode, Printer, Download, LayoutDashboard, 
  Building, MessageSquare, TrendingUp, Star, Sparkles, Copy, 
  ExternalLink, Check, CheckCircle2, ShieldCheck, Mail, AlertTriangle, Eye, ShieldAlert, Search,
  Menu, X
} from "lucide-react";
import { BUSINESS_TYPES } from "./mockData";

export default function Dashboard({ 
  businesses, 
  activeBiz, 
  setActiveBizId, 
  onAddBusiness, 
  onUpdateBusiness, 
  onDeleteBusiness,
  onLaunchFunnel,
  onLogout,
  privateFeedbacks,
  convertedReviews,
  onUpdateFeedbackStatus,
  isOwnerView = false
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [feedbackFilter, setFeedbackFilter] = useState("public"); // "public" or "private"
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Feedback Console states
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form states for adding/editing business
  const [bizName, setBizName] = useState("");
  const [bizType, setBizType] = useState("restaurant");
  const [bizGoogleUrl, setBizGoogleUrl] = useState("");
  const [bizWhatsapp, setBizWhatsapp] = useState("");
  const [bizColor, setBizColor] = useState("#6366f1");
  const [bizOwnerUser, setBizOwnerUser] = useState("");
  const [bizOwnerPass, setBizOwnerPass] = useState("");
  const [editBizId, setEditBizId] = useState(null);

  // QR Design States
  const [qrColorDark, setQrColorDark] = useState("#0f172a");
  const [qrColorLight, setQrColorLight] = useState("#ffffff");
  const [flyerTheme, setFlyerTheme] = useState("accent"); // "accent", "light", "dark"
  const [flyerTemplate, setFlyerTemplate] = useState("flyer"); // "flyer", "tent"
  const canvasRef = useRef(null);

  // Prefill form states when active business switches (critical for Owner View details page)
  useEffect(() => {
    if (activeBiz) {
      setBizName(activeBiz.name || "");
      setBizType(activeBiz.type || "restaurant");
      setBizGoogleUrl(activeBiz.googleReviewUrl || "");
      setBizWhatsapp(activeBiz.whatsappNumber || "");
      setBizColor(activeBiz.primaryColor || "#6366f1");
      setBizOwnerUser(activeBiz.ownerUsername || "");
      setBizOwnerPass(activeBiz.ownerPassword || "");
    }
  }, [activeBiz]);

  // Generate QR Code on canvas
  useEffect(() => {
    if (activeBiz && canvasRef.current) {
      let funnelUrlBase = window.location.origin;
      
      // Auto-replace localhost with the local network IP and explicitly set the Funnel port to 5173 for local dev testing
      if (window.location.hostname.includes('localhost') || window.location.hostname.includes('10.')) {
        funnelUrlBase = `${window.location.protocol}//10.159.14.197:5173`;
      }

      const funnelUrl = `${funnelUrlBase}/?biz=${activeBiz.id}`;
      
      QRCode.toCanvas(
        canvasRef.current,
        funnelUrl,
        {
          color: {
            dark: qrColorDark,
            light: qrColorLight,
          },
          width: 250,
          margin: 1,
          errorCorrectionLevel: 'H'
        },
        (err) => {
          if (err) console.error("Error generating QR code", err);
        }
      );
    }
  }, [activeBiz, qrColorDark, qrColorLight, activeTab, flyerTemplate]);

  if (!activeBiz) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "white" }}>
        <h2>Loading your Review Automation Dashboard...</h2>
      </div>
    );
  }

  // Calculate overall metrics
  const totalScans = activeBiz.analytics.scans;
  const totalReviews = activeBiz.analytics.reviewsGenerated;
  const totalRedirects = activeBiz.analytics.redirectsToGoogle;
  const totalFeedbackCount = privateFeedbacks.filter(f => f.businessId === activeBiz.id).length;
  
  const conversionRate = totalScans > 0 ? Math.round((totalReviews / totalScans) * 100) : 0;
  const googleClickRate = totalReviews > 0 ? Math.round((totalRedirects / totalReviews) * 100) : 0;

  // Star breakdown math
  const ratings = activeBiz.analytics.ratingCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const totalVotes = Object.values(ratings).reduce((a, b) => a + b, 0);
  const avgRating = totalVotes > 0 
    ? (Object.entries(ratings).reduce((sum, [stars, count]) => sum + (parseInt(stars) * count), 0) / totalVotes).toFixed(1)
    : "0.0";

  // Pre-calculate path points for the SVG Area Chart based on active business scans
  // We simulate points: W1, W2, W3, W4, Current based on the scans total
  const scanDataPoints = [
    Math.round(totalScans * 0.4),
    Math.round(totalScans * 0.6),
    Math.round(totalScans * 0.5),
    Math.round(totalScans * 0.8),
    totalScans
  ];

  // Map scan data points to SVG coordinates (X range: 50 to 550, Y range: 30 to 180)
  // Max scale defaults to at least 100 to prevent divide by zero
  const maxVal = Math.max(...scanDataPoints, 50);
  const chartCoordinates = scanDataPoints.map((val, i) => {
    const x = 60 + i * 115;
    // Invert Y axis: higher value = lower coordinate
    const y = 170 - (val / maxVal) * 120;
    return { x, y, val };
  });

  // Build the D attribute for the SVG line and fill area
  const linePathD = chartCoordinates.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, "");

  const areaPathD = `${linePathD} L ${chartCoordinates[4].x} 180 L ${chartCoordinates[0].x} 180 Z`;

  // Open edit modal prefilled
  const openEditModal = (biz) => {
    setEditBizId(biz.id);
    setBizName(biz.name);
    setBizType(biz.type);
    setBizGoogleUrl(biz.googleReviewUrl);
    setBizWhatsapp(biz.whatsappNumber || "");
    setBizColor(biz.primaryColor || "#6366f1");
    setBizOwnerUser(biz.ownerUsername || "");
    setBizOwnerPass(biz.ownerPassword || "");
    setShowEditModal(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!bizName || !bizGoogleUrl) return;
    onAddBusiness({
      name: bizName,
      type: bizType,
      googleReviewUrl: bizGoogleUrl,
      whatsappNumber: bizWhatsapp,
      primaryColor: bizColor,
      ownerUsername: bizOwnerUser,
      ownerPassword: bizOwnerPass
    });
    // Reset form
    setBizName("");
    setBizType("restaurant");
    setBizGoogleUrl("");
    setBizWhatsapp("");
    setBizColor("#6366f1");
    setBizOwnerUser("");
    setBizOwnerPass("");
    setShowAddModal(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!bizName || !bizGoogleUrl) return;
    onUpdateBusiness(editBizId, {
      name: bizName,
      type: bizType,
      googleReviewUrl: bizGoogleUrl,
      whatsappNumber: bizWhatsapp,
      primaryColor: bizColor,
      ownerUsername: bizOwnerUser,
      ownerPassword: bizOwnerPass
    });
    setShowEditModal(false);
  };

  // Download QR Code image
  const downloadQRCode = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${activeBiz.name.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    link.href = url;
    link.click();
  };

  // Download entire card template (flyer or tent placement) as PNG using html2canvas
  const triggerPrint = async () => {
    const element = document.getElementById("print-area");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2, // Double scale size for printing quality
        backgroundColor: null
      });

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${activeBiz.name.toLowerCase().replace(/\s+/g, "-")}-${flyerTemplate}.png`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error("Failed to export printable card", err);
      alert("Error exporting printable card. Please try again.");
    }
  };

  // Get active business feedbacks (fully filtered for Feedback Console)
  const bizPrivateFeedbacks = privateFeedbacks
    .filter(f => f.businessId === activeBiz?.id)
    .filter(f => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textMatch = f.comment?.toLowerCase().includes(query);
        const nameMatch = f.name?.toLowerCase().includes(query);
        const emailMatch = f.email?.toLowerCase().includes(query);
        const tagsMatch = f.tags?.some(t => t.toLowerCase().includes(query));
        if (!textMatch && !nameMatch && !emailMatch && !tagsMatch) return false;
      }
      if (ratingFilter !== "all" && f.rating !== parseInt(ratingFilter)) {
        return false;
      }
      if (statusFilter !== "all" && (f.status || "pending") !== statusFilter) {
        return false;
      }
      return true;
    });

  const bizConvertedReviews = convertedReviews
    .filter(r => r.businessId === activeBiz?.id)
    .filter(r => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textMatch = r.reviewText?.toLowerCase().includes(query);
        const tagsMatch = r.tags?.some(t => t.toLowerCase().includes(query));
        if (!textMatch && !tagsMatch) return false;
      }
      if (ratingFilter !== "all" && r.rating !== parseInt(ratingFilter)) {
        return false;
      }
      return true;
    });

  // Helper to resolve business type label
  const getBizTypeLabel = (typeId) => {
    const type = BUSINESS_TYPES.find(t => t.id === typeId);
    return type ? type.label : typeId;
  };

  // Shared Nav items helper to prevent duplication between Sidebar and Mobile menu
  const renderNavItems = () => (
    <>
      <div 
        className={`nav-tab ${activeTab === "overview" ? "active" : ""}`}
        onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}
      >
        <LayoutDashboard className="nav-icon" /> Overview
      </div>
      <div 
        className={`nav-tab ${activeTab === "businesses" ? "active" : ""}`}
        onClick={() => { setActiveTab("businesses"); setMobileMenuOpen(false); }}
      >
        <Building className="nav-icon" /> {isOwnerView ? "Shop Settings" : "Businesses"}
      </div>
      <div 
        className={`nav-tab ${activeTab === "qr" ? "active" : ""}`}
        onClick={() => { setActiveTab("qr"); setMobileMenuOpen(false); }}
      >
        <QrCode className="nav-icon" /> QR &amp; Flyer Print
      </div>
      <div 
        className={`nav-tab ${activeTab === "feedback" ? "active" : ""}`}
        onClick={() => { setActiveTab("feedback"); setMobileMenuOpen(false); }}
      >
        <MessageSquare className="nav-icon" /> Feedbacks ({bizPrivateFeedbacks.length + bizConvertedReviews.length})
      </div>
    </>
  );

  return (
    <div className="dashboard-container">
      {/* Background radial gradient layers */}
      <div className="blob-container">
        <div className="blob blob-1" style={{ backgroundColor: activeBiz.primaryColor }}></div>
        <div className="blob blob-2"></div>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileMenuOpen && (
        <div 
          className="sidebar-mobile-backdrop" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 1. DESKTOP & MOBILE SLIDING SIDEBAR NAVIGATION */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="dashboard-brand-section">
          <div className="dashboard-logo-section" style={{ justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <QrCode className="dashboard-logo-icon" style={{ color: activeBiz.primaryColor }} />
              <span className="dashboard-logo-text gradient-text">ReviewFlow</span>
              <span className="dashboard-logo-badge">Pro</span>
            </div>
            {mobileMenuOpen && (
              <button 
                className="mobile-close-btn" 
                onClick={() => setMobileMenuOpen(false)}
                title="Close Navigation"
              >
                <X size={20} />
              </button>
            )}
          </div>
          
          <nav className="sidebar-navigation">
            {renderNavItems()}
          </nav>
        </div>
        
        <div className="sidebar-footer">
          {!isOwnerView && (
            <button className="btn btn-primary" onClick={() => { setShowAddModal(true); setMobileMenuOpen(false); }}>
              <Plus size={16} /> Add Location
            </button>
          )}
          
          {isOwnerView ? (
            <div style={{ padding: "0.5rem 0", borderTop: "1px solid var(--border-light)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Role: <strong style={{ color: "#34d399" }}>Shop Owner</strong>
            </div>
          ) : (
            <div className="tenant-selector-wrapper">
              <span className="tenant-label">Current Account:</span>
              <div className="tenant-select-container">
                <select 
                  value={activeBiz.id} 
                  onChange={(e) => { setActiveBizId(e.target.value); setMobileMenuOpen(false); }}
                  className="tenant-select"
                >
                  {businesses.map((biz) => (
                    <option key={biz.id} value={biz.id}>
                      {biz.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button className="btn btn-secondary" onClick={onLogout} style={{ marginTop: "0.75rem", width: "100%", borderColor: "rgba(244,63,94,0.3)", color: "var(--accent-danger)" }}>
            Logout
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTENT */}
      <div className="dashboard-main-panel">
        
        {/* MOBILE TOP BAR (Only visible < 1024px) */}
        <header className="dashboard-top-navbar">
          <div className="dashboard-logo-section">
            <QrCode className="dashboard-logo-icon" style={{ color: activeBiz.primaryColor }} />
            <span className="dashboard-logo-text gradient-text">ReviewFlow</span>
          </div>

          <button 
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {/* WORKSPACE MAIN BODY */}
        <main className="dashboard-main">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="overview-grid animate-fade-in">
              {/* Metrics cards grid */}
              <div className="metrics-row">
                <div className="metric-card glassmorphism glow-hover">
                  <div className="metric-info">
                    <h3>Total scans</h3>
                    <div className="metric-value">{totalScans}</div>
                    <div className="metric-change positive">
                      <TrendingUp size={12} /> Scan volume active
                    </div>
                  </div>
                  <div className="metric-icon-box primary">
                    <QrCode size={20} />
                  </div>
                </div>

                <div className="metric-card glassmorphism glow-hover">
                  <div className="metric-info">
                    <h3>Reviews Drafted</h3>
                    <div className="metric-value">{totalReviews}</div>
                    <div className="metric-change positive">
                      <Sparkles size={12} /> {conversionRate}% conversion
                    </div>
                  </div>
                  <div className="metric-icon-box secondary">
                    <Sparkles size={20} />
                  </div>
                </div>

                <div className="metric-card glassmorphism glow-hover">
                  <div className="metric-info">
                    <h3>Google CTR</h3>
                    <div className="metric-value">{totalRedirects}</div>
                    <div className="metric-change positive">
                      <CheckCircle2 size={12} /> {googleClickRate}% conversion
                    </div>
                  </div>
                  <div className="metric-icon-box success">
                    <ExternalLink size={20} />
                  </div>
                </div>

                <div className="metric-card glassmorphism glow-hover">
                  <div className="metric-info">
                    <h3>Average Rating</h3>
                    <div className="metric-value">{avgRating} <span style={{ fontSize: "1.2rem", color: "var(--accent-warning)" }}>★</span></div>
                    <div className="metric-change neutral">
                      From {totalVotes} submissions
                    </div>
                  </div>
                  <div className="metric-icon-box warning">
                    <Star size={20} fill="var(--accent-warning)" color="var(--accent-warning)" />
                  </div>
                </div>
              </div>

              {/* Advanced Chart & Star Breakdown */}
              <div className="analytics-charts-row">
                {/* SVG Area Chart */}
                <div className="chart-card glassmorphism">
                  <div className="chart-header">
                    <div>
                      <h2 className="chart-title">Customer Scan Velocity</h2>
                      <p className="chart-subtitle">Scan trends monitored across the past 5 weeks</p>
                    </div>
                    <span className="tenant-label" style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.03)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                      Scan Rate: Live
                    </span>
                  </div>
                  
                  <div className="svg-chart-container">
                    <svg width="100%" height="100%" viewBox="0 0 550 200" preserveAspectRatio="none">
                      <defs>
                        {/* Area Fill Gradient */}
                        <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={activeBiz.primaryColor || "var(--accent-primary)"} stopOpacity="0.4"/>
                          <stop offset="100%" stopColor={activeBiz.primaryColor || "var(--accent-primary)"} stopOpacity="0.0"/>
                        </linearGradient>
                        {/* Line Stroke Gradient */}
                        <linearGradient id="chart-gradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="50%" stopColor={activeBiz.primaryColor || "#6366f1"} />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="50" y1="50" x2="520" y2="50" className="chart-grid-line" />
                      <line x1="50" y1="110" x2="520" y2="110" className="chart-grid-line" />
                      <line x1="50" y1="170" x2="520" y2="170" className="chart-grid-line" />

                      {/* Area Under Path */}
                      <path d={areaPathD} className="chart-path-area" />

                      {/* Line Path */}
                      <path d={linePathD} className="chart-path-line" />

                      {/* Coordinate Dots */}
                      {chartCoordinates.map((coord, idx) => (
                        <g key={idx}>
                          <circle 
                            cx={coord.x} 
                            cy={coord.y} 
                            r="5" 
                            className="chart-dot-active" 
                            style={{ fill: activeBiz.primaryColor }}
                          />
                          <text 
                            x={coord.x} 
                            y={coord.y - 12} 
                            fill="var(--text-primary)" 
                            fontSize="9" 
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {coord.val}
                          </text>
                        </g>
                      ))}

                      {/* X-axis labels */}
                      {chartCoordinates.map((coord, idx) => (
                        <text 
                          key={`lbl-${idx}`} 
                          x={coord.x} 
                          y="192" 
                          fill="var(--text-muted)" 
                          fontSize="9" 
                          fontWeight="700" 
                          textAnchor="middle"
                        >
                          {idx === 4 ? "Current" : `Week ${idx + 1}`}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Rating Distribution Breakdown */}
                <div className="chart-card glassmorphism">
                  <div className="chart-header">
                    <h2 className="chart-title">Rating Breakdown</h2>
                  </div>
                  
                  <div className="rating-breakdown-list">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = ratings[stars] || 0;
                      const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                      return (
                        <div className="rating-row" key={stars}>
                          <div className="rating-star-label">
                            {stars} <Star size={11} fill="var(--accent-warning)" color="var(--accent-warning)" />
                          </div>
                          <div className="rating-progress-bg">
                            <div 
                              className="rating-progress-fill" 
                              style={{ 
                                width: `${percent}%`, 
                                backgroundColor: stars >= 4 ? "var(--accent-success)" : stars === 3 ? "var(--accent-warning)" : "var(--accent-danger)"
                              }}
                            ></div>
                          </div>
                          <div className="rating-count-value">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={{ marginTop: "1.5rem", padding: "0.85rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <ShieldCheck size={16} color="var(--accent-success)" />
                    <span>Low ratings (1-3★) safely directed to Private Feedback.</span>
                  </div>
                </div>
              </div>

              {/* Launcher banner */}
              <div className="glassmorphism" style={{ padding: "1.75rem", borderRadius: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.35rem" }}>Test your Customer Experience Funnel</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Open the review builder to test QR scanning, negative intercepts, and AI uniqueness algorithms.</p>
                </div>
                <button 
                  className="btn btn-primary animate-float" 
                  onClick={() => onLaunchFunnel(activeBiz.id)}
                  style={{ 
                    background: `linear-gradient(135deg, ${activeBiz.primaryColor || '#6366f1'} 0%, #8b5cf6 100%)`,
                    boxShadow: `0 8px 20px rgba(99, 102, 241, 0.2)`
                  }}
                >
                  <Eye size={16} /> Open Review Funnel
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MY BUSINESSES */}
          {activeTab === "businesses" && (
            <div className="animate-fade-in">
              {isOwnerView ? (
                <div>
                  <div className="business-list-header">
                    <div>
                      <h2 style={{ fontSize: "1.65rem", fontWeight: 800 }}>Shop Settings</h2>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Configure your brand details, review links, and manager contact routes.</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
                    {/* Left card: Shop Info Stats */}
                    <div className="business-card glassmorphism" style={{ flex: "1 1 350px", "--biz-color": activeBiz.primaryColor, border: `1.5px solid ${activeBiz.primaryColor || 'var(--accent-primary)'}` }}>
                      <div className="business-card-header">
                        <div>
                          <h3 className="business-card-title">{activeBiz.name}</h3>
                          <span className="business-card-type">{getBizTypeLabel(activeBiz.type)}</span>
                        </div>
                      </div>
                      
                      <div className="business-card-details" style={{ margin: "1.5rem 0" }}>
                        <div className="business-card-detail-item">
                          <QrCode size={16} style={{ color: activeBiz.primaryColor }} />
                          <span style={{ fontSize: "0.95rem" }}>Total QR scans: <strong style={{ color: "white" }}>{activeBiz.analytics.scans}</strong></span>
                        </div>
                        <div className="business-card-detail-item">
                          <Sparkles size={16} style={{ color: "var(--accent-secondary)" }} />
                          <span style={{ fontSize: "0.95rem" }}>Generated reviews: <strong style={{ color: "white" }}>{activeBiz.analytics.reviewsGenerated}</strong></span>
                        </div>
                        <div className="business-card-detail-item">
                          <AlertTriangle size={16} style={{ color: "var(--accent-danger)" }} />
                          <span style={{ fontSize: "0.95rem" }}>Private complaints: <strong style={{ color: "white" }}>{bizPrivateFeedbacks.length}</strong></span>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                        <button className="btn btn-primary" onClick={() => onLaunchFunnel(activeBiz.id)} style={{ width: "100%" }}>
                          Test Review Funnel
                        </button>
                      </div>
                    </div>

                    {/* Right card: Config Form */}
                    <div className="glassmorphism" style={{ flex: "2 2 500px", padding: "2rem", borderRadius: "20px", border: "1px solid var(--border-light)" }}>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1.25rem" }}>Update Shop Details</h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        onUpdateBusiness(activeBiz.id, {
                          name: bizName,
                          googleReviewUrl: bizGoogleUrl,
                          whatsappNumber: bizWhatsapp,
                          primaryColor: bizColor
                        });
                        alert("Settings updated successfully!");
                      }} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div className="form-field">
                          <label className="form-label">Shop Name</label>
                          <input 
                            type="text" 
                            required 
                            value={bizName} 
                            onChange={(e) => setBizName(e.target.value)} 
                            className="form-input" 
                            style={{ color: "white", background: "rgba(255,255,255,0.03)", borderColor: "var(--border-light)" }}
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Google Reviews Link</label>
                          <input 
                            type="url" 
                            required 
                            value={bizGoogleUrl} 
                            onChange={(e) => setBizGoogleUrl(e.target.value)} 
                            className="form-input" 
                            style={{ color: "white", background: "rgba(255,255,255,0.03)", borderColor: "var(--border-light)" }}
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Manager WhatsApp Number (with country code)</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="e.g. 919876543210 (no + or spaces)" 
                            value={bizWhatsapp} 
                            onChange={(e) => setBizWhatsapp(e.target.value)} 
                            className="form-input" 
                            style={{ color: "white", background: "rgba(255,255,255,0.03)", borderColor: "var(--border-light)" }}
                          />
                        </div>
                        <div className="form-field">
                          <label className="form-label">Branding Color</label>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <input 
                              type="color" 
                              value={bizColor} 
                              onChange={(e) => setBizColor(e.target.value)} 
                              style={{ width: "42px", height: "42px", padding: 0, border: "none", borderRadius: "8px", cursor: "pointer", background: "none" }}
                            />
                            <input 
                              type="text" 
                              value={bizColor} 
                              onChange={(e) => setBizColor(e.target.value)} 
                              className="form-input" 
                              style={{ color: "white", background: "rgba(255,255,255,0.03)", borderColor: "var(--border-light)" }}
                            />
                          </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
                          Save Changes
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="business-list-header">
                    <div>
                      <h2 style={{ fontSize: "1.65rem", fontWeight: 800 }}>Manage Locations</h2>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Deploy new branches, map custom Google URLs, and customize funnel colors</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                      <Plus size={18} /> Add Business
                    </button>
                  </div>

                  <div className="business-cards-grid">
                    {businesses.map((biz) => {
                      const bizFeedbacks = privateFeedbacks.filter(f => f.businessId === biz.id);
                      const isSelected = activeBiz.id === biz.id;
                      
                      return (
                        <div 
                          key={biz.id} 
                          className="business-card glassmorphism" 
                          style={{ 
                            "--biz-color": biz.primaryColor,
                            border: isSelected ? `1.5px solid ${biz.primaryColor || 'var(--accent-primary)'}` : '1px solid var(--border-light)',
                            boxShadow: isSelected ? `0 0 25px 2px rgba(99, 102, 241, 0.12)` : 'none'
                          }}
                        >
                          <div>
                            <div className="business-card-header">
                              <div>
                                <h3 className="business-card-title">{biz.name}</h3>
                                <span className="business-card-type">{getBizTypeLabel(biz.type)}</span>
                              </div>
                              {isSelected && (
                                <span 
                                  style={{ 
                                    fontSize: "0.65rem", 
                                    fontWeight: 800, 
                                    color: "white", 
                                    background: biz.primaryColor || "var(--accent-primary)",
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "6px"
                                  }}
                                >
                                  ACTIVE
                                </span>
                              )}
                            </div>

                            <div className="business-card-details">
                              <div className="business-card-detail-item">
                                <QrCode size={14} style={{ color: biz.primaryColor }} />
                                <span>Total scans: <strong>{biz.analytics.scans}</strong></span>
                              </div>
                              <div className="business-card-detail-item">
                                <Sparkles size={14} style={{ color: "var(--accent-secondary)" }} />
                                <span>Generated reviews: <strong>{biz.analytics.reviewsGenerated}</strong></span>
                              </div>
                              <div className="business-card-detail-item">
                                <AlertTriangle size={14} style={{ color: "var(--accent-danger)" }} />
                                <span>Private complaints: <strong>{bizFeedbacks.length}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="business-card-actions">
                            <button 
                              className="btn btn-secondary" 
                              onClick={() => {
                                setActiveBizId(biz.id);
                              }}
                              disabled={isSelected}
                              style={{ opacity: isSelected ? 0.4 : 1 }}
                            >
                              Select
                            </button>
                            <button className="btn btn-secondary" onClick={() => openEditModal(biz)}>
                              <Edit2 size={13} /> Edit
                            </button>
                            <button 
                              className="btn btn-danger" 
                              onClick={() => {
                                if (businesses.length <= 1) {
                                  alert("At least one business must remain registered.");
                                  return;
                                }
                                if (confirm(`Delete location: ${biz.name}? This removes all local data.`)) {
                                  onDeleteBusiness(biz.id);
                                }
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QR DESIGN & PRINTS */}
          {activeTab === "qr" && (
            <div className="qr-layout-grid animate-fade-in">
              {/* Controls Column */}
              <div className="qr-control-panel">
                <div className="settings-group">
                  <h3 className="settings-group-title">
                    <QrCode size={18} style={{ color: activeBiz.primaryColor }} /> Visual Branding
                  </h3>
                  
                  <div className="form-field">
                    <label className="form-label">Promotional Layout Template</label>
                    <div className="template-selector-carousel">
                      <div 
                        className={`template-tab ${flyerTemplate === "flyer" ? "active" : ""}`}
                        onClick={() => setFlyerTemplate("flyer")}
                      >
                        📄 Table Tent Flyer
                      </div>
                      <div 
                        className={`template-tab ${flyerTemplate === "tent" ? "active" : ""}`}
                        onClick={() => setFlyerTemplate("tent")}
                      >
                        🛆 Compact Counter Card
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label">QR Code Color</label>
                      <div className="color-picker-row">
                        <input 
                          type="color" 
                          value={qrColorDark} 
                          onChange={(e) => setQrColorDark(e.target.value)} 
                          className="color-preview-input"
                        />
                        <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{qrColorDark}</span>
                      </div>
                    </div>

                    <div className="form-field">
                      <label className="form-label">QR Background</label>
                      <div className="color-picker-row">
                        <input 
                          type="color" 
                          value={qrColorLight} 
                          onChange={(e) => setQrColorLight(e.target.value)} 
                          className="color-preview-input"
                        />
                        <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{qrColorLight}</span>
                      </div>
                    </div>
                  </div>

                  {flyerTemplate === "flyer" && (
                    <div className="form-field">
                      <label className="form-label">Flyer Theme Preset</label>
                      <select 
                        value={flyerTheme} 
                        onChange={(e) => setFlyerTheme(e.target.value)}
                        className="form-select"
                      >
                        <option value="accent">Corporate Soft Gradient</option>
                        <option value="light">Classic Clean White</option>
                        <option value="dark">Sophisticated Slate Dark</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="settings-group">
                  <h3 className="settings-group-title">
                    <Printer size={18} style={{ color: "var(--accent-success)" }} /> Export and Deploy
                  </h3>
                  <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                    Download clean QR code images or output physical table placements containing custom instructions.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <button className="btn btn-primary" onClick={downloadQRCode}>
                      <Download size={18} /> Download QR Code PNG
                    </button>
                    <button className="btn btn-secondary" onClick={triggerPrint}>
                      <Download size={18} /> Download Printable Card (PNG)
                    </button>
                  </div>
                </div>
              </div>

              {/* Canvas Preview Column */}
              <div className="qr-preview-panel">
                <h3 style={{ fontSize: "1.1rem", alignSelf: "flex-start", fontWeight: 800 }}>Printable Preview</h3>
                
                {/* Hidden generation canvas */}
                <div style={{ display: "none" }}>
                  <canvas ref={canvasRef} />
                </div>

                <div id="print-area">
                  {flyerTemplate === "flyer" ? (
                    <div className={`flyer-canvas-wrapper theme-${flyerTheme}`}>
                      <div className="flyer-header">
                        <span className="flyer-logo">⭐</span>
                        <h1 className="flyer-headline" style={{ color: flyerTheme === "dark" ? "#ffffff" : (activeBiz.primaryColor || "#000000") }}>
                          {activeBiz.name}
                        </h1>
                        <p className="flyer-subheadline">
                          How did we do today? Your feedback helps us improve!
                        </p>
                      </div>

                      <div className="flyer-qr-container">
                        <canvas 
                          id="flyer-qr" 
                          ref={(el) => {
                            if (el && canvasRef.current) {
                              const ctx = el.getContext("2d");
                              if (ctx) {
                                ctx.clearRect(0, 0, el.width, el.height);
                                ctx.drawImage(canvasRef.current, 0, 0, el.width, el.height);
                              }
                            }
                          }}
                          width={130}
                          height={130}
                        />
                      </div>

                      <div className="flyer-footer">
                        <div className="flyer-stars">
                          <span className="flyer-star">★</span>
                          <span className="flyer-star">★</span>
                          <span className="flyer-star">★</span>
                          <span className="flyer-star">★</span>
                          <span className="flyer-star">★</span>
                        </div>
                        <p className="flyer-instruction" style={{ color: flyerTheme === "dark" ? "#ffffff" : "#0f172a" }}>
                          Scan QR Code to rate your experience and generate a review.
                        </p>
                        <p style={{ fontSize: "0.65rem", color: flyerTheme === "dark" ? "#475569" : "#718096", fontWeight: 600 }}>
                          Powered by ReviewFlow AI &bull; Secure Feedback Funnel
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="tent-card-wrapper" style={{ "--biz-color": activeBiz.primaryColor }}>
                      <span className="tent-badge" style={{ backgroundColor: activeBiz.primaryColor }}>
                        {getBizTypeLabel(activeBiz.type)}
                      </span>
                      <h2 className="tent-headline">
                        {activeBiz.name}
                      </h2>
                      
                      <div className="flyer-qr-container" style={{ width: "140px", height: "140px" }}>
                        <canvas 
                          id="tent-qr" 
                          ref={(el) => {
                            if (el && canvasRef.current) {
                              const ctx = el.getContext("2d");
                              if (ctx) {
                                ctx.clearRect(0, 0, el.width, el.height);
                                ctx.drawImage(canvasRef.current, 0, 0, el.width, el.height);
                              }
                            }
                          }}
                          width={120}
                          height={120}
                        />
                      </div>
                      
                      <p style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 700 }}>
                        Scan QR &middot; Share your experience &middot; Support us!
                      </p>
                    </div>
                  )}
                </div>

                <div className="glassmorphism" style={{ padding: "1.15rem", borderRadius: "14px", width: "100%", maxWidth: "360px", fontSize: "0.775rem", color: "var(--text-muted)", display: "flex", gap: "0.65rem", alignItems: "center" }}>
                  <Printer size={32} style={{ flexShrink: 0, color: activeBiz.primaryColor || "var(--accent-primary)" }} />
                  <p>
                    <strong>Print Optimization:</strong> Press Print. In options, make sure to <strong>enable Background Graphics</strong> to keep backgrounds and custom colors intact.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FEEDBACK CONSOLE */}
          {activeTab === "feedback" && (
            <div className="animate-fade-in">
              {/* Feedback Console Controls */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.65rem", fontWeight: 800, marginBottom: "0.35rem" }}>Feedback Console</h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                  Search, filter, and manage all customer feedback. Update resolution status in real-time.
                </p>

                {/* Search Bar */}
                <div style={{ position: "relative", marginBottom: "1rem" }}>
                  <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                  <input
                    type="text"
                    placeholder="Search by name, email, comment, or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: "2.5rem", color: "white", background: "rgba(255,255,255,0.03)", borderColor: "var(--border-light)", width: "100%", maxWidth: "520px" }}
                  />
                </div>

                {/* Filter Pills Row */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginRight: "0.25rem" }}>Rating:</span>
                  {["all", "5", "4", "3", "2", "1"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setRatingFilter(val)}
                      style={{
                        padding: "0.3rem 0.7rem",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        borderRadius: "20px",
                        border: ratingFilter === val ? "1.5px solid var(--accent-primary)" : "1px solid var(--border-light)",
                        background: ratingFilter === val ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)",
                        color: ratingFilter === val ? "var(--accent-primary)" : "var(--text-muted)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {val === "all" ? "All" : `${val}★`}
                    </button>
                  ))}

                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginLeft: "1rem", marginRight: "0.25rem" }}>Status:</span>
                  {["all", "pending", "contacted", "resolved"].map((val) => {
                    const statusColors = { all: "var(--accent-primary)", pending: "#f59e0b", contacted: "#3b82f6", resolved: "#22c55e" };
                    return (
                      <button
                        key={val}
                        onClick={() => setStatusFilter(val)}
                        style={{
                          padding: "0.3rem 0.7rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          borderRadius: "20px",
                          border: statusFilter === val ? `1.5px solid ${statusColors[val]}` : "1px solid var(--border-light)",
                          background: statusFilter === val ? `${statusColors[val]}22` : "rgba(255,255,255,0.02)",
                          color: statusFilter === val ? statusColors[val] : "var(--text-muted)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          textTransform: "capitalize"
                        }}
                      >
                        {val === "all" ? "All" : val}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="feedback-tabs">
                <button 
                  className={`feedback-tab-btn ${feedbackFilter === "public" ? "active" : ""}`}
                  onClick={() => setFeedbackFilter("public")}
                >
                  ✅ Public Google Redirects ({bizConvertedReviews.length})
                </button>
                <button 
                  className={`feedback-tab-btn ${feedbackFilter === "private" ? "active" : ""}`}
                  onClick={() => setFeedbackFilter("private")}
                >
                  🔒 Private Interceptions ({bizPrivateFeedbacks.length})
                </button>
              </div>

              {feedbackFilter === "public" ? (
                <div className="feedback-log-list">
                  {bizConvertedReviews.length === 0 ? (
                    <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                      <CheckCircle2 size={36} style={{ margin: "0 auto 1.25rem", color: "var(--text-subtle)" }} />
                      <p>No positive reviews match your filters.</p>
                      <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>When customer clicks "Copy & Continue" in funnel, details populate here.</p>
                    </div>
                  ) : (
                    bizConvertedReviews.map((rev) => (
                      <div className="feedback-log-card glassmorphism" key={rev.id}>
                        <div className="feedback-card-header">
                          <div className="feedback-customer-meta">
                            <div className="customer-avatar-placeholder" style={{ background: `linear-gradient(135deg, ${activeBiz.primaryColor || '#6366f1'} 0%, #8b5cf6 100%)` }}>
                              C
                            </div>
                            <div>
                              <div className="feedback-stars-display">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`feedback-star-tiny ${i < rev.rating ? "" : "empty"}`} 
                                  />
                                ))}
                              </div>
                              <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Anonymous Customer</span>
                            </div>
                          </div>
                          <span className="feedback-date">{rev.date}</span>
                        </div>

                        {rev.tags && rev.tags.length > 0 && (
                          <div className="feedback-tags-row">
                            {rev.tags.map((t, idx) => (
                              <span className="feedback-tag-badge" key={idx}>{t}</span>
                            ))}
                          </div>
                        )}

                        <div className="feedback-text-content">
                          "{rev.reviewText}"
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--accent-success)", fontWeight: 600 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Check size={14} /> AI Review Copied to Clipboard
                          </span>
                          <span style={{ color: "var(--text-muted)" }}>
                            Opened Google Business Review Link
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="feedback-log-list">
                  {bizPrivateFeedbacks.length === 0 ? (
                    <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                      <ShieldCheck size={36} style={{ margin: "0 auto 1.25rem", color: "var(--text-subtle)" }} />
                      <p>No private complaints match your filters.</p>
                      <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>Low ratings (1-3★) are intercepted here to protect your online reputation.</p>
                    </div>
                  ) : (
                    bizPrivateFeedbacks.map((fb) => (
                      <div className="feedback-log-card glassmorphism" key={fb.id}>
                        <div className="feedback-card-header">
                          <div className="feedback-customer-meta">
                            <div 
                              className="customer-avatar-placeholder" 
                              style={{ background: "linear-gradient(135deg, var(--accent-danger) 0%, #f43f5e 100%)" }}
                            >
                              {fb.name ? fb.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <div className="feedback-stars-display">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`feedback-star-tiny ${i < fb.rating ? "" : "empty"}`} 
                                    color={i < fb.rating ? "var(--accent-danger)" : "rgba(255,255,255,0.08)"}
                                    fill={i < fb.rating ? "var(--accent-danger)" : "none"}
                                  />
                                ))}
                              </div>
                              <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>{fb.name || "Anonymous Customer"}</span>
                              {fb.contact && (
                                <span style={{ fontSize: "0.65rem", fontWeight: 800, marginLeft: "0.5rem", color: "#fef08a", border: "1px solid rgba(254, 240, 138, 0.2)", padding: "0.1rem 0.4rem", borderRadius: "4px", background: "rgba(254,240,138,0.05)" }}>
                                  ⚠️ Action Required: Contact requested
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="feedback-date">{fb.date}</span>
                        </div>

                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "-0.5rem", paddingLeft: "3.25rem" }}>
                          {fb.email && <span style={{ marginRight: "1rem" }}><Mail size={12} style={{ verticalAlign: "middle", marginRight: "4px" }} /> {fb.email}</span>}
                        </div>

                        {fb.tags && fb.tags.length > 0 && (
                          <div className="feedback-tags-row" style={{ paddingLeft: "3.25rem" }}>
                            {fb.tags.map((t, idx) => (
                              <span 
                                className="feedback-tag-badge" 
                                style={{ border: "1px solid rgba(244, 63, 94, 0.2)", color: "#fca5a5", background: "rgba(244,63,94,0.03)" }} 
                                key={idx}
                              >
                                ⚠️ {t}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="feedback-text-content private" style={{ marginLeft: "3.25rem" }}>
                          "{fb.comment || "Customer did not provide written comments."}"
                        </div>

                        {/* Interactive Status Row with Dropdown */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", paddingLeft: "3.25rem", marginTop: "0.5rem", gap: "1rem", flexWrap: "wrap" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 600, color: "#fda4af" }}>
                            <ShieldAlert size={14} /> Intercepted privately &bull; Not posted on Google Reviews
                          </span>
                          
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            {/* Resolution Status Dropdown */}
                            <select
                              value={fb.status || "pending"}
                              onChange={(e) => onUpdateFeedbackStatus && onUpdateFeedbackStatus(fb.id, e.target.value)}
                              style={{
                                padding: "0.35rem 0.65rem",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                borderRadius: "8px",
                                border: `1.5px solid ${(fb.status || "pending") === "resolved" ? "#22c55e" : (fb.status || "pending") === "contacted" ? "#3b82f6" : "#f59e0b"}`,
                                background: `${(fb.status || "pending") === "resolved" ? "rgba(34,197,94,0.1)" : (fb.status || "pending") === "contacted" ? "rgba(59,130,246,0.1)" : "rgba(245,158,11,0.1)"}`,
                                color: (fb.status || "pending") === "resolved" ? "#22c55e" : (fb.status || "pending") === "contacted" ? "#3b82f6" : "#f59e0b",
                                cursor: "pointer",
                                appearance: "auto",
                                textTransform: "capitalize"
                              }}
                            >
                              <option value="pending">⏳ Pending</option>
                              <option value="contacted">📞 Contacted</option>
                              <option value="resolved">✅ Resolved</option>
                            </select>

                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                              onClick={() => alert(`Simulated reply sent to ${fb.email || 'customer'}!`)}
                            >
                              Reply &amp; Resolve
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* RENDER MODAL: CREATE BUSINESS */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <form className="modal-content" onClick={(e) => e.stopPropagation()} onSubmit={handleAddSubmit}>
            <div className="modal-header">
              <h3 className="modal-title">Register New Business</h3>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="form-field">
              <label className="form-label">Business Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Bella Pasta Restaurant"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Business Category</label>
              <select 
                value={bizType}
                onChange={(e) => setBizType(e.target.value)}
                className="form-select"
              >
                {BUSINESS_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Google Business Profile Review Link</label>
              <input 
                type="url" 
                required 
                placeholder="https://search.google.com/local/writereview?placeid=..."
                value={bizGoogleUrl}
                onChange={(e) => setBizGoogleUrl(e.target.value)}
                className="form-input"
              />
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                Tip: Paste your Google "Write a review" link. Customers will redirect here.
              </span>
            </div>

            <div className="form-field">
              <label className="form-label">WhatsApp Contact Number</label>
              <input 
                type="text" 
                placeholder="Include country code, e.g. 919876543210 (no + or spaces)"
                value={bizWhatsapp}
                onChange={(e) => setBizWhatsapp(e.target.value)}
                className="form-input"
              />
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                Negative reviews (1-2★) will redirect clients to this WhatsApp number prefilled with their AI complaint summary.
              </span>
            </div>

            <div className="form-field">
              <label className="form-label">Primary Brand Color</label>
              <div className="color-picker-row">
                <input 
                  type="color" 
                  value={bizColor} 
                  onChange={(e) => setBizColor(e.target.value)} 
                  className="color-preview-input"
                />
                <span>{bizColor}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Business</button>
            </div>
          </form>
        </div>
      )}

      {/* RENDER MODAL: EDIT BUSINESS */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <form className="modal-content" onClick={(e) => e.stopPropagation()} onSubmit={handleEditSubmit}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Business Profile</h3>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setShowEditModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="form-field">
              <label className="form-label">Business Name</label>
              <input 
                type="text" 
                required 
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Business Category</label>
              <select 
                value={bizType}
                onChange={(e) => setBizType(e.target.value)}
                className="form-select"
              >
                {BUSINESS_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Google Business Profile Review Link</label>
              <input 
                type="url" 
                required 
                value={bizGoogleUrl}
                onChange={(e) => setBizGoogleUrl(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label className="form-label">WhatsApp Contact Number</label>
              <input 
                type="text" 
                placeholder="Include country code, e.g. 919876543210 (no + or spaces)"
                value={bizWhatsapp}
                onChange={(e) => setBizWhatsapp(e.target.value)}
                className="form-input"
              />
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                Negative reviews (1-2★) will redirect clients to this WhatsApp number prefilled with their AI complaint summary.
              </span>
            </div>

            <div className="form-field">
              <label className="form-label">Primary Brand Color</label>
              <div className="color-picker-row">
                <input 
                  type="color" 
                  value={bizColor} 
                  onChange={(e) => setBizColor(e.target.value)} 
                  className="color-preview-input"
                />
                <span>{bizColor}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
