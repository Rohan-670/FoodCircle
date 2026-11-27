const matchingService = require('../services/matching.service');
const { sendSuccess } = require('../utils/response');

async function getNgosForDonation(req, res, next) {
  try {
    const result = await matchingService.getRecommendedNgosForDonation(
      req.user.id,
      req.params.donationId,
      req.query
    );
    return sendSuccess(res, 200, 'NGO recommendations calculated', result);
  } catch (error) {
    return next(error);
  }
}

async function getDonationsForNgo(req, res, next) {
  try {
    const result = await matchingService.getRecommendedDonationsForNgo(
      req.user.id,
      req.query
    );
    return sendSuccess(res, 200, 'Donation recommendations calculated', result);
  } catch (error) {
    return next(error);
  }
}

async function respondToRecommendation(req, res, next) {
  try {
    const result = await matchingService.recordRecommendationAction(
      req.user.id,
      req.user.role,
      req.body
    );
    return sendSuccess(res, 200, 'Recommendation feedback recorded', result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getNgosForDonation,
  getDonationsForNgo,
  respondToRecommendation,
};
