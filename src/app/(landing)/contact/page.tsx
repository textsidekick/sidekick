import { redirect } from "next/navigation";

export const metadata = {
  title: "Contact | Sidekick",
  description: "Get in touch with the Sidekick team",
};

export default function Contact() {
  redirect("/#contact");
}
