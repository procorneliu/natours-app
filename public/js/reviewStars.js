/* eslint-disable */

const reviewStars = document.querySelectorAll('.rating-radio');
const currentRating = document.getElementById('current-rating');

export const setRating = () => {
  reviewStars.forEach(el =>
    el.addEventListener('click', e => {
      currentRating.textContent = e.target.value;
    }),
  );
};
