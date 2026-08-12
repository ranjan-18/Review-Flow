import React, { useState, useEffect } from "react";
import ReviewFunnel from "./ReviewFunnel";
import { api } from "./api";
import "./App.css";

export default function App() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSimulation, setIsSimulation] = useState(false);

  useEffect(() => {
    const initFunnel = async () => {
      const params = new URLSearchParams(window.location.search);
      const queryBizId = params.get("biz");
      const isSim = params.get("sim") === "true";
      setIsSimulation(isSim);

      if (!queryBizId) {
        setError("Invalid request: No business identifier specified. Please scan a valid location QR code.");
        setLoading(false);
        return;
      }

      try {
        const bizData = await api.getPublicBusiness(queryBizId);
        setBusiness(bizData);
        
        // Log scan analytics on the backend
        if (!isSim) {
          try {
            await api.incrementScan(queryBizId);
          } catch (scanErr) {
            console.error("Scan logging failed", scanErr);
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load business details.");
      } finally {
        setLoading(false);
      }
    };

    initFunnel();
  }, []);

  const handleLogAction = async (type, data) => {
    try {
      if (type === "private_feedback") {
        await api.submitFeedback({
          businessId: data.businessId,
          rating: data.rating,
          tags: data.tags,
          comment: data.comment,
          name: data.name,
          email: data.email,
          contact: data.contact
        });
      } else if (type === "public_conversion") {
        await api.submitConversion({
          businessId: data.businessId,
          rating: data.rating,
          tags: data.tags,
          reviewText: data.reviewText
        });
      }
    } catch (err) {
      console.error("Failed to log customer action on server", err);
    }
  };

  const handleExitSimulation = () => {
    // If simulation, they can exit by redirecting to Google or closing
    window.location.href = "https://google.com";
  };

  if (loading) {
    return (
      <div style={{ display: "flex", width: "100vw", height: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a", color: "white" }}>
        <h3>Loading Customer Review Flow...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a", color: "white", padding: "2rem", textAlign: "center" }}>
        <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>Access Error</h2>
        <p style={{ maxWidth: "450px", color: "#94a3b8", lineHeight: 1.6 }}>{error}</p>
      </div>
    );
  }

  return (
    <ReviewFunnel
      business={business}
      onLogAction={handleLogAction}
      isSimulation={isSimulation}
      onExitSimulation={handleExitSimulation}
    />
  );
}
