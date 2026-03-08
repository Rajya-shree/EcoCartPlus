const { getRepairAdvice } = require("./groqService");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const getSmartRepairAdvice = async (message, history, location) => {
  const groqResponse = await getRepairAdvice(message, history, location);
  const aiText = groqResponse.text;

  const grounding = [];

  try {
    const youtubeRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          q: `${message} repair guide tutorial`,
          key: process.env.YOUTUBE_API_KEY,
          maxResults: 3,
          type: "video",
        },
      }
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
        }
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