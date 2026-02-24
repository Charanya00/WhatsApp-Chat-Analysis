// Helper file to process WhatsApp chat data

import type { MessageData, AnalysisMetrics, UserStats, TimelineData, ActivityData, HourlyData, WordFrequency, EmojiFrequency, InteractionHeatmapData, SentimentTrend } from "@shared/schema";

// Simple sentiment keywords
const positiveWords = new Set(['good', 'great', 'awesome', 'excellent', 'happy', 'love', 'like', 'best', 'thanks', 'thank', 'haha', 'lol', 'lmao']);
const negativeWords = new Set(['bad', 'terrible', 'awful', 'sad', 'hate', 'angry', 'worst', 'sorry', 'no', 'not', 'never']);

// Helper to check if a message is deleted (different across OS/languages)
const deletedMessagesPatterns = [
  "This message was deleted",
  "You deleted this message"
];

const mediaPatterns = [
  "<Media omitted>",
  "image omitted",
  "video omitted",
  "audio omitted",
  "sticker omitted",
  "GIF omitted"
];

// Emojis regex
const emojiRegex = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu;

function getSentiment(text: string): { sentiment: 'positive' | 'negative' | 'neutral', score: number } {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  let score = 0;
  
  for (const word of words) {
    if (positiveWords.has(word)) score += 1;
    if (negativeWords.has(word)) score -= 1;
  }
  
  if (score > 0) return { sentiment: 'positive', score };
  if (score < 0) return { sentiment: 'negative', score };
  return { sentiment: 'neutral', score };
}

function extractEmojis(text: string): string[] {
  const matches = text.match(emojiRegex);
  return matches || [];
}

function extractWords(text: string): string[] {
  // Exclude some common English stop words
  const stopWords = new Set(['the', 'and', 'to', 'a', 'of', 'in', 'i', 'is', 'that', 'it', 'on', 'you', 'this', 'for', 'but', 'with', 'are', 'have', 'be', 'at', 'or', 'as', 'was', 'so', 'if', 'out', 'not', 'my', 'your', 'we', 'they', 'me', 'am', 'do', 'can', 'will', 'just']);
  
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  return words.filter(w => !stopWords.has(w));
}

export async function analyzeChat(content: string): Promise<AnalysisMetrics> {
  const lines = content.split('\n');
  const messages: MessageData[] = [];
  
  // Basic regex for typical WhatsApp format: "DD/MM/YYYY, HH:mm - Sender: Message"
  // Handles a variety of date formats
  const messageRegex = /^(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}),?\s+(\d{1,2}:\d{2}(?:\s*[aApP][mM])?)\s+-\s+([^:]+):\s+(.*)$/;
  
  let currentMessage: MessageData | null = null;

  for (const line of lines) {
    const match = line.match(messageRegex);
    
    if (match) {
      if (currentMessage) {
        messages.push(currentMessage);
      }
      
      const [_, dateStr, timeStr, sender, text] = match;
      
      // Try to parse standard formats to a common format (YYYY-MM-DD)
      let parsedDate = dateStr;
      try {
        const parts = dateStr.split(/[\/\-\.]/);
        // Assuming DD/MM/YYYY or MM/DD/YYYY, we'll try to extract parts.
        // This is a naive parsing for demonstration.
        if (parts.length === 3) {
          const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          // Defaulting to MM/DD/YYYY if unclear, or just use raw string
          parsedDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      } catch (e) {
        // Keep original if parsing fails
      }

      const isDeleted = deletedMessagesPatterns.some(p => text.includes(p));
      const isMedia = mediaPatterns.some(p => text.includes(p));
      const { sentiment, score } = getSentiment(text);

      currentMessage = {
        date: parsedDate,
        time: timeStr,
        datetime: `${parsedDate} ${timeStr}`,
        sender,
        message: text,
        isDeleted,
        isMedia,
        sentiment,
        sentimentScore: score
      };
    } else if (currentMessage && line.trim() !== '') {
      // Continuation of a multiline message
      currentMessage.message += '\n' + line;
      
      // Update sentiment and media checks
      const isDeleted = deletedMessagesPatterns.some(p => currentMessage!.message.includes(p));
      const isMedia = mediaPatterns.some(p => currentMessage!.message.includes(p));
      const { sentiment, score } = getSentiment(currentMessage.message);
      
      currentMessage.isDeleted = isDeleted;
      currentMessage.isMedia = isMedia;
      currentMessage.sentiment = sentiment;
      currentMessage.sentimentScore = score;
    }
  }
  
  if (currentMessage) {
    messages.push(currentMessage);
  }

  // --- Compute Metrics ---
  
  const participantsSet = new Set<string>();
  const userStatsMap = new Map<string, any>();
  
  let totalWords = 0;
  let totalMedia = 0;
  let totalDeleted = 0;
  
  const timelineMap = new Map<string, number>();
  const dayOfWeekMap = new Map<number, number>();
  const monthMap = new Map<number, number>();
  const hourlyMap = new Map<number, number>();
  const heatmapMap = new Map<string, number>(); // "DayHour"
  const wordFreqMap = new Map<string, number>();
  const emojiFreqMap = new Map<string, number>();
  const sentimentTrendMap = new Map<string, SentimentTrend>();

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (const msg of messages) {
    participantsSet.add(msg.sender);
    
    // User stats initialization
    if (!userStatsMap.has(msg.sender)) {
      userStatsMap.set(msg.sender, {
        sender: msg.sender,
        messageCount: 0,
        mediaCount: 0,
        deletedCount: 0,
        wordCount: 0,
        averageMessageLength: 0,
        emojis: new Map<string, number>()
      });
    }
    
    const uStats = userStatsMap.get(msg.sender);
    uStats.messageCount++;
    
    if (msg.isDeleted) {
      totalDeleted++;
      uStats.deletedCount++;
    } else if (msg.isMedia) {
      totalMedia++;
      uStats.mediaCount++;
    } else {
      // Only count words/emojis for actual text messages
      const words = extractWords(msg.message);
      const emojis = extractEmojis(msg.message);
      
      totalWords += words.length;
      uStats.wordCount += words.length;
      
      for (const w of words) {
        wordFreqMap.set(w, (wordFreqMap.get(w) || 0) + 1);
      }
      
      for (const e of emojis) {
        emojiFreqMap.set(e, (emojiFreqMap.get(e) || 0) + 1);
        uStats.emojis.set(e, (uStats.emojis.get(e) || 0) + 1);
      }
    }
    
    // Timeline & Activity
    timelineMap.set(msg.date, (timelineMap.get(msg.date) || 0) + 1);
    
    try {
      const dateObj = new Date(msg.date);
      if (!isNaN(dateObj.getTime())) {
        const day = dateObj.getDay();
        const month = dateObj.getMonth();
        
        dayOfWeekMap.set(day, (dayOfWeekMap.get(day) || 0) + 1);
        monthMap.set(month, (monthMap.get(month) || 0) + 1);
        
        // Time parsing (very basic)
        const hourMatch = msg.time.match(/(\d{1,2}):/);
        let hour = 0;
        if (hourMatch) {
          hour = parseInt(hourMatch[1], 10);
          if (msg.time.toLowerCase().includes('pm') && hour < 12) hour += 12;
          if (msg.time.toLowerCase().includes('am') && hour === 12) hour = 0;
        }
        
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
        
        const heatmapKey = `${days[day]}-${hour}`;
        heatmapMap.set(heatmapKey, (heatmapMap.get(heatmapKey) || 0) + 1);
      }
    } catch(e) {}
    
    // Sentiment Trend
    if (!sentimentTrendMap.has(msg.date)) {
      sentimentTrendMap.set(msg.date, { date: msg.date, positive: 0, negative: 0, neutral: 0 });
    }
    const sTrend = sentimentTrendMap.get(msg.date)!;
    if (msg.sentiment) {
      sTrend[msg.sentiment]++;
    }
  }

  // Format the outputs
  
  const userStats: UserStats[] = Array.from(userStatsMap.values()).map(u => {
    // Sort emojis
    const topEmojis = Array.from(u.emojis.entries())
      .map(([emoji, count]) => ({ emoji, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
      
    return {
      sender: u.sender,
      messageCount: u.messageCount,
      mediaCount: u.mediaCount,
      deletedCount: u.deletedCount,
      wordCount: u.wordCount,
      averageMessageLength: u.messageCount > 0 ? u.wordCount / u.messageCount : 0,
      topEmojis
    };
  }).sort((a, b) => b.messageCount - a.messageCount);

  const timeline = Array.from(timelineMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically

  const activityByDay = Array.from(dayOfWeekMap.entries())
    .map(([dayIndex, count]) => ({ dayOfWeek: days[dayIndex], count }))
    // Sort by day of week index to keep them in order (Sun-Sat)
    .sort((a, b) => days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek));

  const activityByMonth = Array.from(monthMap.entries())
    .map(([monthIndex, count]) => ({ dayOfWeek: months[monthIndex], count })) // reusing field for simplicity
    .sort((a, b) => months.indexOf(a.dayOfWeek) - months.indexOf(b.dayOfWeek));

  const hourlyActivity = Array.from(hourlyMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour - b.hour);

  const topWords = Array.from(wordFreqMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);

  const topEmojis = Array.from(emojiFreqMap.entries())
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const interactionHeatmap: InteractionHeatmapData[] = [];
  heatmapMap.forEach((count, key) => {
    const [day, hourStr] = key.split('-');
    interactionHeatmap.push({ day, hour: parseInt(hourStr, 10), count });
  });

  const sentimentTrend = Array.from(sentimentTrendMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));

  // Find busiest
  let busiestDay = { date: '', count: 0 };
  for (const t of timeline) {
    if (t.count > busiestDay.count) busiestDay = t;
  }
  
  let busiestMonthObj = { month: '', count: 0 };
  for (const m of activityByMonth) {
    if (m.count > busiestMonthObj.count) busiestMonthObj = { month: m.dayOfWeek, count: m.count };
  }
  
  let busiestHour = { hour: 0, count: 0 };
  for (const h of hourlyActivity) {
    if (h.count > busiestHour.count) busiestHour = h;
  }

  return {
    totalMessages: messages.length,
    totalWords,
    totalMedia,
    totalDeleted,
    participants: Array.from(participantsSet),
    userStats,
    timeline,
    activityByDay,
    activityByMonth,
    hourlyActivity,
    topWords,
    topEmojis,
    interactionHeatmap,
    sentimentTrend,
    busiestDay,
    busiestMonth: busiestMonthObj,
    busiestHour
  };
}
