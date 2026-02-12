// frontend/src/components/VideoHelpCard.jsx
// import React from "react";
// import { PlayCircle, Youtube, ExternalLink, Clock } from "lucide-react";
import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  Box,
  Chip,
} from "@mui/material";
import { PlayCircle, Youtube } from "lucide-react";

// const VideoHelpCard = ({ video }) => (
//   <a
//     href={video.url}
//     target="_blank"
//     rel="noopener noreferrer"
//     className="group block bg-white rounded-xl border border-slate-100 p-2 hover:border-emerald-300 hover:shadow-md transition-all mb-2"
//   >
//     <div className="flex items-center gap-3">
//       {/* Thumbnail */}
//       <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
//         <img
//           src={video.thumbnail}
//           alt=""
//           className="w-full h-full object-cover"
//         />
//         <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-all">
//           <PlayCircle
//             size={20}
//             className="text-white drop-shadow-md"
//             fill="currentColor"
//           />
//         </div>
//       </div>
//       {/* Title & Info */}
//       <div className="flex-1 min-w-0">
//         <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight mb-1">
//           {video.title}
//         </h4>
//         <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
//           <Youtube size={10} className="text-rose-500" />
//           Visual Repair Guide
//         </div>
//       </div>
//     </div>
//   </a>
// );

// const VideoHelpCard = ({ video }) => {
//   return (
//     <a
//       href={video.url}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden w-full max-w-[280px]"
//     >
//       {/* 🟢 Card Media Section */}
//       <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
//         <img
//           src={video.thumbnail}
//           alt={video.title}
//           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//         />
//         {/* Play Overlay */}
//         <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//           <div className="bg-emerald-500 text-white p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
//             <PlayCircle size={24} fill="currentColor" />
//           </div>
//         </div>
//         {/* Source Badge */}
//         <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 font-bold uppercase tracking-wider">
//           <Youtube size={12} className="text-rose-500" />
//           YouTube
//         </div>
//       </div>

//       {/* 🟢 Card Content Section */}
//       <div className="p-4 flex flex-col flex-1">
//         <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug min-h-[40px] group-hover:text-emerald-600 transition-colors">
//           {video.title}
//         </h4>

//         <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
//           <div className="flex items-center gap-1.5 text-slate-400">
//             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
//             <span className="text-[10px] font-black uppercase tracking-tighter">
//               Visual Repair Guide
//             </span>
//           </div>
//           <ExternalLink size={14} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
//         </div>
//       </div>
//     </a>
//   );
// };

const VideoHelpCard = ({ video }) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        },
      }}
    >
      <CardActionArea href={video.url} target="_blank">
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            sx={{ aspectRatio: "16/9" }}
            image={video.thumbnail}
            alt={video.title}
          />
          {/* Play Icon Overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0,0,0,0.3)",
              opacity: 0,
              "&:hover": { opacity: 1 },
              transition: "0.3s",
            }}
          >
            <PlayCircle color="white" size={48} />
          </Box>
        </Box>
        <CardContent sx={{ p: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              height: "2.4em",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {video.title}
          </Typography>
          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Chip
              icon={<Youtube size={14} color="#f00" />}
              label="ECO-REPAIR GUIDE"
              size="small"
              variant="outlined"
              sx={{
                fontSize: "0.65rem",
                fontWeight: 800,
                color: "#059669",
                borderColor: "#d1fae5",
              }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default VideoHelpCard;
