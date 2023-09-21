const { Schema, model } = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  fullName: {
    type: String,
    required: [true, "Please, provide your name"],
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "Please, provide your email"],
    unique: true,
    lowercase: true,
  },
  photo: String,
  hashedPass: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
  }
});

// userSchema.pre('save', async function(next) {
//     if(!this.isModified('hashedPass')) return next();
//     this.hashedPass = await bcrypt.hash(this.password, 10);
// })



userSchema.index(
  { email: 1 },
  {
    collation: {
      locale: "en",
      strength: 2,
    },
  }
);

const User = model("User", userSchema);
module.exports = User;
