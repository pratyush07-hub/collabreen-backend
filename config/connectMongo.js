const mongoose = require("mongoose")

async function connectMongo(url) {
    await mongoose.connect(url)
    .then(()=>console.log("Mongo Connected"))
    .catch(err => console.error("Mongo connection error:", err));
}

module.exports = connectMongo