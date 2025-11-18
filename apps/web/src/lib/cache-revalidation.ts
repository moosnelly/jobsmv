"use server";

import { revalidateTag } from "next/cache";

export async function revalidateJobs() {
  revalidateTag("jobs", "max");
}

export async function revalidateCategories() {
  revalidateTag("categories", "max");
}

export async function revalidateLocations() {
  revalidateTag("locations", "max");
}

export async function revalidateAllPublicData() {
  revalidateTag("jobs", "max");
  revalidateTag("categories", "max");
  revalidateTag("locations", "max");
}
