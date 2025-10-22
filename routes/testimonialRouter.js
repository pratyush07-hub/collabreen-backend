const express = require("express")
const {checkAuth} = require("../middlewares/auth")
const { handleTestimonialCreate, handleTestimonialGetAll, handleTestimonialEdit, handleTestimonialDelete } = require("../controllers/testimonialController")
const testimonialRouter = express.Router()

testimonialRouter.post("/create-testimonial",checkAuth,handleTestimonialCreate)

testimonialRouter.get("/get-testimonials",handleTestimonialGetAll)

testimonialRouter.patch("/edit-testimonial",checkAuth,handleTestimonialEdit)

testimonialRouter.delete("/delete-testimonial",checkAuth,handleTestimonialDelete)

module.exports = testimonialRouter