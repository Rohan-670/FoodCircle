const deliveryService = require('../services/delivery.service');
const { sendSuccess } = require('../utils/response');

async function requestVolunteer(req, res, next) {
  try {
    const delivery = await deliveryService.requestVolunteerForDonation(
      req.user.id,
      req.params.donationId,
      req.body?.notes
    );
    return sendSuccess(res, 201, 'Volunteer delivery task created', { delivery });
  } catch (error) {
    return next(error);
  }
}

async function listAvailable(req, res, next) {
  try {
    const tasks = await deliveryService.listAvailableTasks();
    return sendSuccess(res, 200, 'Available delivery tasks retrieved', { tasks });
  } catch (error) {
    return next(error);
  }
}

async function listMyDeliveries(req, res, next) {
  try {
    const deliveries = await deliveryService.listMyDeliveries(
      req.user.id,
      req.user.role
    );
    return sendSuccess(res, 200, 'Deliveries retrieved', { deliveries });
  } catch (error) {
    return next(error);
  }
}

async function acceptTask(req, res, next) {
  try {
    const delivery = await deliveryService.acceptDeliveryTask(
      req.user.id,
      req.params.deliveryId
    );
    return sendSuccess(res, 200, 'Delivery task accepted', { delivery });
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const delivery = await deliveryService.getDeliveryById(
      req.user.id,
      req.user.role,
      req.params.deliveryId
    );
    return sendSuccess(res, 200, 'Delivery details retrieved', { delivery });
  } catch (error) {
    return next(error);
  }
}

async function getRoute(req, res, next) {
  try {
    const route = await deliveryService.getDeliveryRoute(
      req.user.id,
      req.user.role,
      req.params.deliveryId
    );
    return sendSuccess(res, 200, 'Delivery route retrieved', { route });
  } catch (error) {
    return next(error);
  }
}

async function updateLocation(req, res, next) {
  try {
    const location = await deliveryService.updateVolunteerLocation(
      req.user.id,
      req.params.deliveryId,
      req.body
    );
    return sendSuccess(res, 200, 'Live location updated', { location });
  } catch (error) {
    return next(error);
  }
}

async function stopLocation(req, res, next) {
  try {
    const result = await deliveryService.stopVolunteerLocation(
      req.user.id,
      req.params.deliveryId
    );
    return sendSuccess(res, 200, 'Location sharing stopped', result);
  } catch (error) {
    return next(error);
  }
}

async function confirmPickup(req, res, next) {
  try {
    const delivery = await deliveryService.confirmPickupByQr(
      req.user.id,
      req.params.deliveryId,
      req.body.token
    );
    return sendSuccess(res, 200, 'Pickup confirmed via QR token', { delivery });
  } catch (error) {
    return next(error);
  }
}

async function startTransit(req, res, next) {
  try {
    const delivery = await deliveryService.startTransit(
      req.user.id,
      req.params.deliveryId
    );
    return sendSuccess(res, 200, 'Delivery marked as in transit', { delivery });
  } catch (error) {
    return next(error);
  }
}

async function confirmDelivery(req, res, next) {
  try {
    const delivery = await deliveryService.confirmDeliveryByQr(
      req.user.id,
      req.params.deliveryId,
      req.body.token
    );
    return sendSuccess(res, 200, 'Delivery confirmed via QR token', { delivery });
  } catch (error) {
    return next(error);
  }
}

async function cancel(req, res, next) {
  try {
    const delivery = await deliveryService.cancelDelivery(
      req.user.id,
      req.user.role,
      req.params.deliveryId
    );
    return sendSuccess(res, 200, 'Delivery cancelled', { delivery });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  requestVolunteer,
  listAvailable,
  listMyDeliveries,
  acceptTask,
  getById,
  getRoute,
  updateLocation,
  stopLocation,
  confirmPickup,
  startTransit,
  confirmDelivery,
  cancel,
};
