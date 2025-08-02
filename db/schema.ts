import mongoose from "mongoose";
const { Schema } = mongoose;

const team = new Schema({
  name: String,
  designation: String,
  mobile: String,
  email: String,
});
const eventContact = new Schema({
  name: String,
  designation: String,
  mobile: String,
  email: String,
});
const social = new Schema({
  name: String,
  handle: String,
});
const eligibility = new Schema({
  name: String,
});
const event = new Schema({
  title: String,
  type: String,
  startDate: String,
  endDate: String,
  venue: String,
  time: String,
  about: String,
  contact: [eventContact],
  socialGroup: String,
})
const society = new Schema({
  name: String,
  username: String,
  logo: String,
  email: String,
  password: String,
  about: String,
  website: String,
  team: [team],
  social: [social],
  events: [event],
  auditionOpen: Boolean,
  eligibility: [eligibility],
});
const user = new Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  branch: String,
  section: String,
  batchStart: Number,
  batchEnd: Number,
  wishlist: [{ societyUsername: String }],
  reminders: [{ societyUsername: String }],
});

const User = mongoose.models.User || mongoose.model("User", user);
const Society = mongoose.models.Society || mongoose.model("Society", society);

export { User, Society };