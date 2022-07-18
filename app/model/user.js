const mongoose = require(`mongoose`);
const uniqueValidator = require(`mongoose-unique-validator`);

// model for user
const userSchema = mongoose.Schema({
    email:{type: String, required: true, unique: true},
    password:{type: String, required: true}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose("User", userSchema);
