const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    testimonial: {
        type: String,
        required: true,
    }
});

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

module.exports = Testimonial;
