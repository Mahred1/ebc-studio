import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Link href={'/reserve'}><Button>Reserve a Spot</Button></Link>
      <Link href={'/check-reservation'}><Button>Check Reservation</Button></Link>
    </div>
  );
}
