"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspace = exports.createWorkspacePost = void 0;
const database_1 = require("../config/database");
const User_1 = require("../model/User");
const drizzle_orm_1 = require("drizzle-orm");
const Workspace_1 = require("../model/Workspace");
const redisConnect_1 = require("../config/redisConnect");
const createWorkspacePost = async (req, res) => {
    var { title, type, description, members: Members = [] } = req.body;
    if (!title) {
        return res.status(400).send({ error: "Title is required" });
    }
    const userID = req.user.userID;
    const unregisteredMembers = [];
    const registeredMembers = [];
    const ProjectManager = await database_1.db
        .select()
        .from(User_1.users)
        .where((0, drizzle_orm_1.eq)(User_1.users.userID, userID))
        .limit(1);
    console.log(ProjectManager);
    try {
        const workspace_id = await database_1.db
            .insert(Workspace_1.workspaces)
            .values({
            title: title,
            type: type,
            description: description,
            projectManager: ProjectManager[0].userID,
        })
            .returning({ workspace_id: Workspace_1.workspaces.workspaceID });
        console.log(workspace_id[0].workspace_id);
        const projectmanger_id = await database_1.db
            .insert(Workspace_1.members)
            .values({
            workspaceID: workspace_id[0].workspace_id,
            memberID: ProjectManager[0].userID,
            role: "Manager",
        })
            .returning({ projectmanger_id: Workspace_1.members.memberID });
        for (const Member of Members) {
            const { Email, Role } = Member;
            const User = await database_1.db
                .select()
                .from(User_1.users)
                .where((0, drizzle_orm_1.eq)(User_1.users.emailId, Email))
                .limit(1);
            if (User.length === 0) {
                unregisteredMembers.push(Email);
            }
            else {
                registeredMembers.push(Email);
                await database_1.db.insert(Workspace_1.members).values({
                    workspaceID: workspace_id[0].workspace_id,
                    memberID: User[0].userID,
                    role: Role,
                });
            }
        }
        if (unregisteredMembers.length > 0) {
            res.status(201).send({
                message: "Workspace Created with Unregistered Members",
                UnregisteredMember: unregisteredMembers,
                RegisteredMember: registeredMembers,
            });
        }
        else {
            res.status(201).send({ message: "Workspace Created successfully" });
        }
    }
    catch (err) {
        console.log(err);
        return res
            .status(500)
            .send({ message: "Internal server error in workspace" });
    }
};
exports.createWorkspacePost = createWorkspacePost;
const getWorkspace = async (req, res) => {
    const wsID = parseInt(req.params.wsID, 10);
    try {
        const cachedData = await redisConnect_1.client.get(`workspace:${wsID}`, async (err, data) => {
            if (err)
                throw err;
            return data;
        });
        if (cachedData) {
            return res.status(200).send(JSON.parse(cachedData));
        }
        const workspace = await database_1.db
            .select({
            title: Workspace_1.workspaces.title,
            description: Workspace_1.workspaces.description,
            projectManager: User_1.users.name,
            projectManagerID: Workspace_1.workspaces.projectManager,
            progress: Workspace_1.workspaces.progress,
        })
            .from(Workspace_1.workspaces)
            .where((0, drizzle_orm_1.eq)(Workspace_1.workspaces.workspaceID, wsID))
            .innerJoin(User_1.users, (0, drizzle_orm_1.eq)(Workspace_1.workspaces.projectManager, User_1.users.userID))
            .limit(1);
        await redisConnect_1.client.set(`workspace:${wsID}`, JSON.stringify(workspace), "EX", 60 * 15);
        res.json(workspace);
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .send({ message: "Internal server error in workspace" });
    }
};
exports.getWorkspace = getWorkspace;
//# sourceMappingURL=workspaceController.js.map