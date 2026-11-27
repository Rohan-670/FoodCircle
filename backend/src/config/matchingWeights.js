/**
 * Configurable heuristic weights for the Donor–NGO suitability scoring algorithm.
 *
 * IMPORTANT: These weights are configurable operational heuristics designed for
 * transparency and prioritization, not scientifically validated clinical or logistical metrics.
 * Weights must sum to 1.0 (100%).
 */
const DEFAULT_MATCHING_WEIGHTS = {
  distance: 0.30, // 30% - Geographic proximity / service area match
  foodCategory: 0.20, // 20% - Alignment with NGO's preferred food categories
  quantity: 0.20, // 20% - Alignment with NGO's current quantity requirements
  urgency: 0.15, // 15% - Time remaining before safe-consumption expiry deadline
  capacity: 0.15, // 15% - NGO's storage/distribution capacity vs. donation size
};

const MATCHING_THRESHOLDS = {
  maxDistanceKm: 50, // Distance at which geographic proximity score reaches 0
  criticalUrgencyHours: 4,
  highUrgencyHours: 12,
  mediumUrgencyHours: 24,
};

module.exports = {
  DEFAULT_MATCHING_WEIGHTS,
  MATCHING_THRESHOLDS,
};
