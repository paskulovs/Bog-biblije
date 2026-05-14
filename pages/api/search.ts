import type { NextApiRequest, NextApiResponse } from "next";
import { queryArticles } from "../../lib/article-store";
import { isDatabaseConfigured } from "../../lib/db";
import { searchSiteContent } from "../../lib/content-store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const searchText = typeof req.query.searchText === "string" ? req.query.searchText : "";

  if (!isDatabaseConfigured) {
    const localArticles = await queryArticles({
      take: 3,
      search: searchText,
      sort: "desc,createdAt",
    });

    return res.status(200).json({
      blogPosts: localArticles.results,
      books: [],
      videos: [],
    });
  }

  const data = await searchSiteContent(searchText);
  return res.status(200).json(data);
}
