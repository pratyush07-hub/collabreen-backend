const express = require("express");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectMongo = require("./config/connectMongo");
const path = require("path");
const userRouter = require("./routes/userRouter");
const testimonialRouter = require("./routes/testimonialRouter");
const blogRouter = require("./routes/blogRouter");
const meetingRouter = require("./routes/meetingRouter");
const influencerRouter = require("./routes/influencerRouter");
const brandRouter = require("./routes/brandRouter");
const campaignRouter = require("./routes/campaignRouter");
const creatorRouter = require('./routes/creatorProfileRoutes');
const { router: chatRouter } = require('./routes/chatRouter');

require("./crons/influencerCronJobs");
require("./crons/campaignCronJobs");
const fileURLToPath = require("url");
const app = express();
const { initializeSocket } = require('./socket/socketHandler');
// Validate ENV
if (!process.env.MONGO_URI || !process.env.PORT) {
    throw new Error("Missing MONGO_URI or PORT in .env");
}

// Connect DB
connectMongo(process.env.MONGO_URI);

// Middlewares
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true
}));

// Routes
app.use("/api/user", userRouter);
app.use("/api/testimonial", testimonialRouter);
app.use("/api/blog", blogRouter);
app.use("/api/meeting", meetingRouter);
app.use("/api/influencer", influencerRouter);
app.use("/api/brand", brandRouter);
app.use("/api/campaign", campaignRouter);
app.use('/api/creatorprofiles', creatorRouter);
app.use('/api/chats', chatRouter);
app.use('/api/collaborations', require('./routes/collaborationRoutes'));
app.use('/api/accepted-collaborations', require('./routes/acceptedCollaborationRouter'));
app.use('/api/groups', require('./routes/groupRoutes'));

app.use("/uploads", express.static(path.join(__dirname, "routes", "uploads")));

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Start Server
server.listen(process.env.PORT, () =>
    console.log(`✅ Server running at http://localhost:${process.env.PORT}`)
);
