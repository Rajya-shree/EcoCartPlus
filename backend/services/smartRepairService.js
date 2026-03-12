// Latest Code
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

//   // --- MAP LOCATOR TRACKING ---

//   // If the frontend didn't send GPS, scream loudly in the terminal!
//   if (!location || !location.latitude || !location.longitude) {
//     console.log(
//       "❌ MAP ERROR: Your React frontend did not send GPS coordinates. The browser is blocking Location!",
//     );
//     return { text: aiText, grounding };
//   }

//   console.log(
//     `🗺️ GPS Received! Latitude: ${location.latitude}, Longitude: ${location.longitude}`,
//   );

//   // try {
//   //   const youtubePromise = axios.get(
//   //     `https://www.googleapis.com/youtube/v3/search`,
//   //     {
//   //       params: {
//   //         part: "snippet",
//   //         q: `${message} repair tutorial`,
//   //         key: process.env.YOUTUBE_API_KEY,
//   //         maxResults: 3,
//   //         type: "video",
//   //       },
//   //     },
//   //   );

//   //   const mapsPromise =
//   //     location && location.latitude && location.longitude
//   //       ? axios.get(
//   //           `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
//   //           {
//   //             params: {
//   //               location: `${location.latitude},${location.longitude}`,
//   //               radius: 5000,
//   //               keyword: "authorized electronics repair shop",
//   //               key: process.env.GOOGLE_MAPS_API_KEY,
//   //             },
//   //           },
//   //         )
//   //       : Promise.resolve(null); // Resolves instantly if no location

//   //   // 🟢 FIXED: Use Promise.allSettled so if YouTube fails, Maps still loads (and vice versa)
//   //   const results = await Promise.allSettled([youtubePromise, mapsPromise]);

//   //   const youtubeRes = results[0];
//   //   const mapsRes = results[1];

//   //   // --- Safely Process YouTube ---
//   //   if (
//   //     youtubeRes.status === "fulfilled" &&
//   //     youtubeRes.value &&
//   //     youtubeRes.value.data.items
//   //   ) {
//   //     youtubeRes.value.data.items.forEach((v) => {
//   //       grounding.push({
//   //         web: {
//   //           title: v.snippet.title,
//   //           url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
//   //           thumbnail:
//   //             v.snippet.thumbnails?.medium?.url ||
//   //             v.snippet.thumbnails?.default?.url,
//   //         },
//   //       });
//   //     });
//   //   } else if (youtubeRes.status === "rejected") {
//   //     console.log("YouTube Grounding Skipped:", youtubeRes.reason.message);
//   //   }

//   //   // --- Safely Process Maps ---
//   //   if (
//   //     mapsRes.status === "fulfilled" &&
//   //     mapsRes.value &&
//   //     mapsRes.value.data.results
//   //   ) {
//   //     mapsRes.value.data.results.slice(0, 3).forEach((s) => {
//   //       grounding.push({
//   //         maps: {
//   //           title: s.name,
//   //           address: s.vicinity,
//   //           url: `http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(s.name)}&query_place_id=${s.place_id}`,
//   //         },
//   //       });
//   //     });
//   //   } else if (mapsRes.status === "rejected") {
//   //     console.log("Maps Grounding Skipped:", mapsRes.reason.message);
//   //   }
//   // }

//   try {
//     const mapsRes = await axios.get(
//       `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
//       {
//         params: {
//           location: `${location.latitude},${location.longitude}`,
//           radius: 15000, // Search within 5km
//           keyword:
//             "authorized electronics repair shop or electronics repair OR computer repair",
//           key: process.env.GOOGLE_MAPS_API_KEY,
//         },
//       },
//     );

//     if (mapsRes.data && mapsRes.data.results) {
//       console.log(
//         `✅ MAP SUCCESS: Google found ${mapsRes.data.results.length} shops!`,
//       );

//       // Take the top 3 shops and format them for your frontend
//       mapsRes.data.results.slice(0, 3).forEach((shop) => {
//         grounding.push({
//           maps: {
//             title: shop.name,
//             address: shop.vicinity || "Authorized Repair Center",
//             url: `http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(shop.name)}&query_place_id=${shop.place_id}`,
//           },
//         });
//       });
//     } else {
//       console.log(
//         "⚠️ MAP WARNING: Google Maps API responded, but found 0 shops nearby.",
//       );
//     }
//   } catch (err) {
//     console.error("Hybrid Grounding Error:", err.message);
//   }

//   return { text: aiText, grounding };
// };

// module.exports = { getSmartRepairAdvice };

///THWHWESKDGV !!!IMP!!
// const { getRepairAdvice } = require("./groqService");
// // 🟢 Import our new native map tool
// const {
//   getNearbyShopsViaGemini,
//   getBestVideoQueryViaGemini,
// } = require("./geminiService");
// const axios = require("axios");
// const dotenv = require("dotenv");
// dotenv.config();

// // const getSmartRepairAdvice = async (message, history, location) => {
// //   // 1. Get Text from Groq
// //   const groqResponse = await getRepairAdvice(message, history, location);
// //   const aiText = groqResponse.text;

// //   const isRepairOrSafety =
// //     aiText.includes("1.") || aiText.toLowerCase().includes("safety");
// //   if (message.trim().length <= 15 && !isRepairOrSafety) {
// //     return { text: aiText, grounding: [] };
// //   }

// //   const grounding = [];

// //   //🟢 THE FIX: Smart Map Trigger
// //   // Check if Groq's text mentions needing a pro, OR if the user explicitly asked for a shop
// //   const lowerText = aiText.toLowerCase();
// //   const lowerMsg = message.toLowerCase();

// //   const AIRecommendsPro =
// //     lowerText.includes("professional") ||
// //     lowerText.includes("repair service") ||
// //     lowerText.includes("technician") ||
// //     lowerText.includes("service center");

// //   const UserAskedForShop =
// //     lowerMsg.includes("where") ||
// //     lowerMsg.includes("shop") ||
// //     lowerMsg.includes("store") ||
// //     lowerMsg.includes("near me");

// //   if (AIRecommendsPro || UserAskedForShop) {
// //     // --- MAP LOCATOR TRACKING ---
// //     if (!location || !location.latitude || !location.longitude) {
// //       console.log(
// //         "❌ MAP ERROR: Your React frontend did not send GPS coordinates. The browser is blocking Location!",
// //       );
// //       return { text: aiText, grounding };
// //     }

// //     console.log(
// //       `🗺️ Complex issue detected. Fetching shops for Lat: ${location.latitude}, Lng: ${location.longitude}`,
// //     );

// //     // 🟢 The Magic: Use Gemini 2.5 Flash for Maps
// //     const mapGrounding = await getNearbyShopsViaGemini(location, message);

// //     if (mapGrounding.length > 0) {
// //       console.log(
// //         `✅ MAP SUCCESS: Gemini 2.5 Native Maps found ${mapGrounding.length} shops!`,
// //       );
// //       grounding.push(...mapGrounding);
// //     } else {
// //       // If it tried to search but found nothing
// //       console.log(
// //         "⚠️ MAP WARNING: Gemini Native Maps searched, but found 0 shops nearby.",
// //       );
// //     }
// //   } else {
// //     // 🟢 FIXED: If it skipped the map entirely because it was a simple task
// //     console.log(
// //       "⏭️ MAP SKIPPED: Issue is a simple DIY/cleaning task. No map needed.",
// //     );
// //   }

// //   return { text: aiText, grounding };
// // };

// const getSmartRepairAdvice = async (message, history, location) => {
//   try {
//     // 1. Get raw response from Groq
//     const groqResponse = await getRepairAdvice(message, history, location);
//     let aiText = groqResponse.text;

//     const grounding = [];

//     // 2. Detect the hidden AI Action Flags
//     const needsMap = aiText.includes("[SHOW_MAP]");
//     const needsVideos = aiText.includes("[SHOW_VIDEOS]");

//     // const isCriticalHazard =
//     //   /shoc|shock|spark|fire|smoke|swell|swollen|water/i.test(message);
//     // if (isCriticalHazard) {
//     //   console.log(
//     //     "🚨 FAILSAFE TRIGGERED: Critical hazard detected. Forcing Map routing.",
//     //   );
//     //   needsMap = true;
//     //   needsVideos = false; // Forcefully block videos from loading
//     // }

//     // 3. Strip the tags out so the user's chat bubble looks perfectly clean
//     aiText = aiText
//       .replace("[SHOW_MAP]", "")
//       .replace("[SHOW_VIDEOS]", "")
//       .trim();

//     // 4. TRIGGER MAPS (Only if safety risk / professional needed)
//     if (needsMap && location && location.latitude) {
//       if (!location || !location.latitude || !location.longitude) {
//         console.log("❌ MAP ERROR: No GPS coordinates provided by frontend.");
//       } else {
//         console.log(
//           `🗺️ AI Flagged [SHOW_MAP]. Fetching shops via Gemini for Lat: ${location.latitude}`,
//         );
//         const mapGrounding = await getNearbyShopsViaGemini(location, message);

//         if (mapGrounding && mapGrounding.length > 0) {
//           console.log(`✅ MAP SUCCESS: Found ${mapGrounding.length} shops!`);
//           grounding.push(...mapGrounding);
//         } else {
//           console.log("⚠️ MAP WARNING: Gemini searched but found 0 shops.");
//         }
//       }
//     }

//     // // 5. TRIGGER VIDEOS (Only if safe DIY steps were provided)
//     // if (needsVideos) {
//     //   console.log("🎥 AI Flagged [SHOW_VIDEOS]. Fetching YouTube tutorials...");
//     //   try {
//     //     const youtubeRes = await axios.get(
//     //       `https://www.googleapis.com/youtube/v3/search`,
//     //       {
//     //         params: {
//     //           part: "snippet",
//     //           q: `${message} repair tutorial`,
//     //           key: process.env.YOUTUBE_API_KEY,
//     //           maxResults: 3,
//     //           type: "video",
//     //         },
//     //       },
//     //     );

//     //     if (youtubeRes.data && youtubeRes.data.items) {
//     //       youtubeRes.data.items.forEach((v) => {
//     //         grounding.push({
//     //           web: {
//     //             title: v.snippet.title,
//     //             url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
//     //             thumbnail:
//     //               v.snippet.thumbnails?.medium?.url ||
//     //               v.snippet.thumbnails?.default?.url,
//     //           },
//     //         });
//     //       });
//     //       console.log(
//     //         `✅ VIDEO SUCCESS: Loaded ${youtubeRes.data.items.length} tutorials!`,
//     //       );
//     //     }
//     //   } catch (ytError) {
//     //     console.error("❌ VIDEO ERROR: YouTube API failed:", ytError.message);
//     //   }
//     // }

//     // --- 🟢 NEW MULTI-AGENT VIDEO LOGIC ---
//     if (needsVideos) {
//       console.log(
//         "🎥 AI Flagged [SHOW_VIDEOS]. Asking Gemini for the perfect search query...",
//       );

//       // 1. Ask Gemini to read the report and generate the query
//       const smartQuery = await getBestVideoQueryViaGemini(aiText, message);
//       console.log(`🧠 Gemini suggests searching YouTube for: "${smartQuery}"`);

//       // 2. Fetch exactly 3 highly relevant videos using Gemini's query
//       try {
//         const youtubeRes = await axios.get(
//           `https://www.googleapis.com/youtube/v3/search`,
//           {
//             params: {
//               part: "snippet",
//               q: smartQuery,
//               key: process.env.YOUTUBE_API_KEY,
//               maxResults: 3,
//               type: "video",
//             },
//           },
//         );

//         if (youtubeRes.data && youtubeRes.data.items) {
//           youtubeRes.data.items.slice(0, 5).forEach((v) => {
//             grounding.push({
//               web: {
//                 title: v.snippet.title,
//                 url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
//                 thumbnail:
//                   v.snippet.thumbnails?.medium?.url ||
//                   v.snippet.thumbnails?.default?.url,
//               },
//             });
//           });
//           console.log(`✅ VIDEO SUCCESS: Loaded 3 highly relevant tutorials!`);
//         }
//       } catch (ytError) {
//         console.error("❌ VIDEO ERROR: YouTube API failed:", ytError.message);
//       }
//     }
//     // 6. Return the clean text and dynamic grounding to the controller
//     return { text: aiText, grounding };
//   } catch (error) {
//     console.error("❌ Smart Repair Service Error:", error.message);
//     throw error;
//   }
// };

// module.exports = { getSmartRepairAdvice };

const { getRepairAdvice } = require("./groqService");
// 🟢 Import our new native map tool
const {
  getNearbyShopsViaGemini,
  getBestVideoQueryViaGemini,
} = require("./geminiService");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const getSmartRepairAdvice = async (message, history, location) => {
  try {
    // 1. Get raw response from Groq
    const groqResponse = await getRepairAdvice(message, history, location);
    let aiText = groqResponse.text;

    const grounding = [];

    // 2. Detect the hidden AI Action Flags
    const needsMap = aiText.includes("[SHOW_MAP]");
    const needsVideos = aiText.includes("[SHOW_VIDEOS]");

    // 3. Strip the tags out so the user's chat bubble looks perfectly clean
    aiText = aiText
      .replace("[SHOW_MAP]", "")
      .replace("[SHOW_VIDEOS]", "")
      .trim();

    // 4. TRIGGER MAPS (Only if safety risk / professional needed)
    if (needsMap && location && location.latitude) {
      if (!location || !location.latitude || !location.longitude) {
        console.log("❌ MAP ERROR: No GPS coordinates provided by frontend.");
      } else {
        console.log(
          `🗺️ AI Flagged [SHOW_MAP]. Fetching shops via Gemini for Lat: ${location.latitude}`,
        );
        const mapGrounding = await getNearbyShopsViaGemini(location, message);

        if (mapGrounding && mapGrounding.length > 0) {
          console.log(`✅ MAP SUCCESS: Found ${mapGrounding.length} shops!`);
          grounding.push(...mapGrounding);
        } else {
          console.log("⚠️ MAP WARNING: Gemini searched but found 0 shops.");
        }
      }
    }

    // --- 🟢 NEW MULTI-AGENT VIDEO LOGIC ---
    // Added !needsMap to ensure videos never load if a map was already triggered
    if (needsVideos && !needsMap) {
      console.log(
        "🎥 AI Flagged [SHOW_VIDEOS]. Asking Gemini for the perfect search query...",
      );

      // 1. Ask Gemini to read the report and generate the query
      const smartQuery = await getBestVideoQueryViaGemini(aiText, message);
      console.log(`🧠 Gemini suggests searching YouTube for: "${smartQuery}"`);

      // 2. Fetch exactly 3 highly relevant videos using Gemini's query
      try {
        const youtubeRes = await axios.get(
          `https://www.googleapis.com/youtube/v3/search`,
          {
            params: {
              part: "snippet",
              q: smartQuery,
              key: process.env.YOUTUBE_API_KEY,
              maxResults: 3,
              type: "video",
            },
          },
        );

        if (youtubeRes.data && youtubeRes.data.items) {
          // Changed from slice(0, 5) back to slice(0, 3) to match your UI needs
          youtubeRes.data.items.slice(0, 3).forEach((v) => {
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
          console.log(`✅ VIDEO SUCCESS: Loaded 3 highly relevant tutorials!`);
        }
      } catch (ytError) {
        console.error("❌ VIDEO ERROR: YouTube API failed:", ytError.message);
      }
    }
    // 6. Return the clean text and dynamic grounding to the controller
    return { text: aiText, grounding };
  } catch (error) {
    console.error("❌ Smart Repair Service Error:", error.message);
    throw error;
  }
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
