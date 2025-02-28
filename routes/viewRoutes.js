const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.use(viewController.alerts);

router.get('/', authController.isLoggedIn, viewController.getOverview);

router.get(
  '/tour/:slug',
  authController.isLoggedIn,
  bookingController.checkIfUserBooked,
  reviewController.checkIfUserReviewed,
  viewController.getTour,
);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewController.getSignupForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);
// router.get('/my-tours', bookingController.createBookingCheckout, authController.protect, viewController.getMyTours);

router.post('/submit-user-data', authController.protect, viewController.updateUserData);

module.exports = router;
