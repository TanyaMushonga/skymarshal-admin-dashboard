import React from "react";
import { server } from "@/lib/server-api";
import LiveFootageClient from "./LiveFootageClient";
import { VideoStream, PaginatedResponse } from "@/types";

export const dynamic = "force-dynamic";

export default async function LiveFootagePage() {
  let streams: VideoStream[] = [];
  try {
    const response =
      await server.get<PaginatedResponse<VideoStream>>("/streams/");
    streams = response.results || [];
  } catch (error) {
    console.error("Failed to fetch streams:", error);
  }

  return <LiveFootageClient initialStreams={streams} />;
}
