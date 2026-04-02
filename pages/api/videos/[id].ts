import type { NextApiRequest, NextApiResponse } from "next";
import { requireCmsApiAuth } from "../../../lib/auth";
import { deleteVideo, getVideoById, updateVideo } from "../../../lib/content-store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const videoId = typeof req.query.id === "string" ? req.query.id : "";

  if (!videoId) {
    return res.status(400).json({ error: "Nedostaje ID videa." });
  }

  if (req.method === "GET") {
    const video = await getVideoById(videoId);

    if (!video) {
      return res.status(404).json({ error: "Video nije pronađen." });
    }

    return res.status(200).json(video);
  }

  if (req.method === "PUT") {
    if (!(await requireCmsApiAuth(req, res))) {
      return;
    }

    const video = await updateVideo(videoId, req.body);

    if (!video) {
      return res.status(404).json({ error: "Video nije pronađen." });
    }

    return res.status(200).json(video);
  }

  if (req.method === "DELETE") {
    if (!(await requireCmsApiAuth(req, res))) {
      return;
    }

    const video = await deleteVideo(videoId);

    if (!video) {
      return res.status(404).json({ error: "Video nije pronađen." });
    }

    return res.status(200).json(video);
  }

  return res.status(405).json({ error: "Method not allowed." });
}
