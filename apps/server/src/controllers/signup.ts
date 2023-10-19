import { Request, Response } from "express";

import { db } from "../config/database";
import { users } from "../model/User";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sendOTP } from "../services/sendOTP";
// import { sendVerificationEmail } from "../utils/sendVerificationEmail";
import bcrypt from "bcrypt";

type users = typeof users.$inferInsert;

export const signupGet = async (req: Request, res: Response) => {
  
//     res.sendFile(__dirname + '/public/signup.html');
        res.send("<h1>Signup</h1>");
};


export const signupPost = async (req: Request, res: Response) => {
  var { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).send({ error: "Username and password required" });
  }

  const verificationToken = randomBytes(32).toString("hex");

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.emailId, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("Email already exists");
      return res.status(400).send({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(password, salt);

    await db.insert(users).values({
      name: username,
      password: password,
      emailId: email,
      // verificationToken: verificationToken,
    });

    await sendOTP(
      username,
      email,
      verificationToken,
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal server error" });
  }

  res.send({ message: "Signup successful" });
};




