"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Trash2, Search, Lock } from "lucide-react";

interface FeedbackItem {
  id: string;
  rating: number;
  aiReview: string;
  createdAt: string;
  business: {
    name: string;
  };
}

export default function FeedbackPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin") {
      setIsAuthenticated(true);
      fetchFeedbacks();
    } else {
      alert("Incorrect password");
    }
  };

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/feedback/list");
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks);
      }
    } catch (error) {
      console.error("Failed to fetch feedbacks", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      const res = await fetch(`/api/feedback?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFeedbacks(feedbacks.filter(f => f.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete feedback", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Protected Area</h1>
          <p className="text-gray-500 mb-6">Enter password to view feedback</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="password" 
              placeholder="Password (admin)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
            />
            <Button type="submit" className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
              Access Feedback
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const filteredFeedbacks = feedbacks.filter(f => 
    f.business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.aiReview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Private Feedback</h1>
            <p className="text-gray-500 mt-1">Review feedback captured from 1-2 star ratings.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              placeholder="Search by business or text..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white rounded-xl border-gray-200"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading feedback...</div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-lg">No feedback found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeedbacks.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.business.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteFeedback(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete feedback"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                  <p className="text-gray-700 text-sm">&quot;{item.aiReview}&quot;</p>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
