import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import Login from "./Login";
import { api } from "./api";
import "./App.css";

export default function App() {
  const [businesses, setBusinesses] = useState([]);
  const [activeBizId, setActiveBizId] = useState("");
  const [appMode, setAppMode] = useState("admin");
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking
  const [loading, setLoading] = useState(true);

  const [privateFeedbacks, setPrivateFeedbacks] = useState([]);
  const [convertedReviews, setConvertedReviews] = useState([]);

  useEffect(() => {
    verifyAuth();
  }, []);

  // Poll server for incoming feedbacks, conversions, and scan analytics every 10 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const pollInterval = setInterval(async () => {
      try {
        const feedbacks = await api.getFeedbacks();
        setPrivateFeedbacks(feedbacks);

        const conversions = await api.getConversions();
        setConvertedReviews(conversions);
        
        const bizList = await api.getBusinesses();
        setBusinesses(bizList);
      } catch (err) {
        console.error("Dashboard polling error", err);
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [isAuthenticated]);

  const verifyAuth = async () => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!savedToken) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const me = await api.getMe();
      if (me?.success) {
        setIsAuthenticated(true);
        // Fetch dashboard resources
        const bizList = await api.getBusinesses();
        setBusinesses(bizList || []);
        
        const feedbacks = await api.getFeedbacks();
        setPrivateFeedbacks(feedbacks || []);

        const conversions = await api.getConversions();
        setConvertedReviews(conversions || []);

        if (bizList && bizList.length > 0) {
          setActiveBizId(prev => prev || bizList[0].id);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (user) => {
    setIsAuthenticated(true);
    setLoading(true);
    try {
      const bizList = await api.getBusinesses();
      setBusinesses(bizList);
      
      const feedbacks = await api.getFeedbacks();
      setPrivateFeedbacks(feedbacks);

      const conversions = await api.getConversions();
      setConvertedReviews(conversions);

      if (bizList.length > 0) {
        setActiveBizId(bizList[0].id);
      }
    } catch (err) {
      console.error("Failed to load dashboard resources", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignored
    }
    setIsAuthenticated(false);
    setBusinesses([]);
    setPrivateFeedbacks([]);
    setConvertedReviews([]);
  };

  const handleSelectActiveBiz = (id) => {
    setActiveBizId(id);
  };

  const handleAddBusiness = async (newBizData) => {
    try {
      const newBiz = await api.createBusiness(newBizData);
      setBusinesses(prev => [...prev, newBiz]);
      setActiveBizId(newBiz.id);
    } catch (err) {
      alert("Failed to create location: " + err.message);
    }
  };

  const handleUpdateBusiness = async (id, updatedData) => {
    try {
      const updated = await api.updateBusiness(id, updatedData);
      setBusinesses(prev => prev.map(b => b.id === id ? updated : b));
    } catch (err) {
      alert("Failed to update location details: " + err.message);
    }
  };

  const handleDeleteBusiness = async (id) => {
    if (!window.confirm("Are you sure you want to delete this branch location? All QR and analytics data will be lost.")) {
      return;
    }
    try {
      await api.deleteBusiness(id);
      const updatedList = businesses.filter(b => b.id !== id);
      setBusinesses(updatedList);
      if (activeBizId === id && updatedList.length > 0) {
        setActiveBizId(updatedList[0].id);
      }
    } catch (err) {
      alert("Failed to delete branch location: " + err.message);
    }
  };

  // Launch customer funnel in a new tab pointing to Port 5173
  const handleLaunchFunnel = (id) => {
    const funnelUrlBase = window.location.port === "5174" 
      ? `${window.location.protocol}//${window.location.hostname}:5173` 
      : window.location.origin;
    const funnelUrl = `${funnelUrlBase}?biz=${id}&sim=true`;
    window.open(funnelUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", width: "100vw", height: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a", color: "white" }}>
        <h3>Loading Admin Portal...</h3>
      </div>
    );
  }

  const activeBiz = businesses.find(b => b.id === activeBizId);

  const handleUpdateFeedbackStatus = async (id, status) => {
    try {
      const updated = await api.updateFeedbackStatus(id, status);
      setPrivateFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: updated.status } : f));
    } catch (err) {
      alert("Failed to update feedback status: " + err.message);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <Dashboard
          businesses={businesses}
          activeBiz={activeBiz}
          setActiveBizId={handleSelectActiveBiz}
          onAddBusiness={handleAddBusiness}
          onUpdateBusiness={handleUpdateBusiness}
          onDeleteBusiness={handleDeleteBusiness}
          onLaunchFunnel={handleLaunchFunnel}
          onLogout={handleLogout}
          privateFeedbacks={privateFeedbacks}
          convertedReviews={convertedReviews}
          onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
        />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
