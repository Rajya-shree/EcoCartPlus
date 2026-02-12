// frontend/src/components/ShopMap.jsx
import React from "react";
import { MapPin, ExternalLink, Navigation } from "lucide-react";

const ShopMap = ({ shop }) => {
  return (
    <a
      href={shop.uri}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white border border-gray-100 hover:border-rose-200 p-2.5 rounded-xl flex items-center gap-3 text-xs font-bold text-gray-700 shadow-sm transition-all group"
    >
      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
        <MapPin className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-gray-900">{shop.title || "View on Maps"}</span>
        <span className="text-[9px] text-rose-500 uppercase tracking-tighter font-black">Open in Google Maps</span>
      </div>
      <Navigation className="w-3 h-3 text-gray-300 ml-1 group-hover:text-rose-500" />
    </a>
  );
};

export default ShopMap;