const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.setTourAndUserID = async (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour && req.params.tourId) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// Hide "Leave your review" form if user already left a review
exports.checkIfUserReviewed = catchAsync(async (req, res, next) => {
  // if user don't booked this tour, just return
  // if (!res.locals.booked) return next();

  const userId = res.locals.user.id;
  const tourId = res.locals.tour;

  const review = await Review.findOne({ user: userId, tour: tourId });
  if (review) {
    res.locals.reviewed = true;
    return next();
  }

  res.locals.reviewed = false;
  next();
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
