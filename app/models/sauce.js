const mongoose = require(`mongoose`);

//model for sauces
const sauceSchema = mongoose.Schema({
    userId : {type: String , ref: "User", required: true},
    name: {type: String, required: true},
    manufacturer:{type: String, required: true},
    description:{type: String, required: true},
    mainPepper:{ type: String, required: true},
    imageUrl:{type: String, required: true},
    heat:{type: Number, required: true, min: 1, max: 10},
    likes:{type: Number, default: 0},
    dislikes:{type: String, default: 0},
    usersLiked:[{type: String, ref: "User"}],
    usersDisliked:[{type: String, ref:"User"}],
});

module.exports = mongoose.model(`Sauce`, sauceSchema);