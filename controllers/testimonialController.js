const Testimonial = require("../models/testimonial");

async function handleTestimonialCreate(req, res) {
  const testimonial = req.body.testimonial;
  if (!testimonial) {
    return res.status(404).json({ msg: "Testimonial is required" });
  }
  try {
    const newTestimonial = await Testimonial.create({
      userId: req.user.id,
      testimonial: testimonial,
    });
    if (!newTestimonial) {
      return res.status(500).json({ msg: "Error Creating Testimonial" });
    }
    return res.json({ msg: "Created Testimonial", newTestimonial });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error Creating Testimonial" });
  }
}

async function handleTestimonialGetAll(req, res) {
  const limit = parseInt(req.query.limit) || 10;

  try {
    const testimonials = await Testimonial.find({})
      .populate("userId", "name profilePic")
      .limit(limit);

    if (!testimonials) {
      return res.status(500).json({ msg: "Error Getting Testimonials" });
    }
    return res.json({ testimonials });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error Getting Testimonials" });
  }
}

async function handleTestimonialEdit(req, res) {
  const testimonial = req.body.testimonial;
  if (!testimonial) {
    return res.status(404).json({ msg: "Testimonial is required" });
  }
  try {
    const updatedTestimonial = await Testimonial.findOneAndUpdate(
      { userId: req.user.id },
      { testimonial: testimonial },
      { new: true }
    );

    if (!updatedTestimonial) {
      return res.status(404).json({ msg: "Testimonial not found for update" });
    }
    return res.json({
      msg: "Testimonial updated successfully",
      updatedTestimonial,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error Updating Testimonial" });
  }
}

async function handleTestimonialDelete(req, res) {
  try {
    const testimonial = await Testimonial.findOneAndDelete({
      userId: req.user.id,
    });

    if (!testimonial) {
      return res.status(404).json({ msg: "Testimonial not found" });
    }
    return res.json({
      msg: "Testimonial deleted successfully"});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error Deleting Testimonial" });
  }
}

module.exports = {
  handleTestimonialCreate,
  handleTestimonialGetAll,
  handleTestimonialEdit,
  handleTestimonialDelete
};
