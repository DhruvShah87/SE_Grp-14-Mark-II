import { signUpHandler, verifyUserHandler, loginHandler, logoutHandler, forgotPasswordPost, resetPasswordPost, resendOtp, changePassword, checkAuth } from "./authController";
import { googleoauthHandler, oauthHanlder } from "./oAuthController";
import { createWorkspacePost, getWorkspace } from "./workspaceController";
import { dashboardGet, profileGet, profileDELETE, profilePATCH } from "./dashboardController";
import { deleteMeet, scheduleMeetHandler, showInvitees, editMeetDetails } from "./meetController";
import { assignTaskGet, assignTaskPost, getTask, showAssignees, editTaskDetailsGet, editTaskDetailsPATCH, editTaskAssigneesGet, editTaskAssigneesPATCH, deleteTask } from "./taskController";
import { taskDashboard } from "./taskDashboard";
import { meetDashboard } from "./meetDashboard";
import { getPeople, getYourMeet, getYourWork, getStream, editWSDetailsGet, editWsDetailsPATCH, editWSMembersGet, editWSMembersPATCH, deleteWorkspaceDELETE, getAllPeople } from "./wsDashboardcontroller";
export { signUpHandler, verifyUserHandler, loginHandler, googleoauthHandler, checkAuth, forgotPasswordPost, resetPasswordPost, resendOtp, changePassword, logoutHandler, createWorkspacePost, getWorkspace, deleteWorkspaceDELETE, dashboardGet, assignTaskGet, assignTaskPost, getTask, showAssignees, profileGet, oauthHanlder, getPeople, getYourWork, getYourMeet, getStream, deleteMeet, editWSDetailsGet, editWsDetailsPATCH, editWSMembersGet, editWSMembersPATCH, showInvitees, editTaskDetailsGet, editTaskDetailsPATCH, editTaskAssigneesGet, editTaskAssigneesPATCH, profilePATCH, profileDELETE, deleteTask, taskDashboard, meetDashboard, editMeetDetails, scheduleMeetHandler, getAllPeople, };
