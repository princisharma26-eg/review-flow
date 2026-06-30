"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Copy, RefreshCw, ExternalLink, CheckCircle2, Pencil } from "lucide-react";

interface Business {
  id: string;
  name: string;
  googleReviewLink: string;
}

export default function ReviewUI({ business }: { business: Business }) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  // 1-2 Stars state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 3-5 Stars state
  const [aiReview, setAiReview] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleRating = async (val: number) => {
    setRating(val);
    
    // Reset states
    setSubmitted(false);
    setAiReview("");
    setIsEditing(false);
    
    // Always generate review, whether high or low rating
    await generateReview(val);
  };

  const generateReview = async (selectedRating: number) => {
    setIsGenerating(true);
    setAiReview("");
    try {
      const res = await fetch("/api/review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: business.name, rating: selectedRating }),
      });
      const data = await res.json();
      if (data.success) {
        setAiReview(data.review);
      } else {
        alert("Failed to generate review.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while generating the review.");
    } finally {
      setIsGenerating(false);
    }
  };

  const submitFeedback = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          rating,
          aiReview
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert("Failed to submit feedback.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiReview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <div className="bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl border border-white/20 text-center relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <h2 className="text-sm font-semibold tracking-widest text-indigo-500 uppercase mb-2">
            {business.name}
          </h2>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Rate Your Experience</h1>

          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRating(star)}
                className="focus:outline-none transition-colors"
              >
                <Star 
                  className={`w-12 h-12 transition-all duration-200 ${
                    star <= (hoverRating || rating) 
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-md" 
                      : "fill-transparent text-gray-300"
                  }`} 
                />
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Common loading state for AI review generation */}
            {rating > 0 && isGenerating && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 space-y-4"
              >
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 font-medium">Crafting your review...</p>
              </motion.div>
            )}

            {/* High Rating (3-5) Flow */}
            {rating >= 3 && !isGenerating && aiReview && (
              <motion.div
                key="high-rating-flow"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 pt-4"
              >
                <div className="p-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl shadow-indigo-500/10">
                  <div className={`bg-white rounded-xl p-6 text-left relative transition-all ${isEditing ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}`}>
                    <textarea 
                      readOnly={!isEditing}
                      value={aiReview}
                      onChange={(e) => setAiReview(e.target.value)}
                      className="w-full text-gray-700 text-lg leading-relaxed font-medium bg-transparent outline-none resize-none min-h-[120px]"
                      placeholder="Your review will appear here..."
                      autoFocus={isEditing}
                      onBlur={() => setIsEditing(false)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => generateReview(rating)}
                        className="rounded-xl border-gray-200 hover:bg-gray-50 px-2"
                        title="Generate Another"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant={isEditing ? "default" : "outline"}
                        onClick={() => setIsEditing(!isEditing)}
                        className="rounded-xl border-gray-200 hover:bg-gray-50 px-2"
                        title={isEditing ? "Done Editing" : "Edit Review"}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      variant={copied ? "secondary" : "outline"}
                      onClick={copyToClipboard}
                      className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? "Copied!" : "Copy Review"}
                    </Button>
                  </div>
                  <a href={business.googleReviewLink} target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 py-6 text-base"
                    >
                      Post Review on Google
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>
              </motion.div>
            )}

            {/* Low Rating (1-2) Flow */}
            {rating > 0 && rating <= 2 && !isGenerating && aiReview && !submitted && (
              <motion.div
                key="low-rating-flow"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 pt-4"
              >
                <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 mb-4 text-left">
                  <p className="text-red-800 text-sm">We&apos;re sorry to hear that. This feedback will be sent directly to our team so we can improve.</p>
                </div>
                
                <div className="p-1 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl shadow-xl">
                  <div className={`bg-white rounded-xl p-6 text-left relative transition-all ${isEditing ? 'ring-2 ring-gray-400 ring-offset-2' : ''}`}>
                    <textarea 
                      readOnly={!isEditing}
                      value={aiReview}
                      onChange={(e) => setAiReview(e.target.value)}
                      className="w-full text-gray-700 text-lg leading-relaxed font-medium bg-transparent outline-none resize-none min-h-[120px]"
                      placeholder="Your feedback will appear here..."
                      autoFocus={isEditing}
                      onBlur={() => setIsEditing(false)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => generateReview(rating)}
                      className="rounded-xl border-gray-200 hover:bg-gray-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate Another
                    </Button>
                    <Button 
                      variant={isEditing ? "secondary" : "outline"}
                      onClick={() => setIsEditing(!isEditing)}
                      className="rounded-xl border-gray-200 hover:bg-gray-50"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      {isEditing ? 'Done Editing' : 'Edit Review'}
                    </Button>
                  </div>
                  <Button 
                    onClick={submitFeedback}
                    disabled={isSubmitting}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg shadow-gray-900/20 py-6 text-base"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Low Rating Success */}
            {rating > 0 && rating <= 2 && submitted && (
              <motion.div
                key="feedback-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank you for your feedback.</h3>
                <p className="text-gray-500 mb-8">We appreciate you helping us improve.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
