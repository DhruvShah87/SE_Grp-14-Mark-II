import { Router } from "express";
import {
    createWorkspaceGet,
    createWorkspacePost,
    getWorkspace,
    addMembersPost,
    deleteWorkspaceGet,
    getPeople,
    getYourWork,
    getUpcoming,
    getStream,
} from "../controllers";

import{requireAuth, authorizeManager, authorizeMember} from "../middleware" 

const router: Router = Router();

router.route("/createWorkspace")
    .get(requireAuth, createWorkspaceGet)
    .post(requireAuth, createWorkspacePost);

// router.use("/api", meetRouter);
// router.route("/:wsid")
//     .get(requireAuth, authorizeMember, getWorkspace);

router.route("/:wsID/stream")
    .get(requireAuth, authorizeMember, getStream);
router.route("/:wsID/people")
    .get(requireAuth, authorizeMember, getPeople);
router.route("/:wsID/yourWork")
    .get(requireAuth, authorizeMember, getYourWork);
// router.route("/:wsid/upcoming")
//     .get(requireAuth, authorizeMember, getUpcoming);

router.route("/addMembers")
    .post(requireAuth, authorizeManager, addMembersPost); 

router.route("/:wsid/deleteWorkspace")
    .get(requireAuth, authorizeManager, deleteWorkspaceGet);

export { router as workspaceRouter };
