import { Request, Response } from "express";

import { db } from "../config/database";
import { users } from "../model/User";
import { and, or, eq, gte, sql } from "drizzle-orm";

import { sendInvitation } from "../services/sendInvitation";


import { workspaces } from "../model/Workspace";
import { members } from "../model/Workspace";
import { assignees } from "../model/TaskAssignee";
import { tasks } from "../model/Task";

import { wsTokenOptions } from "../services/workspaceServices";
import { invitees } from "../model/MeetInvitee";
import { meets } from "../model/Meet";
// import { streamObject } from "../model/streamObject";

export const getStream = async (req: Request, res: Response) => {
  const wsID = parseInt(req.params.wsID, 10);
  if (isNaN(wsID) || !Number.isInteger(wsID)) {
    return res.status(400).send({ message: "Invalid workspace ID" });
  }

  try {
    const taskStream = await db
      .select()
      .from(tasks)
      .where(eq(tasks.workspaceID, wsID));
    // console.log(taskStream);

    const meetStream = await db
      .select()
      .from(meets)
      .where(eq(meets.workspaceID, wsID));
    // console.log(meetStream);

    interface streamObject {
      objectID: number;
      objectType: string; // Type can be "task" or "meet"
      objectTitle: string;
      objectStatus: string | null;
      created_at: Date;
    }

  
    const Stream : streamObject[] = [
      ...taskStream.map((task) => ({
        objectID : task.taskID,
        objectType: "Task",
        objectTitle: task.title,
        objectStatus : task.status ? task.status : null,
        // objectTime: task.deadline ? new Date(task.deadline) : null,
        created_at: task.createdAt,
      })),
      ...meetStream.map((meet) => ({
        objectID : meet.meetID,
        objectType: "Meet",
        objectTitle: meet.title,
        objectStatus : null,
        // objectTime: meet.meetTime ? new Date(meet.meetTime) : null,
        created_at: meet.createdAt,
      })),
    ];

    Stream.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    // console.log(Stream);

    res.json(Stream);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal server error in stream" });
  }
};

export const getPeople = async (req: Request, res: Response) => {
  const wsID = parseInt(req.params.wsID, 10);
  // console.log(wsID);
  // const wsID = req.params.wsID;
  if (isNaN(wsID) || !Number.isInteger(wsID)) {
    return res.status(400).send({ message: "Invalid workspace ID" });
  }

  // const user_id = req.user.userID;
  try {
    const Workspace = await db 
    .select({
      title: workspaces.title,
      description : workspaces.description,
      progress: workspaces.progress,
      projectManage: users.name,
      type : workspaces.title,
      created_at : workspaces.createdAt,
    })
    .from(workspaces)
    .innerJoin(users,eq(workspaces.projectManager,users.userID))
    .where(eq(workspaces.workspaceID,wsID));
    
    const Manager = await db
      .select({
        userID: users.userID,
        userName : users.name,
        emailID: users.emailId,
        role: members.role,
      })
      .from(members)
      .innerJoin(users, eq(members.memberID, users.userID))
      .where(and(eq(members.workspaceID, wsID), eq(members.role, 4)));
    // console.log(Manager);

    const Teammate = await db
      .select({
        userID: members.memberID,
        userName : users.name,
        emailID: users.emailId,
        role: members.role,
      })
      .from(members)
      .innerJoin(users, eq(members.memberID, users.userID))
      .where(and(eq(members.workspaceID, wsID), eq(members.role, 0)));
    // console.log(Teammate);

    const Client = await db
      .select({
        userID: members.memberID,
        userName : users.name,
        emailID: users.emailId,
        role: members.role,
      })
      .from(members)
      .innerJoin(users, eq(members.memberID, users.userID))
      .where(and(eq(members.workspaceID, wsID), eq(members.role, 2)));
    // console.log(Teammate);

    const Collaborator = await db
      .select({
        userID: members.memberID,
        userName : users.name,
        emailID: users.emailId,
        role: members.role,
      })
      .from(members)
      .innerJoin(users, eq(members.memberID, users.userID))
      .where(and(eq(members.workspaceID, wsID), eq(members.role, 1)));
    // console.log(Teammate);

    const People = {
      Manager: Manager,
      Teammate: Teammate,
      Collaborator: Collaborator,
      Client: Client,
    };
    // console.log(People);

    return res.json({Workspace : Workspace[0],People : People});
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal server error in people" });
  }
};

export const getYourWork = async (req: Request, res: Response) => {
  const wsID = parseInt(req.params.wsID, 10);
  const user_id = req.user.userID;

  const Work = await db
    .select({
      taskID: tasks.taskID,
      taskTitle: tasks.title,
      taskStatus: tasks.status,
      taskDeadline: tasks.deadline,
      taskType: tasks.taskType,
    })
    .from(tasks)
    .innerJoin(assignees, eq(tasks.taskID, assignees.taskID))
    .where(
      and(eq(assignees.workspaceID, wsID), eq(assignees.assigneeID, user_id))
    );

  console.log(Work);
  res.json(Work);
};

export const getUpcoming = async (req: Request, res: Response) => {
  const wsID = parseInt(req.params.wsID, 10);
  if (isNaN(wsID) || !Number.isInteger(wsID)) {
    return res.status(400).send({ message: "Invalid workspace ID" });
  }
  const user_id = req.user.userID;

  try {
    const currentTimestamp = new Date();

    const upcomingTask = await db
      .select({
        taskID: tasks.taskID,
        taskTitle: tasks.title,
        taskStatus: tasks.status,
        taskDeadline: tasks.deadline,
        taskType: tasks.taskType,
      })
      .from(tasks)
      .innerJoin(assignees, eq(tasks.taskID, assignees.taskID))
      .innerJoin(workspaces, eq(tasks.workspaceID, workspaces.workspaceID))
      .where(
        and(
          eq(assignees.workspaceID, wsID),
          or(
            eq(assignees.assigneeID, user_id),
            eq(workspaces.projectManager, user_id)
          ),
          gte(
            tasks.deadline, // Convert deadline to a timestamp
            currentTimestamp // Use the current timestamp
          )
        )
      );
    // .orderBy(tasks.deadline);

    // console.log(upcomingTask);

    const upcomingMeet = await db
      .select({
        meetID: meets.meetID,
        meetTitle: meets.title,
        meetTime: meets.meetTime,
        meetDuration: meets.duration,
      })
      .from(meets)
      .innerJoin(invitees, eq(meets.meetID, invitees.meetID))
      .innerJoin(workspaces, eq(meets.workspaceID, workspaces.workspaceID))
      .where(
        and(
          eq(invitees.workspaceID, wsID),
          or(
            eq(invitees.inviteeID, user_id),
            eq(workspaces.projectManager, user_id)
          ),
          gte(
            meets.meetTime, // Convert deadline to a timestamp
            currentTimestamp // Use the current timestamp
          )
        )
      );
    // .orderBy(new Date(meets.meetTime).getTime());

    // console.log(upcomingMeet);

    const Upcomig = {
      upcomingMeet: upcomingMeet,
      upcomingTask: upcomingTask,
    };
    res.json(Upcomig);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ message: "Internal server error in upcoming" });
  }
};

export const editWSDetailsGet = async(req:Request, res:Response) =>{
  const wsID:any = req.params.wsID;
 
  try {
    const Workspace = await db
    .select( {
      title: workspaces.title,
      description: workspaces.description,
      type: workspaces.type})
    .from(workspaces)
    .where(eq(workspaces.workspaceID, wsID))
    .limit(1);

    res.json(Workspace);


  } catch (error) {
    console.log(error);
   return res
     .status(500)
     .send({ message: "Internal server error in workspace" });
  }
}

export const editWsDetailsPATCH = async(req:Request, res:Response) => {
  const wsID:any = req.params.wsID;
  const userID:any = req.user.userID;
  // const toDo:any = req.params.action;

 

 const {title, description, type} = req.body;


 try{
 await db
   .update(workspaces)
   .set({
     title: title,
     description:description,
     type: type
   })
   .where(eq(workspaces.workspaceID, wsID));

    res.send({ message: "Settings Saved" });
     
   }
   
 catch(error){
   console.log(error);
   return res
     .status(500)
     .send({ message: "Internal server error in workspace" });
 }
}

export const editWSMembersGet = async(req: Request, res: Response) =>{
 const wsID:any = req.params.wsID;

 
try {
  const Members = await db
  .select({
    Name: users.name,
    Role: members.role
  })
  .from(members)
  .where(eq(members.workspaceID, wsID))
  .innerJoin(users, eq(users.userID, members.memberID));

  res.status(200).send({Members: Members});
} catch (error) {
  console.log(error);
  return res
    .status(500)
    .send({ message: "Internal server error in workspace" });
}

}

export const editWSMembersPATCH = async(req: Request, res: Response) =>{
  const wsID:any = req.params.wsID;
  const userID:any = req.user.userID;
  const {Members = []} = req.body;
  const unregisteredMembers: string[] = [];
  try {
    
    const Workspace = await db
    .select( {
      title: workspaces.title,
      description: workspaces.description,
      type: workspaces.type})
    .from(workspaces)
    .where(eq(workspaces.workspaceID, wsID))
    .limit(1);

    await db
     .delete(members)
     .where(eq(members.workspaceID, wsID))
    
    await db
      .insert(members)
      .values({
        workspaceID: wsID,
        memberID: userID,
        role: 4
      })
   
     for (const Member of Members) {
       const { member_id, Role } = Member;

       const User = await db
         .select()
         .from(users)
         .where(eq(users.emailId, member_id))
         .limit(1);

       if (User.length === 0) {
         // Handle unregistered team members
         unregisteredMembers.push(member_id);
       } 
       else {
       
           console.log("Inserting");
           await db.insert(members).values({
             workspaceID: wsID,
             memberID: User[0].userID,
             role: Role,
           });
         
         }
       }
     
     if (unregisteredMembers.length > 0) {
       const projectManager = await db
         .select()
         .from(users)
         .where(eq(users.userID, userID))
         .limit(1);

      

      //  await sendInvitation(
      //    projectManager[0].name,
      //    Workspace[0].title,
      //    unregisteredMembers
      //  );

       res.status(201).send({
         message: " Settings Saved With Unregistered Members Invited",
         unregisteredMembers,
       });

     } else {
       res.send({ message: "Settings Saved" });
     }




  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: "Internal server error in workspace" });
  }
}

export const deleteWorkspaceDELETE = async (req: Request, res: Response) => {
  try {
    // checking for requests
    const wsID  = req.params.wsID;
    if (!wsID) {
      res.send({ message: "Please enter your workspaceID a" });
    }

    const toDelete = wsID;
    const userID:any = req.user.userID

    // Finding the workspace inside database.
    const currentWorkspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.workspaceID, wsID as any))
      .limit(1);

      if (currentWorkspace.length<1) {
        return res.status(400).send({ error: "No such Workspace found" });
      }
    
    // check if the user requesting the deletion is the manager of that workspace.
    if ((userID) !== currentWorkspace[0].projectManager) {
      res.send({ message: "You are not Project Manager" });
    }


    const deletedWorkspace = await db.delete(workspaces).where(eq(wsID as any, workspaces.workspaceID));

    res.send("Workspace deleted successfully");

  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ message: "Internal server error in workspace" });
  }
};


export const deleteMembers = async (req: Request, res: Response) => {
  try {

    // const { workspaceID , memberID } = req.body;
    // if (!workspaceID || !memberID) {
    //   res.send({ message: "Please enter workspaceID and memberID" });
    // }

    // const toDeletemember = memberID;
    // const toDeletews = workspaceID;

    // const currentMember = await db
    //   .select()
    //   .from(members)
    //   .where(eq(members.workspaceID, toDeletews) && eq(toDeletemember,members.memberID))
    //   .limit(1);

    // await db.delete(members).where(eq(members.workspaceID, toDeletews) && eq(toDeletemember,members.memberID));

    res.send("Member deleted successfully");

  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ message: "Internal server error in member" });
  }
};