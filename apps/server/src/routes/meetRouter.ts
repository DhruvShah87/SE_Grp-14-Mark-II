import { Router } from "express";
import { meetDashboard, scheduleMeetHandler } from "../controllers";
import { deleteMeet, editMeetDetails } from "../controllers";
import {
  requireAuth,
  authorizeMember,
  wsExist,
  meetExist,
  authorizeInvitee,
} from "../middleware";
import { showInvitees, getCalendarEvents } from "../controllers/meetController";

const router: Router = Router();

router
  .route("/:wsID/scheduleMeet")
  .post(requireAuth, wsExist, authorizeMember, scheduleMeetHandler);

router.route("/events").get(requireAuth, getCalendarEvents);

router
  .route("/workspace/:wsID/meet/:meetID/dashboard")
  .get(
    requireAuth,
    wsExist,
    authorizeMember,
    meetExist,
    authorizeInvitee,
    meetDashboard
  );

router
  .route("/:wsID/:meetID/editMeetDetails")
  .patch(requireAuth, wsExist, editMeetDetails)
  .delete(requireAuth, wsExist, deleteMeet);

export { router as meetRouter };
