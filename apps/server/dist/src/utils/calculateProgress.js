"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProjectProgress = void 0;
const Task_1 = require("../model/Task");
const database_1 = require("../config/database");
const drizzle_orm_1 = require("drizzle-orm");
const Workspace_1 = require("@server/model/Workspace");
const calculateProjectProgress = async (wsID) => {
    const tTask = await database_1.db
        .select()
        .from(Task_1.tasks)
        .where((0, drizzle_orm_1.eq)(Task_1.tasks.workspaceID, wsID));
    const totalTasks = tTask.length;
    var Progress;
    if (totalTasks === 0) {
        Progress = 0;
    }
    else {
        const cTask = await database_1.db
            .select()
            .from(Task_1.tasks)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(Task_1.tasks.workspaceID, wsID), (0, drizzle_orm_1.eq)(Task_1.tasks.status, "Done")));
        const completedTasks = cTask.length;
        Progress = (completedTasks / totalTasks) * 100;
    }
    await database_1.db.update(Workspace_1.workspaces)
        .set({ progress: Progress })
        .where((0, drizzle_orm_1.eq)(Workspace_1.workspaces.workspaceID, wsID));
};
exports.calculateProjectProgress = calculateProjectProgress;
//# sourceMappingURL=calculateProgress.js.map