import { redirect } from "next/navigation";

export const metadata = {
  title: "About | Sidekick",
  description: "About Sidekick",
};

export default function About() {
  redirect("/");
}
