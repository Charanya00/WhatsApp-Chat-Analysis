import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useUploadChat } from "@/hooks/use-chat";
import { useLocation } from "wouter";

export function UploadSection() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const uploadMutation = useUploadChat();
  const [, setLocation] = useLocation();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.txt')) {
        setFile(droppedFile);
      } else {
        // Simple alert for now, could use toast
        alert("Please upload a .txt file exported from WhatsApp.");
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       const selectedFile = e.target.files[0];
       if (selectedFile.name.endsWith('.txt')) {
         setFile(selectedFile);
       }
    }
  };

  const handleUpload = () => {
    if (!file) return;
    
    uploadMutation.mutate(file, {
      onSuccess: (data) => {
        setLocation(`/analysis/${data.sessionId}`);
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Analyze your WhatsApp Chat
          </h2>
          <p className="text-muted-foreground">
            Export your chat (without media) as a .txt file and drop it here.
          </p>
        </div>

        <div
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
            ${dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
            ${file ? 'border-primary/50 bg-primary/5' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploadMutation.isPending}
          />
          
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center pointer-events-none"
              >
                <div className="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium text-foreground">
                  Drag & drop your file here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse from your computer
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center pointer-events-none"
              >
                <div className="w-16 h-16 mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium text-foreground truncate max-w-[250px]">
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {uploadMutation.isError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 rounded-xl bg-destructive/10 text-destructive flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Upload failed</p>
              <p>{uploadMutation.error?.message || "There was a problem processing your file."}</p>
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleUpload}
            disabled={!file || uploadMutation.isPending}
            className={`
              flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300
              ${!file 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0'}
            `}
          >
            {uploadMutation.isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                Analyze Chat
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
