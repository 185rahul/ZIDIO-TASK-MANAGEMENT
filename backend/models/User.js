const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Please add a name"] // Frontend se 'name' aana zaroori hai
  },
  email: { 
    type: String, 
    required: [true, "Please add an email"], 
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email"
    ]
  },
  password: { 
    type: String, 
    required: [true, "Please add a password"],
    minlength: 6 // Security ke liye minimum length
  },
}, {
  timestamps: true // Isse 'createdAt' aur 'updatedAt' apne aap add ho jayenge
});

// Password ko save karne se pehle encrypt (hash) karne ka logic
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password match karne ke liye custom method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);