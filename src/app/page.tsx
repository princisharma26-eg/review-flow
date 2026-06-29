"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Download, Link as LinkIcon, ExternalLink } from "lucide-react";

export default function Home() {
  const [businessName, setBusinessName] = useState("");
  const [googleLink, setGoogleLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  const qrRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setReviewUrl(null);

    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: businessName, googleReviewLink: googleLink }),
      });
      const data = await res.json();
      if (data.success && data.business) {
        setReviewUrl(`${origin}/review/${data.business.id}`);
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = (format: "png" | "svg") => {
    if (!qrRef.current) return;
    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);

    if (format === "svg") {
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-code-${businessName.toLowerCase().replace(/\s+/g, "-")}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `qr-code-${businessName.toLowerCase().replace(/\s+/g, "-")}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center"
      >
        <div className="space-y-8 p-6 md:p-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
              ReviewFlow AI
            </h1>
            <p className="text-gray-600 text-lg">
              Generate smart QR codes that capture private feedback and boost public Google Reviews.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20">
            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-gray-700 font-medium">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="e.g. Acme Corp"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="bg-white/80 border-gray-200 focus:border-indigo-500 rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleLink" className="text-gray-700 font-medium">Google Review Link</Label>
                <Input
                  id="googleLink"
                  placeholder="https://g.page/r/..."
                  type="url"
                  value={googleLink}
                  onChange={(e) => setGoogleLink(e.target.value)}
                  required
                  className="bg-white/80 border-gray-200 focus:border-indigo-500 rounded-xl h-12"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isGenerating}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg shadow-gray-900/20 transition-all text-base font-medium"
              >
                {isGenerating ? "Generating..." : "Generate QR"}
              </Button>
            </form>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 md:p-8">
          <AnimatePresence mode="wait">
            {reviewUrl ? (
              <motion.div 
                key="qr-code"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center w-full max-w-sm"
              >
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1 rounded-2xl mb-6 shadow-inner">
                  <div className="bg-white p-4 rounded-xl">
                    <QRCodeSVG
                      value={reviewUrl}
                      size={200}
                      level={"H"}
                      includeMargin={false}
                      ref={qrRef}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <LinkIcon className="w-4 h-4 flex-shrink-0" />
                      <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:underline text-indigo-600 font-medium">
                        {reviewUrl}
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => downloadQR("png")}
                      variant="outline"
                      className="w-full rounded-xl border-gray-200 hover:bg-gray-50 font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PNG
                    </Button>
                    <Button 
                      onClick={() => downloadQR("svg")}
                      variant="outline"
                      className="w-full rounded-xl border-gray-200 hover:bg-gray-50 font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      SVG
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-sm aspect-square rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-white/30 backdrop-blur-sm"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <ExternalLink className="w-8 h-8 text-gray-300" />
                </div>
                <p className="font-medium text-gray-500">Your QR code will appear here</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
