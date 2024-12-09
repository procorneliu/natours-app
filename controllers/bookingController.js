const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1. Check if user already booked this tour
  const userId = req.user.id;
  const book = await Booking.findOne({ user: userId, tour: req.params.tourId });

  if (book) {
    return next(new AppError('You have already booked this tour!', 400));
  }

  // 2. Get currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  const availableTourDates = [];
  tour.startDates.forEach((instance, i) => {
    const options = {
      year: 'numeric',
      month: 'long',
      weekday: 'long',
      day: 'numeric',
    };
    const dateOptions = {
      label: instance.date.toLocaleDateString('en-Us', options),
      value: i,
    };
    availableTourDates.push(dateOptions);
  });

  // 3. Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    // success_url: `${req.protocol}://${req.get('host')}/my-tours?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
    custom_fields: [
      {
        key: 'date',
        label: {
          type: 'custom',
          custom: 'Tour start date',
        },
        type: 'dropdown',
        dropdown: {
          options: availableTourDates,
        },
      },
    ],
  });

  // 4. Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

const createBookingCheckout = async session => {
  try {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.amount_total / 100;
    await Booking.create({ tour, user, price });

    // const customFieldValue = session.custom_fields[0].dropdown.value;
    // const result = Tour.findOneAndUpdate(
    //   { _id: tour },
    //   {
    //     $set: {
    //       'startDates.1.participants': 2,
    //     },
    //   },
    // );
    // console.log(result);

    const tourDoc = Tour.findById(tour);
    console.log(tour);
    console.log(tourDoc.startDates);
    // tourDoc.startDates[1].participants = 12;

    // await tourDoc.save();
  } catch (err) {
    console.log('Error creating booking:', err);
  }
};

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   const { tour, user, price } = req.query;

//   if (!tour && !user && !price) return next();
//   await Booking.create({ tour, user, price });s

//   // Add participants to tour start date
//   // const tour = await Tour.findById(tour);

//   res.redirect(req.originalUrl.split('?')[0]);
// });

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  // eslint-disable-next-line no-undef
  if (event.type === 'checkout.session.completed') createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

exports.getTourBookings = catchAsync(async (req, res, next) => {
  const tourId = req.params.id;

  const bookings = await Booking.find({ tour: { id: { $in: tourId } } });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      data: bookings,
    },
  });
});

exports.checkIfUserBooked = catchAsync(async (req, res, next) => {
  // assign value depending on action
  const userId = req.user ? req.user.id : res.locals.user.id;
  const tourSlug = req.params.slug;
  const tour = await Tour.findOne({ slug: tourSlug });
  res.locals.tour = tour.id;

  // check if this specific user booked this specific tour
  const booking = await Booking.findOne({ user: userId, tour: tour.id });
  if (!booking) {
    res.locals.booked = 'never';
    return next();
  }

  // check if tour start date was passed
  const tourStartDate = tour.startDates[0].date.getTime();
  if (tourStartDate < Date.now()) {
    res.locals.booked = 'past';
    return next();
  }

  res.locals.booked = 'present';
  next();
});
