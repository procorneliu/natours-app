/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const postReview = async data => {
  try {
    const url = '/api/v1/reviews';

    const res = await axios({
      method: 'POST',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Review successfully sent!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
