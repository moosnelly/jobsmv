"use server";

import { revalidateTag } from "next/cache";

export async function revalidateJobs() {
  revalidateTag("jobs");
}

export async function revalidateCategories() {
  revalidateTag("categories");
}

export async function revalidateLocations() {
  revalidateTag("locations");
}

export async function revalidateAllPublicData() {
  revalidateTag("jobs");
  revalidateTag("categories");
  revalidateTag("locations");
}
