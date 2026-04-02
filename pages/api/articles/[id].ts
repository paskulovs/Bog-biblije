import type { NextApiRequest, NextApiResponse } from "next";
import { requireCmsApiAuth } from "../../../lib/auth";
import {
  deleteArticle,
  getArticleById,
  incrementArticleReadCount,
  updateArticle,
} from "../../../lib/article-store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const articleId = typeof req.query.id === "string" ? req.query.id : "";

  if (!articleId) {
    return res.status(400).json({ error: "Nedostaje ID članka." });
  }

  if (req.method === "GET") {
    const article = await getArticleById(articleId);
    if (!article) {
      return res.status(404).json({ error: "Članak nije pronađen." });
    }
    return res.status(200).json(article);
  }

  if (req.method === "PUT") {
    if (req.body?.incrementReadCount) {
      const article = await incrementArticleReadCount(articleId);
      if (!article) {
        return res.status(404).json({ error: "Članak nije pronađen." });
      }
      return res.status(200).json(article);
    }

    if (!(await requireCmsApiAuth(req, res))) {
      return;
    }

    const article = await updateArticle(articleId, req.body);
    if (!article) {
      return res.status(404).json({ error: "Članak nije pronađen." });
    }
    return res.status(200).json(article);
  }

  if (req.method === "DELETE") {
    if (!(await requireCmsApiAuth(req, res))) {
      return;
    }

    const article = await deleteArticle(articleId);
    if (!article) {
      return res.status(404).json({ error: "Članak nije pronađen." });
    }
    return res.status(200).json(article);
  }

  return res.status(405).json({ error: "Method not allowed." });
}
