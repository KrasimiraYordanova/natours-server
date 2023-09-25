const { Schema, model } = require("mongoose");
const crypto = require("crypto");

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
    enum: ["admin", "user"],
    default: "user",
  },
  passwordResetToken: String,
  passwordResetTokenExpiration: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
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
