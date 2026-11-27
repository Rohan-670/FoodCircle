const donationService = require('../services/donation.service');
const { sendSuccess } = require('../utils/response');

async function create(req, res, next) {
  try {
    const donation = await donationService.createDonation(
      req.user.id,
      req.body,
      req.file || null
    );
    return sendSuccess(res, 201, 'Donation created successfully', {
      donation,
      safetyNotice:
        'Image upload is for visual reference only and does not certify food safety.',
    });
  } catch (error) {
    return next(error);
  }
}

async function getMyDonations(req, res, next) {
  try {
    const donations = await donationService.getDonorDonations(req.user.id);
    return sendSuccess(res, 200, 'Donor donation history retrieved', { donations });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const donation = await donationService.updateDonation(
      req.user.id,
      req.params.id,
      req.body,
      req.file || null
    );
    return sendSuccess(res, 200, 'Donation updated successfully', { donation });
  } catch (error) {
    return next(error);
  }
}

async function cancel(req, res, next) {
  try {
    const donation = await donationService.cancelDonation(req.user.id, req.params.id);
    return sendSuccess(res, 200, 'Donation cancelled successfully', { donation });
  } catch (error) {
    return next(error);
  }
}

async function browse(req, res, next) {
  try {
    const donations = await donationService.browseAvailableDonations(req.query);
    return sendSuccess(res, 200, 'Available donations retrieved', { donations });
  } catch (error) {
    return next(error);
  }
}

async function request(req, res, next) {
  try {
    const donationRequest = await donationService.requestDonation(
      req.user.id,
      req.params.id,
      req.body
    );
    return sendSuccess(res, 201, 'Donation request submitted', {
      request: donationRequest,
    });
  } catch (error) {
    return next(error);
  }
}

async function respondToRequest(req, res, next) {
  try {
    const result = await donationService.respondToDonationRequest(
      req.user.id,
      req.params.requestId,
      req.body.action
    );
    return sendSuccess(
      res,
      200,
      `Donation request ${req.body.action === 'ACCEPT' ? 'accepted' : 'rejected'}`,
      result
    );
  } catch (error) {
    return next(error);
  }
}

async function report(req, res, next) {
  try {
    const reportRecord = await donationService.reportDonation(
      req.user.id,
      req.params.id,
      req.body
    );
    return sendSuccess(res, 201, 'Donation report submitted for admin review', {
      report: reportRecord,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  getMyDonations,
  update,
  cancel,
  browse,
  request,
  respondToRequest,
  report,
};
