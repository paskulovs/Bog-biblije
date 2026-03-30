import type { NextApiRequest, NextApiResponse } from "next";
import { deleteBook, getBookById, updateBook } from "../../../lib/content-store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const bookId = typeof req.query.id === "string" ? req.query.id : "";

  if (!bookId) {
    return res.status(400).json({ error: "Nedostaje ID knjige." });
  }

  if (req.method === "GET") {
    const book = await getBookById(bookId);

    if (!book) {
      return res.status(404).json({ error: "Knjiga nije pronađena." });
    }

    return res.status(200).json(book);
  }

  if (req.method === "PUT") {
    const book = await updateBook(bookId, req.body);

    if (!book) {
      return res.status(404).json({ error: "Knjiga nije pronađena." });
    }

    return res.status(200).json(book);
  }

  if (req.method === "DELETE") {
    const book = await deleteBook(bookId);

    if (!book) {
      return res.status(404).json({ error: "Knjiga nije pronađena." });
    }

    return res.status(200).json(book);
  }

  return res.status(405).json({ error: "Method not allowed." });
}
