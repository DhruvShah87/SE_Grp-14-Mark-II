import { Request, Response } from "express";
import { db } from "../config/database";
import { users } from "../model/User";
import { and, eq } from "drizzle-orm";

import { meets } from "../model/Meet";
import { invitees } from "../model/MeetInvitee";

import { members } from "../model/Workspace";

import { client as redisClient } from "../config/redisConnect";

export const meetDashboard = async (req: Request, res: Response) => {
  try {
    const wsID = req.workspace.workspaceID;
    const meetID = req.meet.meetID;

    // const cachedMeet = await redisClient.get(`meet:${meetID}`, (err, data) => {
    //   if (err) {
    //     console.log(err);
    //     return res.status(500).send({ message: "Internal server error" });
    //   }
    //   return data;
    // });

    // if (cachedMeet) {
    //   console.log("cached");
    //   return res.status(200).json(JSON.parse(cachedMeet));
    // }

    const Meet = await db
      .select()
      .from(meets)
      .where(and(eq(meets.meetID, meetID), eq(meets.workspaceID, wsID)))
      .limit(1);
    console.log(Meet);

    const Invitees = await db
      .select({
        inviteesID: invitees.inviteeID,
        inviteesName: users.name,
        inviteesRole: members.role,
        inviteesEmailID: users.emailId,
      })
      .from(invitees)
      .innerJoin(users, eq(invitees.inviteeID, users.userID))
      .innerJoin(
        members,
        and(
          eq(invitees.inviteeID, members.memberID),
          eq(invitees.workspaceID, members.workspaceID)
        )
      )
      .where(and(eq(invitees.meetID, meetID), eq(invitees.workspaceID, wsID)));

    const meetDashboard = {
      meet: Meet[0],
      manager: req.workspace.projectManager,
      Invitees: Invitees,
    };

    await redisClient.set(
      `meet:${meetID}`,
      JSON.stringify(meetDashboard),
      "EX",
      60 * 60 * 24
    );

    res.send({
      meet: meetDashboard.meet,
      Invitees: meetDashboard.Invitees,
      manager: meetDashboard.manager,
      isOrganizer: Meet[0].organizerID === req.user.userID,
      isManager: req.workspace.projectManager === req.user.userID,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ message: "Internal server error in meet dashboard" });
  }
};
