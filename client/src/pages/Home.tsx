import { motion } from "framer-motion";
import { MessageSquare, BarChart3, Shield, Zap } from "lucide-react";
import { UploadSection } from "@/components/dashboard/UploadSection";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation / Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground font-display font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            ChatInsights
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#privacy" className="hover:text-foreground transition-colors">Privacy</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 ring-1 ring-primary/20"
            >
              <Zap className="w-4 h-4" />
              Instant Deep Analytics
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6"
            >
              Understand your <br className="hidden md:block" />
              <span className="text-gradient-primary">WhatsApp Chats</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10"
            >
              Turn thousands of messages into beautiful, actionable insights. Discover who talks the most, when you're most active, and the hidden sentiments in your conversations.
            </motion.p>
          </div>

          {/* Upload Component */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-32"
          >
            <UploadSection />
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            id="features"
          >
            <motion.div variants={itemVariants} className="glass-card p-8 rounded-3xl relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rich Visualizations</h3>
              <p className="text-muted-foreground">Beautiful interactive charts mapping timeline trends, daily activity, and user participation metrics.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-8 rounded-3xl relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Text Analytics</h3>
              <p className="text-muted-foreground">Discover your most used words and emojis. Uncover the overall sentiment and emotional tone of the group.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-8 rounded-3xl relative overflow-hidden group" id="privacy">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Privacy First</h3>
              <p className="text-muted-foreground">Your chats are processed ephemerally. Only anonymous analytical metadata is calculated and displayed to you.</p>
            </motion.div>
          </motion.div>
          
        </div>
      </main>
      
      <footer className="border-t border-border/40 py-8 text-center text-muted-foreground text-sm">
        <p>Built for exploration and data visualization. Not affiliated with WhatsApp.</p>
      </footer>
    </div>
  );
}
