import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/scan")({
  beforeLoad: async () => {
    throw redirect({
      to: "/homework/worksheet-builder",
    });
  },
});