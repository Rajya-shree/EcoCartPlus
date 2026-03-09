const { getRepairAdvice } = require("./groqService");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const getSmartRepairAdvice = async (message, history, location) => {
  const groqResponse = await getRepairAdvice(message, history, location);
  const aiText = groqResponse.text;

  const isRepairOrSafety =
    aiText.includes("1.") || aiText.toLowerCase().includes("safety");
  if (message.trim().length <= 15 && !isRepairOrSafety) {
    return { text: aiText, grounding: [] };
  }

  const grounding = [];

  try {
    const youtubePromise = axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          q: `${message} repair tutorial`,
          key: process.env.YOUTUBE_API_KEY,
          maxResults: 3,
          type: "video",
        },
      },
    );

    const mapsPromise =
      location && location.latitude && location.longitude
        ? axios.get(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
            {
              params: {
                location: `${location.latitude},${location.longitude}`,
                radius: 5000,
                keyword: "authorized electronics repair shop",
                key: process.env.GOOGLE_MAPS_API_KEY,
              },
            },
          )
        : Promise.resolve(null); // Resolves instantly if no location

    // 🟢 FIXED: Use Promise.allSettled so if YouTube fails, Maps still loads (and vice versa)
    const results = await Promise.allSettled([youtubePromise, mapsPromise]);

    const youtubeRes = results[0];
    const mapsRes = results[1];

    // --- Safely Process YouTube ---
    if (
      youtubeRes.status === "fulfilled" &&
      youtubeRes.value &&
      youtubeRes.value.data.items
    ) {
      youtubeRes.value.data.items.forEach((v) => {
        grounding.push({
          web: {
            title: v.snippet.title,
            url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
            thumbnail:
              v.snippet.thumbnails?.medium?.url ||
              v.snippet.thumbnails?.default?.url,
          },
        });
      });
    } else if (youtubeRes.status === "rejected") {
      console.log("YouTube Grounding Skipped:", youtubeRes.reason.message);
    }

    // --- Safely Process Maps ---
    if (
      mapsRes.status === "fulfilled" &&
      mapsRes.value &&
      mapsRes.value.data.results
    ) {
      mapsRes.value.data.results.slice(0, 3).forEach((s) => {
        grounding.push({
          maps: {
            title: s.name,
            address: s.vicinity,
            url: `http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(s.name)}&query_place_id=${s.place_id}`,
          },
        });
      });
    } else if (mapsRes.status === "rejected") {
      console.log("Maps Grounding Skipped:", mapsRes.reason.message);
    }
  } catch (err) {
    console.error("Hybrid Grounding Error:", err.message);
  }

  return { text: aiText, grounding };
};

module.exports = { getSmartRepairAdvice };

// const { getRepairAdvice } = require("./groqService");
// const axios = require("axios");
// const dotenv = require("dotenv");
// dotenv.config();

// const getSmartRepairAdvice = async (message, history, location) => {
//   const groqResponse = await getRepairAdvice(message, history, location);
//   const aiText = groqResponse.text;

//   const isRepairOrSafety =
//     aiText.includes("1.") || aiText.toLowerCase().includes("safety");
//   if (message.trim().length <= 15 && !isRepairOrSafety) {
//     return { text: aiText, grounding: [] };
//   }

//   const grounding = [];

//   // try {
//   //   const youtubeRes = await axios.get(
//   //     `https://www.googleapis.com/youtube/v3/search`,
//   //     {
//   //       params: {
//   //         part: "snippet",
//   //         q: `${message} repair guide tutorial`,
//   //         key: process.env.YOUTUBE_API_KEY,
//   //         maxResults: 3,
//   //         type: "video",
//   //       },
//   //     }
//   //   );

//   //   youtubeRes.data.items.forEach((v) => {
//   //     grounding.push({
//   //       web: {
//   //         title: v.snippet.title,
//   //         url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
//   //         thumbnail: v.snippet.thumbnails.medium.url,
//   //       },
//   //     });
//   //   });

//   //   if (location && location.latitude && location.longitude) {
//   //     const mapsRes = await axios.get(
//   //       `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
//   //       {
//   //         params: {
//   //           location: `${location.latitude},${location.longitude}`,
//   //           radius: 5000,
//   //           keyword: "authorized electronics repair shop",
//   //           key: process.env.GOOGLE_MAPS_API_KEY,
//   //         },
//   //       }
//   //     );

//   //     mapsRes.data.results.slice(0, 3).forEach((s) => {
//   //       grounding.push({
//   //         maps: {
//   //           title: s.name,
//   //           address: s.vicinity,
//   //           url: `http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(s.name)}&query_place_id=${s.place_id}`,
//   //         },
//   //       });
//   //     });
//   //   }
//   // }

//   try {
//     const youtubePromise = axios.get(
//       `https://www.googleapis.com/youtube/v3/search`,
//       {
//         params: {
//           part: "snippet",
//           q: `${message} repair tutorial`,
//           key: process.env.YOUTUBE_API_KEY,
//           maxResults: 3,
//           type: "video",
//         },
//       },
//     );

//     const mapsPromise =
//       location && location.latitude && location.longitude
//         ? axios.get(
//             `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
//             {
//               params: {
//                 location: `${location.latitude},${location.longitude}`,
//                 radius: 5000,
//                 keyword: "authorized electronics repair shop",
//                 key: process.env.GOOGLE_MAPS_API_KEY,
//               },
//             },
//           )
//         : Promise.resolve(null); // Resolves instantly if no location

//     // Await both APIs at the exact same time
//     const [youtubeRes, mapsRes] = await Promise.all([
//       youtubePromise,
//       mapsPromise,
//     ]);

//     if (youtubeRes && youtubeRes.data.items) {
//       youtubeRes.data.items.forEach((v) => {
//         grounding.push({
//           web: {
//             title: v.snippet.title,
//             url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
//             thumbnail: v.snippet.thumbnails.medium.url,
//           },
//         });
//       });
//     }

//     if (mapsRes && mapsRes.data.results) {
//       mapsRes.data.results.slice(0, 3).forEach((s) => {
//         grounding.push({
//           maps: {
//             title: s.name,
//             address: s.vicinity,
//             url: `http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(s.name)}&query_place_id=${s.place_id}`,
//           },
//         });
//       });
//     }
//   } catch (err) {
//     console.error("Hybrid Grounding Error:", err.message);
//   }

//   return { text: aiText, grounding };
// };

// module.exports = { getSmartRepairAdvice };
