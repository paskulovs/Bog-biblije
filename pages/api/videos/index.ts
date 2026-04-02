import type { NextApiRequest, NextApiResponse } from "next";
import { requireCmsApiAuth } from "../../../lib/auth";
import { createVideo, getVideos } from "../../../lib/content-store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    if (!(await requireCmsApiAuth(req, res))) {
      return;
    }

    const payload = req.body;

    if (!payload?.title || !payload?.url || !payload?.categorySlug) {
      return res.status(400).json({ error: "Nedostaju obavezna polja." });
    }

    const video = await createVideo(payload);
    return res.status(201).json(video);
  }

  const page = Number(req.query.page || 0);
  const take = Number(req.query.take || 12);
  const categorySlug = typeof req.query.categorySlug === "string" ? req.query.categorySlug : null;
  const title = typeof req.query.title === "string" ? req.query.title : undefined;
  const isYouTube =
    req.query.isYouTube === "true"
      ? true
      : req.query.isYouTube === "false"
        ? false
        : null;
  const data = await getVideos({ page, take, categorySlug, title, isYouTube });

  return res.status(200).json(data);
}
