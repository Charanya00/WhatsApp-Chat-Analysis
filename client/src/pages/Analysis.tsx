import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowLeft, MessageCircle, Users, Image as ImageIcon, Trash2, 
  CalendarDays, Clock, Heart, Download
} from "lucide-react";
import { useSessionAnalysis } from "@/hooks/use-chat";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MetricCard } from "@/components/ui/MetricCard";
import { 
  TimelineAreaChart, UserActivityBarChart, SentimentPieChart, DayOfWeekChart 
} from "@/components/dashboard/Charts";

export default function Analysis() {
  const params = useParams();
  const sessionId = params.id ? parseInt(params.id, 10) : null;
  const { data, isLoading, isError } = useSessionAnalysis(sessionId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <LoadingSpinner message="Crunching thousands of messages... This might take a moment." />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="glass-card p-8 rounded-3xl max-w-md text-center border-destructive/20">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Analysis Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find the requested chat analysis. It may have expired or the ID is invalid.</p>
          <Link href="/">
            <a className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back Home
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const { metrics, session } = data;
  
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <a className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </a>
            </Link>
            <div>
              <h1 className="font-display font-bold text-lg leading-none truncate max-w-[200px] sm:max-w-md">
                {session.filename}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Analyzed on {new Date(session.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 mt-8">
        
        {/* Top Metrics Row */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <MetricCard 
              title="Total Messages" 
              value={metrics.totalMessages.toLocaleString()} 
              icon={MessageCircle} 
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard 
              title="Active Participants" 
              value={metrics.participants.length} 
              icon={Users} 
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard 
              title="Media Shared" 
              value={metrics.totalMedia.toLocaleString()} 
              icon={ImageIcon} 
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <MetricCard 
              title="Deleted Messages" 
              value={metrics.totalDeleted.toLocaleString()} 
              icon={Trash2} 
            />
          </motion.div>
        </motion.div>

        {/* Main Charts Row */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-foreground">Activity Timeline</h3>
                <p className="text-sm text-muted-foreground">Message volume over the entire history</p>
              </div>
            </div>
            <TimelineAreaChart data={metrics.timeline} />
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl">
            <div className="mb-2">
              <h3 className="text-lg font-bold text-foreground">Top Contributors</h3>
              <p className="text-sm text-muted-foreground">Most active group members</p>
            </div>
            <UserActivityBarChart data={metrics.userStats} />
          </motion.div>
        </motion.div>

        {/* Secondary Insights Row */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Day of Week */}
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-xl">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground leading-none">Weekly Pattern</h3>
                <p className="text-xs text-muted-foreground mt-1">Busiest day: <span className="text-foreground font-medium">{metrics.busiestDay?.date || 'N/A'}</span></p>
              </div>
            </div>
            <div className="flex-1 min-h-[250px]">
               <DayOfWeekChart data={metrics.activityByDay} />
            </div>
          </motion.div>

          {/* Sentiment */}
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-pink-500/10 text-pink-500 rounded-xl">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground leading-none">Overall Sentiment</h3>
                <p className="text-xs text-muted-foreground mt-1">Emotional tone of the chat</p>
              </div>
            </div>
            <div className="flex-1 min-h-[250px]">
              <SentimentPieChart data={metrics.sentimentTrend} />
            </div>
          </motion.div>

          {/* Top Words & Emojis */}
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl flex flex-col overflow-hidden">
            <h3 className="font-bold text-foreground mb-4">Vocabulary & Emojis</h3>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Top Words</p>
                <div className="space-y-3">
                  {metrics.topWords.slice(0, 7).map((w, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{w.word}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{w.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Top Emojis</p>
                <div className="space-y-3">
                  {metrics.topEmojis.slice(0, 7).map((e, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xl leading-none">{e.emoji}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{e.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </main>
    </div>
  );
}
