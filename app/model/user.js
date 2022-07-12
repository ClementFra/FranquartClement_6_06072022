const mongoose = require(`mongoose`);

// model for user
const userSchema = mongoose.Schema({
    email:{type: String, required: true, unique: true},
    password:{type: String, required: true}
});

module.exports = mongoose("User", userSchema);
