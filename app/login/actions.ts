"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const password = formData.get("password") as string;
  const expected = process.env.DASHBOARD_PASSWORD;

  if (!expected || password === expected) {
    (await cookies()).set("dashboard_auth", expected || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    redirect("/");
  }

  redirect("/login?error=1");
}
