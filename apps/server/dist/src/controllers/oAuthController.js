"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleConnectHandler = exports.oauthHanlder = exports.googleoauthHandler = void 0;
const userServices_1 = require("../services/userServices");
const database_1 = require("../config/database");
const User_1 = require("../model/User");
const jwt_1 = require("../utils/jwt");
const sessionServies_1 = require("../services/sessionServies");
const redisConnect_1 = require("../config/redisConnect");
const googleUrl_1 = require("../utils/googleUrl");
const drizzle_orm_1 = require("drizzle-orm");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const googleoauthHandler = async (req, res) => {
    const code = req.query.code;
    try {
        const { id_token, access_token, refresh_token } = await (0, userServices_1.getGoogleOAuthToken)({ code });
        const googleUser = await (0, userServices_1.getGoogleUser)({ id_token, access_token });
        if (!googleUser.verified_email) {
            return res
                .status(400)
                .send({ message: "Google account is not verified" });
        }
        const alreadyUser = await database_1.db
            .select()
            .from(User_1.users)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(User_1.users.gmailID, googleUser.email), (0, drizzle_orm_1.eq)(User_1.users.emailId, googleUser.email)))
            .limit(1);
        let tokenUser = {};
        let session_id = "";
        if (alreadyUser.length > 0 && alreadyUser[0].gmailID === googleUser.email) {
            tokenUser = {
                userID: alreadyUser[0].userID,
                name: alreadyUser[0].name,
                isVerified: alreadyUser[0].isVerified,
                isConnectedToGoogle: alreadyUser[0].isConnectedToGoogle,
            };
            session_id = alreadyUser[0].userID.toString();
        }
        else if (alreadyUser.length > 0 &&
            alreadyUser[0].emailId === googleUser.email) {
            const User = await database_1.db
                .update(User_1.users)
                .set({
                isConnectedToGoogle: true,
                gmailID: googleUser.email,
            })
                .where((0, drizzle_orm_1.eq)(User_1.users.userID, alreadyUser[0].userID))
                .returning();
            tokenUser = {
                userID: User[0].userID,
                name: User[0].name,
                isVerified: User[0].isVerified,
                isConnectedToGoogle: User[0].isConnectedToGoogle,
            };
            session_id = User[0].userID.toString();
        }
        else {
            const User = await database_1.db
                .insert(User_1.users)
                .values({
                name: googleUser.name,
                emailId: googleUser.email,
                isVerified: true,
                isConnectedToGoogle: true,
                gmailID: googleUser.email,
            })
                .returning();
            session_id = User[0].userID.toString();
            tokenUser = {
                userID: User[0].userID,
                name: User[0].name,
                isVerified: User[0].isVerified,
                isConnectedToGoogle: User[0].isConnectedToGoogle,
            };
        }
        redisConnect_1.client.hset(session_id + "_google_token", {
            access_token,
            refresh_token,
        });
        const accessToken = (0, jwt_1.signJWT)({ tokenUser, session: session_id }, { expiresIn: "24h" });
        const refreshToken = (0, jwt_1.signJWT)({ tokenUser, session: session_id }, { expiresIn: "30d" });
        const session = await (0, sessionServies_1.createSession)(session_id, refreshToken, req.get("user-agent") || "", true, true);
        return res.redirect(`${process.env.WEB}/dashboard?access_token=${accessToken}&refresh_token=${refreshToken}`);
    }
    catch (err) {
        console.log(err);
    }
};
exports.googleoauthHandler = googleoauthHandler;
const oauthHanlder = (req, res) => {
    if (req.query.connect) {
        const googleUrl = (0, googleUrl_1.getGoogleUrl)("/google/connect");
        console.log(googleUrl);
        return res.redirect(googleUrl);
    }
    else {
        const googleUrl = (0, googleUrl_1.getGoogleUrl)("/auth/oauth/google");
        res.redirect(googleUrl);
    }
};
exports.oauthHanlder = oauthHanlder;
const googleConnectHandler = async (req, res) => {
    const code = req.query.code;
    try {
        const { id_token, access_token, refresh_token } = await (0, userServices_1.getGoogleOAuthToken)({ code });
        const googleUser = await (0, userServices_1.getGoogleUser)({ id_token, access_token });
        if (!googleUser.verified_email) {
            return res
                .status(400)
                .send({ message: "Google account is not verified" });
        }
        const alreadyUser = await database_1.db
            .select()
            .from(User_1.users)
            .where((0, drizzle_orm_1.eq)(User_1.users.gmailID, googleUser.email))
            .limit(1);
        if (alreadyUser.length > 0) {
            return res.status(400).send({
                message: "User already connected to google",
            });
        }
        const User = await database_1.db
            .update(User_1.users)
            .set({
            isConnectedToGoogle: true,
            gmailID: googleUser.email,
        })
            .where((0, drizzle_orm_1.eq)(User_1.users.userID, req.user.userID))
            .returning();
        redisConnect_1.client.hset(req.user.userID + "_google_token", {
            access_token,
            refresh_token,
        });
        const session_id = User[0].userID.toString();
        const tokenUser = {
            userID: User[0].userID,
            name: User[0].name,
            isVerified: User[0].isVerified,
            isConnectedToGoogle: User[0].isConnectedToGoogle,
        };
        const accessToken = (0, jwt_1.signJWT)({ tokenUser, session: session_id }, { expiresIn: "24h" });
        const refreshToken = (0, jwt_1.signJWT)({ tokenUser, session: session_id }, { expiresIn: "30d" });
        const session = await (0, sessionServies_1.createSession)(session_id, refreshToken, req.get("user-agent") || "", true, true);
        return res.status(200).send({
            message: "Google account connected successfully",
            access_token: accessToken,
            refresh_token: refreshToken,
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.googleConnectHandler = googleConnectHandler;
//# sourceMappingURL=oAuthController.js.map