import dotenv from "dotenv";
dotenv.config();

export function getGoogleUrl(redirect: string) {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  const options = {
    redirect_uri: `${process.env.SERVER}/api${redirect}`,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/calendar",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);

  return `${rootUrl}?${qs.toString()}`;
}
