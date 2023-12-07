import { request } from "@/utils/request";
import Calendar from "../components/calendar";
import NavComponent from "@/components/Navbar";

export default async function page() {
  const res = await request("events", "GET");

  const allEvents = {};

  if (res.message === "User is not connected to google") {
    return (
      <div className="">
        <NavComponent />
        <div className="w-4/5 mx-auto mt-5 ">
          <h1 className="text-2xl text-center">
            You are not connected to google
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <NavComponent />
      <div className="w-4/5 mx-auto mt-5 ">
        <Calendar allEvents={allEvents} />
      </div>
    </div>
  );
}
