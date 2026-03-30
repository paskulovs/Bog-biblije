import type { NextApiRequest, NextApiResponse } from "next";
import {
  deleteBlogPost,
  getBlogPostById,
  incrementBlogPostReadCount,
  updateBlogPost,
} from "../../../lib/content-store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const postId = typeof req.query.id === "string" ? req.query.id : "";

  if (!postId) {
    return res.status(400).json({ error: "Nedostaje ID članka." });
  }

  if (req.method === "GET") {
    const post = await getBlogPostById(postId);
    if (!post) {
      return res.status(404).json({ error: "Članak nije pronađen." });
    }

    return res.status(200).json(post);
  }

  if (req.method === "PUT") {
    if (req.body?.incrementReadCount) {
      const post = await incrementBlogPostReadCount(postId);

      if (!post) {
        return res.status(404).json({ error: "Članak nije pronađen." });
      }

      return res.status(200).json(post);
    }

    const post = await updateBlogPost(postId, req.body);

    if (!post) {
      return res.status(404).json({ error: "Članak nije pronađen." });
    }

    return res.status(200).json(post);
  }

  if (req.method === "DELETE") {
    const post = await deleteBlogPost(postId);

    if (!post) {
      return res.status(404).json({ error: "Članak nije pronađen." });
    }

    return res.status(200).json(post);
  }

  return res.status(405).json({ error: "Method not allowed." });
}
