const { getRepairAdvice: getGroqAdvice } = require("./groqService");
const { generateVideoQuery: getGeminiQuery } = require("./geminiService");
const axios = require("axios");

// 🟢 Added 'history' to parameters
const getSmartRepairAdvice = async (message, history, location) => {
  // 1. Pass history to Groq so it remembers the chat
  const groqResponse = await getGroqAdvice(message, history);
  const aiText = groqResponse.text || groqResponse;

  const grounding = [];

  try {
    // 2. Gemini creates the perfect YouTube search query
    const optimizedQuery = await getGeminiQuery(aiText, message);

    // 3. YouTube API
    const youtubeRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          q: `${optimizedQuery} repair guide tutorial`,
          key: process.env.YOUTUBE_API_KEY,
          maxResults: 3,
          type: "video",
        },
      },
    );

    youtubeRes.data.items.forEach((v) => {
      grounding.push({
        web: {
          title: v.snippet.title,
          url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
          thumbnail: v.snippet.thumbnails.medium.url,
        },
      });
    });

    // 4. Maps API
    if (location && location.latitude && location.longitude) {
      const mapsRes = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
        {
          params: {
            location: `${location.latitude},${location.longitude}`,
            radius: 5000,
            keyword: "authorized electronics repair shop",
            key: process.env.GOOGLE_MAPS_API_KEY,
          },
        },
      );

      mapsRes.data.results.slice(0, 3).forEach((s) => {
        grounding.push({
          maps: {
            title: s.name,
            address: s.vicinity,
            url: `http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(s.name)}&query_place_id=${s.place_id}`,
          },
        });
      });
    }
  } catch (err) {
    console.error("Hybrid Grounding Error:", err.message);
  }

  return { text: aiText, grounding };
};

module.exports = { getSmartRepairAdvice };

// new Old
// // backend/services/smartRepairService.js
// const { getRepairAdvice: getGroqAdvice } = require("./groqService"); // For technical text
// const { generateVideoQuery: getGeminiQuery } = require("./geminiService"); // For smart search strings
// const axios = require("axios");

// const getSmartRepairAdvice = async (message, location) => {
//   // 1. Get fast technical advice from Groq
//   const groqResponse = await getGroqAdvice(message);
//   const aiText = groqResponse.text || groqResponse;

//   const grounding = [];

//   try {
//     // 2. Use Gemini to create an optimized search query based on Groq's advice
//     const optimizedQuery = await getGeminiQuery(aiText, message);

//     // 3. FETCH YOUTUBE VIDEOS using the Gemini-optimized query
//     const youtubeRes = await axios.get(
//       `https://www.googleapis.com/youtube/v3/search`,
//       {
//         params: {
//           part: "snippet",
//           q: `${optimizedQuery} repair guide tutorial`,
//           key: process.env.YOUTUBE_API_KEY,
//           maxResults: 3,
//           type: "video",
//         },
//       },
//     );

//     const videos = youtubeRes.data.items.map((v) => ({
//       web: {
//         title: v.snippet.title,
//         url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
//         thumbnail: v.snippet.thumbnails.medium.url,
//       },
//     }));
//     grounding.push(...videos);

//     // 4. FETCH GOOGLE MAPS SHOPS using Gemini insights if location exists
//     if (location && location.latitude) {
//       const mapsRes = await axios.get(
//         `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
//         {
//           params: {
//             location: `${location.latitude},${location.longitude}`,
//             radius: 5000,
//             keyword: "authorized electronics repair shop",
//             key: process.env.GOOGLE_MAPS_API_KEY,
//           },
//         },
//       );

//       const shops = mapsRes.data.results.slice(0, 3).map((s) => ({
//         maps: {
//           title: s.name,
//           address: s.vicinity,
//           url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name)}&query_place_id=${s.place_id}`,
//         },
//       }));
//       grounding.push(...shops);
//     }
//   } catch (err) {
//     console.error("Hybrid Grounding Error:", err.message);
//   }

//   return { text: aiText, grounding };
// };

// module.exports = { getSmartRepairAdvice };

//Old
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const dotenv = require("dotenv");
// dotenv.config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// /**
//  * @desc Advanced AI Advisor with Google Search & YouTube Grounding
//  */
// const getSmartRepairAdvice = async (issueDescription, location = null) => {
//   try {
//     // 1. Initialize Gemini with Google Search tool enabled
//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.0-flash",
//       tools: [{ googleSearch: {} }],
//     });

//     const systemInstruction = `You are EcoNova, a high-tech E-Waste Repair Assistant.
//     1. If the user is confused or the repair is mechanical, provide a direct YouTube link for "${issueDescription} step by step guide".
//     2. SAFETY: If you see smoke, fire, or sparks, stop and warn them immediately.
//     3. MAPS: If coordinates are provided (${location ? `Lat: ${location.lat}, Lng: ${location.lng}` : "None"}),
//        recommend specific nearby repair shops by name and general distance.
//     4. Keep steps simple but technical enough to be useful.`;

//     const result = await model.generateContent(
//       `${systemInstruction}\n\nProblem: ${issueDescription}`,
//     );
//     const response = await result.response;

//     // Return the grounded text which includes links to YouTube and Maps
//     return response.text();
//   } catch (error) {
//     console.error("Smart Service Error:", error.message);
//     return "Error connecting to Grounded AI. Using internal knowledge: Please search YouTube for a fix.";
//   }
// };

// module.exports = { getSmartRepairAdvice };
