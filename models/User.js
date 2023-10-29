const { Schema, model } = require("mongoose");
const { bcrypt } = require('bcrypt');

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
  },
  role: {
    type: String,
    enum: ["admin", "user", "guide"],
    default: "user",
  },
  passwordResetToken: String,
  passwordResetTokenExpiration: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date
  }
});

// userSchema.pre('save', async function(next) {
//     if(!this.isModified('hashedPass')) return next();
//     this.hashedPass = await bcrypt.hash(this.password, 10);
// })

userSchema.methods.createPassResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  // console.log({resetToken}, this.passwordResetToken);
  this.passwordResetTokenExpiration = Date.now() + 10 * 60 * 1000;
  return resetToken;
}

// QUERY MIDDLEWARE: before or after a certain query is executed
// the this keyword point to the current query, not the current document as inside the document middleware, because of the "find" hook it differenciate them
// for find, findOne, findOneById et...
userSchema.pre(/^find/, function (next) {
  // userSchema.pre('find', function(next) {
  this.find({ active: { $ne: false } });
  next();
});

// instance method - a method available on all documents of a certain collection
// userSchema.methods.correctPassword = async function(insertedPass, existingPass) {
//   return bcrypt.compare(insertedPass, existingPass);
// }



// userSchema.pre('save', function(next) {
//   if(!this.isModified('hashPassed') || this.isNew) return next();
//   this.hashedPass = Date.now();
//   next();
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
