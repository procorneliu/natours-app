/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  const stripe = Stripe(
    'pk_test_51QP2SORxBpYT9BfjQc5aEoaci6pS57lc44lVBTWvInfUC6FPEHU4dZaO5sy4Fsr2V6p5NUmpIM6iRwQFvE6oYtK3006gJR7tsi',
  );

  try {
    // 1. Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2. Render payment page
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
