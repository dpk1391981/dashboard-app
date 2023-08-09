const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

let mongoURI = process.env.NODE_ENV == "production" ? db["production"] : db["local"];

console.log(`mongoURI`);
console.log(mongoURI);
console.log(process.env.NODE_ENV);
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log(`MongoDB Connected...`);
  } catch (error) {
    console.log(`Error @connectDB: ${error.message}`);

    //Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
