const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));

// READ JSON FILE

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const newTours = JSON.parse(fs.readFileSync(`${__dirname}/tours_test2.json`, 'utf-8'));

// IMPORT DATE TO DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    console.log('Data successfully added!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// IMPORT TOURS TO DATABASE
const importTours = async () => {
  try {
    await Tour.create(newTours);

    console.log('Tours successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// IMPORT TOURS TO DATABASE
const importReviews = async () => {
  try {
    await Tour.create(reviews);

    console.log('Reviews successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DATABASE
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('All data are successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL TOURS FROM DATABASE
const deleteTours = async () => {
  try {
    await Tour.deleteMany();

    console.log('All tours are successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL TOURS FROM DATABASE
const deleteReviews = async () => {
  try {
    await Review.deleteMany();

    console.log('All reviews are successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else if (process.argv[2] === '--import-tours') {
  importTours();
} else if (process.argv[2] === '--delete-tours') {
  deleteTours();
} else if (process.argv[2] === '--import-reviews') {
  importReviews();
} else if (process.argv[2] === '--delete-reviews') {
  deleteReviews();
}

console.log(process.argv);
