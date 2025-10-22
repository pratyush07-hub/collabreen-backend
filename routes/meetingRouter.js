const express = require("express");

const { checkAuth } = require("../middlewares/auth");

const {
  handleMeetingCreate,
  handleMeetingGetAll,
  handleMeetingGetById,
  handleMeetingEdit,
  handleMeetingDelete,
  handleMeetingGetByDate,
  handleMeetingSearch,
  handleMeetingGetByPlatform,
} = require("../controllers/meetingController");

const meetingRouter = express.Router();

meetingRouter.post("/create-meeting", checkAuth, handleMeetingCreate);

meetingRouter.get("/meetings", checkAuth, handleMeetingGetAll);

meetingRouter.get("/meeting/:meetingId", checkAuth, handleMeetingGetById);

meetingRouter.patch("/edit-meeting/:meetingId", checkAuth, handleMeetingEdit);

meetingRouter.delete("/delete-meeting/:meetingId",checkAuth,handleMeetingDelete);

meetingRouter.get("/meetings-by-date/:date", checkAuth, handleMeetingGetByDate);

meetingRouter.get("/search-meetings/:query", checkAuth, handleMeetingSearch);

meetingRouter.get("/meetings-by-platform/:platform",checkAuth,handleMeetingGetByPlatform);

module.exports = meetingRouter;