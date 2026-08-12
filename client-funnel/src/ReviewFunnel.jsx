import React, { useState, useEffect } from "react";
import { Star, Sparkles, Copy, ExternalLink, ArrowLeft, Check, ShieldAlert, HeartHandshake, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";
import { BUSINESS_TYPES, DEFAULT_POSITIVE_TAGS, DEFAULT_NEGATIVE_TAGS, generateReviewText } from "./mockData";

export default function ReviewFunnel({ business, onLogAction, isSimulation, onExitSimulation }) {
  const [step, setStep] = useState(1); // 1: Stars, 2: Tags/Details, 3: AI Output (for 4-5★) or Submit Thanks (for 1-3★)
  const [rating, setRating] = useState(0);

  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [customComment, setCustomComment] = useState("");
  const [tone, setTone] = useState("enthusiastic");
  const [generatedReview, setGeneratedReview] = useState("");
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Private complaint details (1-3 stars)
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [requestContact, setRequestContact] = useState(false);

  // Set funnel branding dynamically in document root
  useEffect(() => {
    if (business) {
      document.documentElement.style.setProperty("--funnel-brand", business.primaryColor || "#6366f1");
    }
  }, [business]);

  // Generate review text when step changes to AI screen, or when tags/tone/note changes
  useEffect(() => {
    if (step === 3) {
      const reviewText = generateReviewText(business.name, rating, selectedTags, customComment, tone);
      setGeneratedReview(reviewText);
    }
  }, [rating, selectedTags, customComment, tone, step, business.name]);

  if (!business) {
    return <div className="funnel-container"><h3>Business not found.</h3></div>;
  }

  // Resolve business categories
  const bizCategory = BUSINESS_TYPES.find(t => t.id === business.type);
  const positiveTags = bizCategory ? bizCategory.positiveTags : DEFAULT_POSITIVE_TAGS;
  const negativeTags = bizCategory ? bizCategory.negativeTags : DEFAULT_NEGATIVE_TAGS;

  const handleStarClick = (val) => {
    setRating(val);
    setSelectedTags([]);
    setCustomComment("");
    setStep(2);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Submit private feedback (1-2 stars) and redirect to WhatsApp
  const handlePrivateSubmit = (e) => {
    e.preventDefault();
    
    const feedbackText = generatedReview || customComment;
    
    // Log the private feedback
    onLogAction("private_feedback", {
      businessId: business.id,
      rating,
      tags: selectedTags,
      comment: feedbackText,
      name: "Anonymous",
      email: "Not provided",
      contact: false,
      date: new Date().toISOString().split('T')[0]
    });

    // Prefill and open WhatsApp message
    const starsText = "⭐".repeat(rating);
    const waMessage = `*New Customer Feedback for ${business.name}*\n\n*Rating:* ${starsText}\n*Details:* ${feedbackText || 'No specific details provided'}`;
    const encodedText = encodeURIComponent(waMessage);
    const waNumber = business.whatsappNumber || "919876543210";
    const waUrl = `https://wa.me/${waNumber}?text=${encodedText}`;

    // Open WhatsApp in a new tab synchronously (popup blocker safe!)
    window.open(waUrl, "_blank", "noopener,noreferrer");

    setStep(4); // Go to apology thank you screen
  };

  const handleProceedToAI = () => {
    setStep(3);
  };

  // Fallback Clipboard Copier for non-HTTPS local IP mobile testing
  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
        document.body.removeChild(textarea);
        return Promise.resolve();
      } catch (err) {
        document.body.removeChild(textarea);
        return Promise.reject(err);
      }
    }
  };

  // Copy AI review and open Google Maps review page
  const handleCopyAndRedirect = () => {
    copyToClipboard(generatedReview)
      .then(() => {
        setCopied(true);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
    
    // Confetti celebration
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    // Log the review generation conversion
    onLogAction("public_conversion", {
      businessId: business.id,
      rating,
      tags: selectedTags,
      reviewText: generatedReview,
      date: new Date().toISOString().split('T')[0]
    });

    // Synchronous redirection to bypass Safari & mobile popup blockers
    window.open(business.googleReviewUrl, "_blank", "noopener,noreferrer");
  };

  // Get human-friendly feedback phrase based on star hover/selection
  const getRatingPhrase = (stars) => {
    switch (stars) {
      case 5: return "Loved it! Excellent experience! 😍";
      case 4: return "Good! Really liked it! 😊";
      case 3: return "Okay! Average experience. 😐";
      case 2: return "Disappointed! Could be better. 😞";
      case 1: return "Terrible! Had a bad time. 😡";
      default: return "";
    }
  };

  return (
    <div className="funnel-page-wrapper" style={{ position: "relative", minHeight: "100vh", width: "100%" }}>
      {/* Background blobs for premium depth styling */}
      <div className="blob-funnel-light">
        <div className="blob blob-1" style={{ filter: "blur(120px)", opacity: 0.25, backgroundColor: business.primaryColor }}></div>
        <div className="blob blob-2" style={{ filter: "blur(120px)", opacity: 0.2 }}></div>
      </div>

      <div className="funnel-container">
        {/* Simulation banner indicating you are testing */}
        {isSimulation && (
          <div className="funnel-simulation-banner" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10 }}>
            <span>Simulation Mode: Testing <strong>{business.name}</strong> customer funnel.</span>
            <button className="simulation-exit-btn" onClick={onExitSimulation}>
              Exit Demo
            </button>
          </div>
        )}

        {/* Main Review Card */}
        <div className="funnel-card" style={{ marginTop: isSimulation ? "3rem" : "0" }}>
          
          {/* Step 1: EXPERIENCE RATING */}
          {step === 1 && (
            <div className="funnel-step animate-fade-in">
              <div className="funnel-logo-container">
                <div className="funnel-biz-logo" style={{ backgroundColor: business.primaryColor }}>
                  {business.name.charAt(0)}
                </div>
                <h2 className="funnel-biz-name">{business.name}</h2>
                <span className="funnel-biz-subtitle">{bizCategory?.label || "Local Business"}</span>
              </div>

              <h3 className="funnel-step-title">How was your experience today?</h3>
              
              <div className="stars-widget">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className="stars-widget-button"
                    onClick={() => handleStarClick(val)}
                    onMouseEnter={() => setHoverRating(val)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star 
                      className={`funnel-star-icon ${val <= (hoverRating || rating) ? "filled" : ""}`}
                    />
                  </button>
                ))}
              </div>
              
              <div style={{ height: "24px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--funnel-brand)" }}>
                  {getRatingPhrase(hoverRating || rating) || "Tap a star rating to begin"}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: RATING DETAILS (3-5 Stars) */}
          {step === 2 && rating >= 3 && (
            <div className="funnel-step animate-fade-in">
              <button className="regenerate-text-btn" onClick={() => setStep(1)} style={{ alignSelf: "flex-start", padding: 0 }}>
                <ArrowLeft className="funnel-back-arrow" /> Back to rating
              </button>

              <h3 className="funnel-step-title">What did you like about us?</h3>

              <div className="tags-selection-grid">
                {positiveTags.map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`funnel-tag-pill ${isActive ? "active" : ""}`}
                      onClick={() => handleTagToggle(tag)}
                      style={{
                        backgroundColor: isActive ? business.primaryColor : "transparent",
                        borderColor: isActive ? business.primaryColor : "#cbd5e1"
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <div className="notes-input-wrapper">
                <label className="form-label" style={{ color: "var(--funnel-text)" }}>Any specific details to add? (Optional)</label>
                <textarea
                  placeholder="e.g. Host was very polite, or the atmosphere was excellent..."
                  value={customComment}
                  onChange={(e) => setCustomComment(e.target.value)}
                  className="funnel-textarea"
                  maxLength={200}
                />
              </div>

              <button 
                className="funnel-btn funnel-btn-primary" 
                onClick={handleProceedToAI}
                style={{ background: `linear-gradient(135deg, ${business.primaryColor || '#6366f1'} 0%, #8b5cf6 100%)` }}
              >
                <Sparkles size={16} /> Generate AI Review
              </button>
            </div>
          )}

          {/* Step 2: CONSTRUCTIVE PRIVATE FEEDBACK (1-2 Stars) */}
          {step === 2 && rating <= 2 && (
            <div className="funnel-step animate-fade-in">
              <button type="button" className="regenerate-text-btn" onClick={() => setStep(1)} style={{ alignSelf: "flex-start", padding: 0 }}>
                <ArrowLeft className="funnel-back-arrow" /> Back to rating
              </button>

              <div className="safe-landing-header">
                <ShieldAlert className="safe-landing-icon" />
                <h3 className="funnel-step-title" style={{ color: "var(--accent-danger)" }}>Help us make it right</h3>
                <p className="safe-landing-message">
                  We're sorry you had a less-than-perfect experience. Your feedback goes directly to management, not publicly.
                </p>
              </div>

              <div className="tags-selection-grid">
                {negativeTags.map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`funnel-tag-pill ${isActive ? "active" : ""}`}
                      style={{ 
                        borderColor: isActive ? "var(--accent-danger)" : "#cbd5e1",
                        backgroundColor: isActive ? "rgba(244, 63, 94, 0.1)" : "transparent",
                        color: isActive ? "var(--accent-danger)" : "var(--funnel-text)"
                      }}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <div className="notes-input-wrapper">
                <label className="form-label" style={{ color: "var(--funnel-text)" }}>Please describe your experience in detail (Optional)</label>
                <textarea
                  placeholder="What happened? This helps us resolve the issue for you."
                  value={customComment}
                  onChange={(e) => setCustomComment(e.target.value)}
                  className="funnel-textarea"
                />
              </div>

              <button 
                type="button"
                className="funnel-btn funnel-btn-primary" 
                onClick={handleProceedToAI}
                style={{ background: "linear-gradient(135deg, var(--accent-danger) 0%, #dc2626 100%)" }}
              >
                <Sparkles size={16} /> Generate AI Feedback
              </button>
            </div>
          )}

          {/* Step 3: AI OUTPUT & FINALIZE (3-5 Stars) */}
          {step === 3 && rating >= 3 && (
            <div className="funnel-step animate-fade-in">
              {showToast && (
                <div className="copy-toast" style={{ transform: "translate(-50%, -8px)" }}>
                  <Check className="copy-toast-success-icon" /> AI review copied! Opening Google...
                </div>
              )}

              <button className="regenerate-text-btn" onClick={() => setStep(2)} style={{ alignSelf: "flex-start", padding: 0 }}>
                <ArrowLeft className="funnel-back-arrow" /> Edit tags
              </button>

              <h3 className="funnel-step-title">Your AI-generated Review</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--funnel-text-muted)", marginTop: "-1rem", textAlign: "center", fontWeight: 500 }}>
                Feel free to tweak it before submitting!
              </p>

              <div className="ai-generator-panel">
                {/* Tone selector */}
                <div className="tone-selector-tabs">
                  <button 
                    className={`tone-tab-btn ${tone === "enthusiastic" ? "active" : ""}`}
                    onClick={() => setTone("enthusiastic")}
                  >
                    🎉 Enthusiastic
                  </button>
                  <button 
                    className={`tone-tab-btn ${tone === "professional" ? "active" : ""}`}
                    onClick={() => setTone("professional")}
                  >
                    💼 Professional
                  </button>
                  <button 
                    className={`tone-tab-btn ${tone === "short" ? "active" : ""}`}
                    onClick={() => setTone("short")}
                  >
                    ⚡ Concise
                  </button>
                </div>

                {/* Review Text Box Editor */}
                <div className="review-editor-box">
                  <textarea
                    value={generatedReview}
                    onChange={(e) => setGeneratedReview(e.target.value)}
                    className="review-editor-textarea"
                  />
                  <span className="ai-badge-overlay" style={{ background: `linear-gradient(135deg, ${business.primaryColor || '#6366f1'} 0%, #8b5cf6 100%)` }}>
                    <Sparkles className="ai-badge-icon" /> AI Suggested
                  </span>
                </div>

                {/* Re-generate trigger */}
                <button 
                  type="button" 
                  className="regenerate-text-btn"
                  onClick={() => {
                    const anotherReview = generateReviewText(business.name, rating, selectedTags, customComment, tone);
                    setGeneratedReview(anotherReview);
                  }}
                  style={{ color: business.primaryColor }}
                >
                  <Sparkles size={12} /> Make review completely unique again
                </button>
              </div>



              <button 
                className="funnel-btn funnel-btn-primary" 
                onClick={handleCopyAndRedirect}
                style={{ background: `linear-gradient(135deg, ${business.primaryColor || '#6366f1'} 0%, #8b5cf6 100%)` }}
              >
                <Copy size={16} /> Copy &amp; Continue to Google
              </button>
            </div>
          )}

          {/* Step 3: AI OUTPUT & FINALIZE (1-2 Stars) */}
          {step === 3 && rating <= 2 && (
            <form className="funnel-step animate-fade-in" onSubmit={handlePrivateSubmit}>
              <button type="button" className="regenerate-text-btn" onClick={() => setStep(2)} style={{ alignSelf: "flex-start", padding: 0 }}>
                <ArrowLeft className="funnel-back-arrow" /> Edit tags
              </button>

              <h3 className="funnel-step-title" style={{ color: "var(--accent-danger)" }}>Your AI-generated Feedback</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--funnel-text-muted)", marginTop: "-1rem", textAlign: "center", fontWeight: 500 }}>
                We've drafted a constructive summary. You can refine it before sending it privately to management.
              </p>

              <div className="ai-generator-panel">
                {/* Tone selector */}
                <div className="tone-selector-tabs">
                  <button 
                    type="button"
                    className={`tone-tab-btn ${tone === "enthusiastic" ? "active" : ""}`}
                    onClick={() => setTone("enthusiastic")}
                  >
                    😞 Constructive
                  </button>
                  <button 
                    type="button"
                    className={`tone-tab-btn ${tone === "professional" ? "active" : ""}`}
                    onClick={() => setTone("professional")}
                  >
                    💼 Professional
                  </button>
                  <button 
                    type="button"
                    className={`tone-tab-btn ${tone === "short" ? "active" : ""}`}
                    onClick={() => setTone("short")}
                  >
                    ⚡ Concise
                  </button>
                </div>

                {/* Review Text Box Editor */}
                <div className="review-editor-box">
                  <textarea
                    value={generatedReview}
                    onChange={(e) => setGeneratedReview(e.target.value)}
                    className="review-editor-textarea"
                  />
                  <span className="ai-badge-overlay" style={{ background: "linear-gradient(135deg, var(--accent-danger) 0%, #dc2626 100%)" }}>
                    <Sparkles className="ai-badge-icon" /> AI Suggested
                  </span>
                </div>
              </div>

              <button 
                type="submit"
                className="funnel-btn funnel-btn-primary" 
                style={{ background: "linear-gradient(135deg, var(--accent-danger) 0%, #dc2626 100%)" }}
              >
                Submit Private Feedback
              </button>
            </form>
          )}

          {/* Step 4: APOLOGY & THANK YOU SCREEN (1-2 Stars) */}
          {step === 4 && rating <= 2 && (
            <div className="funnel-step animate-fade-in" style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <HeartHandshake size={56} style={{ color: "var(--accent-success)", margin: "0 auto" }} />
              
              <h3 className="funnel-step-title" style={{ marginTop: "1rem" }}>Feedback Submitted</h3>
              
              <p className="safe-landing-message" style={{ margin: "1rem 0 1.5rem" }}>
                Thank you for sharing your experience. We are sorry it did not meet your expectations. Your comments have been forwarded privately to the ownership team for immediate review.
              </p>

              <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid #cbd5e1", padding: "1rem", borderRadius: "12px", fontSize: "0.8rem", color: "var(--funnel-text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck size={18} style={{ color: "var(--accent-success)", flexShrink: 0 }} />
                <span style={{ textAlign: "left", fontWeight: 500 }}>
                  <strong>Compliance Protection:</strong> This feedback was collected privately and is not posted on Google Reviews.
                </span>
              </div>

              <button 
                type="button" 
                className="funnel-btn funnel-btn-secondary"
                onClick={() => {
                  setStep(1);
                  setRating(0);
                  setSelectedTags([]);
                  setCustomComment("");
                  setClientName("");
                  setClientEmail("");
                  setRequestContact(false);
                  setGeneratedReview("");
                }}
                style={{ marginTop: "1rem" }}
              >
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
