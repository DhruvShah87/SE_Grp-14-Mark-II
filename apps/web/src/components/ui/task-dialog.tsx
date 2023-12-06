import Task from "@/components/CreateTask";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { faClipboard } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

export function TaskDialog({ id }: { id: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild className="cursor-pointer">
        {/* <HoverCard>
          <HoverCardTrigger asChild>
            <FontAwesomeIcon icon={faClipboard} className="cursor-pointer" />
          </HoverCardTrigger>
          <HoverCardContent>
            <p>Create a task</p>
          </HoverCardContent>
        </HoverCard> */}
        {/* <FontAwesomeIcon icon={faClipboard} className="cursor-pointer" /> */}
        <Image
                  src="/img/addtask.png"
                  alt="Image Not found"
                  width={30}
                  height={30}
                />
      </DialogTrigger>
      <DialogContent className="bg-[#E5F2FF]">
        <Task wsID={id} />
      </DialogContent>
    </Dialog>
  );
}
