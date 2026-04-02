import type { NextApiRequest, NextApiResponse } from "next";
import { requireCmsApiAuth } from "../../../lib/auth";
import { getBooks, createBook } from "../../../lib/content-store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    if (!(await requireCmsApiAuth(req, res))) {
      return;
    }

    const payload = req.body;

    if (!payload?.title || !payload?.author) {
      return res.status(400).json({ error: "Nedostaju obavezna polja." });
    }

    const book = await createBook(payload);
    return res.status(201).json(book);
  }

  const page = Number(req.query.page || 0);
  const take = Number(req.query.take || 12);
  const category = typeof req.query.category === "string" ? req.query.category : null;
  const title = typeof req.query.title === "string" ? req.query.title : undefined;
  const author = typeof req.query.author === "string" ? req.query.author : undefined;
  const data = await getBooks({ page, take, category, title, author });

  return res.status(200).json(data);
}
