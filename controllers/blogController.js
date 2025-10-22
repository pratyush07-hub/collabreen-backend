const Blog = require("../models/blog");

async function handleBlogCreate(req, res) {
  const { title, description, duration, content, image, categories } = req.body;
  if (
    !title ||
    !description ||
    !duration ||
    !content ||
    !image ||
    !categories
  ) {
    return res.status(400).json({ msg: "All Fields Are Required" });
  }
  try {
    const newBlog = await Blog.create({
      title: title,
      description: description,
      duration: duration,
      content: content,
      image: image,
      categories: categories,
      authorId: req.user.id,
      author: req.user.name,
    });

    if (!newBlog) {
      return res.status(500).json({ msg: "Error Creating New Blog" });
    }

    return res.json({ msg: "New Blog Created", newBlog });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ msg: "Error Creating New Blog", error: err.message });
  }
}

async function handleBlogGetAll(req, res) {
  try {
    const blogs = await Blog.find({});
    if (blogs.length === 0) {
      return res.status(404).json({ msg: "No blogs found" });
    }
    return res.json(blogs);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ msg: "Error getting blogs", error: err.message });
  }
}


async function handleBlogGetById(req, res) {
    const {blogId}=req.params
    try {
        const blog = await Blog.findOne({_id:blogId})
        if(!blog){
            return res.status(404).json({msg:"Blog Not Found"})
        }
        return res.json(blog)
    } catch (err) {
        console.error(err)
        return res.status(500).json({msg:"Error Retrieving Blog",error: err.message })
    }
}

async function handleBlogSearch(req, res) {
    const { query } = req.params;

    if (!query || query.trim() === '') {
        return res.status(400).json({ msg: "Search query cannot be empty" });
    }

    try {
        const regex = new RegExp(query, 'i');
        const blogs = await Blog.find({
            $or: [
                { title: { $regex: regex } },
                { description: { $regex: regex } },
                { content: { $regex: regex } },
                { categories: { $regex: regex } }
            ]
        });

        if (blogs.length === 0) {
            return res.status(404).json({ msg: "No blogs found matching your search" });
        }

        return res.json(blogs);
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Error searching blogs", error: err.message });
    }
}

async function handleBlogEdit(req, res) {
  const { blogId } = req.params;
  const { content, title, description, duration, image, categories } = req.body;

  if (!content && !title && !description && !duration && !image && !categories) {
    return res.status(400).json({ msg: "At least one field must be provided to update the blog" });
  }

  try {
    const updateData = {};
    if (content) updateData.content = content;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (duration) updateData.duration = duration;
    if (image) updateData.image = image;
    if (categories) updateData.categories = categories;

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, updateData, { new: true });
    
    if (!updatedBlog) {
      return res.status(404).json({ msg: "Blog not found" });
    }

    return res.json({ msg: "Blog updated successfully", updatedBlog });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error Editing Blog" });
  }
}


async function handleBlogDelete(req, res) {
  const { blogId } = req.params;
  if (!blogId) {
    return res.status(400).json({ msg: "Invalid Blog Id or Blog Not Found" });
  }
  
  try {
    const blog = await Blog.findOneAndDelete({ _id: blogId });
    if (!blog) {
      return res.status(404).json({ msg: "Blog Not Found" });
    }

    return res.json({ msg: "Blog Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server Error" });
  }
}



module.exports = {
  handleBlogCreate,
  handleBlogGetAll,
  handleBlogGetById,
  handleBlogSearch,
  handleBlogEdit,
  handleBlogDelete,
};
