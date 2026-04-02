import type { NextApiRequest, NextApiResponse } from "next";
import { requireCmsApiAuth } from "../../../lib/auth";
import { createArticle, queryArticles } from "../../../lib/article-store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const page = Number(req.query.page || 0);
    const take = Number(req.query.take || 10);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const sort = typeof req.query.sort === "string" ? req.query.sort : "desc,createdAt";
    const data = await queryArticles({ page, take, search, sort });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    if (!(await requireCmsApiAuth(req, res))) {
      return;
    }

    const payload = req.body;

    if (!payload?.title || !payload?.excerpt || !payload?.content || !payload?.author) {
      return res.status(400).json({ error: "Nedostaju obavezna polja." });
    }

    const article = await createArticle(payload);
    return res.status(201).json(article);
  }

  return res.status(405).json({ error: "Method not allowed." });
}
