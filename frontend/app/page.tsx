import { redirect } from "next/navigation";

export default function Home() {
  redirect("/merkletree");
  return null;
}
