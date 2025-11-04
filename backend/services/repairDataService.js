// backend/services/repairDataService.js

// This mocks the function that will eventually talk to the iFixit API
async function fetchRepairGuides(query) {
    console.log(`[MOCK] Searching repair guides for: ${query}`);
    // This static string will be injected into the AI's prompt as context.
    return `
        Guide: iPhone 14 Battery Replacement. Steps include: 1) Power off the device. 2) Remove the bottom pentalobe screws. 3) Heat the display edges.
        Guide: Laptop Fan Noise Diagnosis. A common issue is a dust buildup requiring simple cleaning with compressed air.
        Guide: General troubleshooting for 'Device Won't Turn On': Check the charger, hold the power button for 30 seconds, then check battery connection.
    `;
}

module.exports = { fetchRepairGuides };