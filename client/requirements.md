## Packages
recharts | Beautiful, responsive charts for the analysis dashboard
framer-motion | Smooth animations and staggered reveals for the premium dashboard feel
date-fns | Date formatting and manipulation for timeline data
lucide-react | Comprehensive icon set (already in stack but confirming usage)
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility to merge tailwind classes without style conflicts

## Notes
- The `/api/chat/upload` endpoint expects a `multipart/form-data` payload with a file field (typically named `file` or `chat`).
- Dashboard relies heavily on responsive grid layouts.
- Recharts requires parent containers to have a defined height for `ResponsiveContainer` to work properly.
