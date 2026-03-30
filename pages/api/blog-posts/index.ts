import type { NextApiRequest, NextApiResponse } from "next";
import { createBlogPost, getBlogPosts } from "../../../lib/content-store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const payload = req.body;

    if (!payload?.title || !payload?.excerpt || !payload?.content || !payload?.author) {
      return res.status(400).json({ error: "Nedostaju obavezna polja." });
    }

    const post = await createBlogPost(payload);
    return res.status(201).json(post);
  }

  const page = Number(req.query.page || 0);
  const take = Number(req.query.take || 9);
  const sort = typeof req.query.sort === "string" ? req.query.sort : "desc,createdAt";
  const isChildCorner =
    req.query.isChildCorner === "true"
      ? true
      : req.query.isChildCorner === "false"
        ? false
        : null;
  const title = typeof req.query.title === "string" ? req.query.title : undefined;
  const excerpt = typeof req.query.excerpt === "string" ? req.query.excerpt : undefined;
  const data = await getBlogPosts({ page, take, sort, isChildCorner, title, excerpt });

  return res.status(200).json(data);
}
