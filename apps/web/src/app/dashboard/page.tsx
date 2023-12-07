import { cookies } from "next/headers";
import NewDashboard from "./components/dashboard-1";

export default async function page({
  searchParams,
}: {
  searchParams?: { [key: string]: string };
}) {
  const cookie = cookies();

  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookie.get("accessToken")?.value}`,
      cookie: `${cookie.get("refreshToken")?.value}`,
    },
    cache: "no-cache",
  }).then((res) => res.json());

  // console.log(res);

  if (res.message === "Please verify your email") {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <h1>Please verify your email</h1>
      </div>
    );
  }

  if (res.length === 0) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <h1>You have no workspace</h1>
      </div>
    );
  }

  return (
    <div className="bg-dash">
      <NewDashboard data={res} />
    </div>
  );
}
