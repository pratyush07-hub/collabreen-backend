const express = require("express")
const {checkAuth} = require("../middlewares/auth")
const { handleBlogCreate } = require("../controllers/blogController")

const blogRouter = express.Router()

blogRouter.post("/create-blog",checkAuth,handleBlogCreate)

blogRouter.get("/blogs")

blogRouter.get("/blog/:blogId")

blogRouter.get("/search-blogs/:query")

blogRouter.patch("/edit-blog/:blogId",checkAuth)

blogRouter.delete("/delete-blog/:blogId",checkAuth)


module.exports = blogRouter