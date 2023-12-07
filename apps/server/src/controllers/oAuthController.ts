import { Request, Response } from "express";
import { getGoogleOAuthToken, getGoogleUser } from "../services/userServices";
import { db } from "../config/database";
import { users } from "../model/User";
import { signJWT } from "../utils/jwt";
import { createSession } from "../services/sessionServies";
import { client as redisClient } from "../config/redisConnect";
import { getGoogleUrl } from "../utils/googleUrl";
import { eq, or } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

export const googleoauthHandler = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  try {
    const { id_token, access_token, refresh_token } = await getGoogleOAuthToken(
      { code }
    );

    const googleUser = await getGoogleUser({ id_token, access_token });

    if (!googleUser.verified_email) {
      return res
        .status(400)
        .send({ message: "Google account is not verified" });
    }

    const alreadyUser = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.gmailID, googleUser.email),
          eq(users.emailId, googleUser.email)
        )
      )
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
    } else if (
      alreadyUser.length > 0 &&
      alreadyUser[0].emailId === googleUser.email
    ) {
      const User = await db
        .update(users)
        .set({
          isConnectedToGoogle: true,
          gmailID: googleUser.email,
        })
        .where(eq(users.userID, alreadyUser[0].userID))
        .returning();

      tokenUser = {
        userID: User[0].userID,
        name: User[0].name,
        isVerified: User[0].isVerified,
        isConnectedToGoogle: User[0].isConnectedToGoogle,
      };
      session_id = User[0].userID.toString();
    } else {
      const User = await db
        .insert(users)
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

    redisClient.hset(session_id + "_google_token", {
      access_token,
      refresh_token,
    });

    const accessToken = signJWT(
      { tokenUser, session: session_id },
      { expiresIn: "24h" }
    );

    const refreshToken = signJWT(
      { tokenUser, session: session_id },
      { expiresIn: "30d" }
    );

    const session = await createSession(
      session_id,
      refreshToken,
      req.get("user-agent") || "",
      true,
      true
    );

    return res.redirect(
      `${process.env.WEB}/dashboard?access_token=${accessToken}&refresh_token=${refreshToken}`
    );

    // return res.status(200).send({
    //   message: "Login Successful",
    //   access_token: accessToken,
    //   refresh_token: refreshToken,
    // });
  } catch (err) {
    console.log(err);
  }
};

export const oauthHanlder = (req: Request, res: Response) => {
  if (req.query.connect) {
    const googleUrl = getGoogleUrl("/google/connect");
    console.log(googleUrl);
    return res.redirect(googleUrl);
  } else {
    const googleUrl = getGoogleUrl("/auth/oauth/google");
    res.redirect(googleUrl);
  }
};

export const googleConnectHandler = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  try {
    const { id_token, access_token, refresh_token } = await getGoogleOAuthToken(
      { code }
    );

    const googleUser = await getGoogleUser({ id_token, access_token });

    if (!googleUser.verified_email) {
      return res
        .status(400)
        .send({ message: "Google account is not verified" });
    }

    const alreadyUser = await db
      .select()
      .from(users)
      .where(eq(users.gmailID, googleUser.email))
      .limit(1);

    if (alreadyUser.length > 0) {
      return res.status(400).send({
        message: "User already connected to google",
      });
    }

    const User = await db
      .update(users)
      .set({
        isConnectedToGoogle: true,
        gmailID: googleUser.email,
      })
      .where(eq(users.userID, req.user.userID))
      .returning();

    redisClient.hset(req.user.userID + "_google_token", {
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

    const accessToken = signJWT(
      { tokenUser, session: session_id },
      { expiresIn: "24h" }
    );

    const refreshToken = signJWT(
      { tokenUser, session: session_id },
      { expiresIn: "30d" }
    );

    const session = await createSession(
      session_id,
      refreshToken,
      req.get("user-agent") || "",
      true,
      true
    );

    return res.status(200).send({
      message: "Google account connected successfully",
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (err) {
    console.log(err);
  }
};
