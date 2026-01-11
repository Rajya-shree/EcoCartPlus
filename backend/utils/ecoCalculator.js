/**
 * Local ML Model for EcoScore Calculation
 * Formula: EcoScore = (0.4 * Repairability) + (0.3 * EPEAT) + (0.3 * EnergyStar)
 * as defined in the EcoNova+ Project Abstract.
 */
const calculateEcoScore = (repairability, epeat, energyStar) => {
    // Normalizing inputs to a 1-10 scale
    const r = parseFloat(repairability) || 0; 
    const ep = parseFloat(epeat) || 0;
    const es = parseFloat(energyStar) || 0;

    const score = (0.4 * r) + (0.3 * ep) + (0.3 * es);
    
    return Math.round(score * 10) / 10; // Return rounded to 1 decimal
};

module.exports = { calculateEcoScore };