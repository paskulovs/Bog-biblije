import { QueryResultRow } from "pg";
import { getDatabasePool, isDatabaseConfigured } from "./db";
import {
  BlogPost,
  BlogPostInput,
  Book,
  BookInput,
  PaginatedResult,
  SearchResult,
  Video,
  VideoInput,
} from "./types";

type SortField = "createdAt" | "readCount" | "id";
type SortDirection = "asc" | "desc";

const DEFAULT_IMAGE = "/images/bible_giving.jpg";
const DEFAULT_VIDEO_IMAGE = "/images/bibles.jpg";

const BLOG_SORT_COLUMNS: Record<SortField, string> = {
  createdAt: '"createdAt"',
  readCount: '"readCount"',
  id: '"id"',
};

const normalizeDate = (value: unknown) => new Date(String(value)).toISOString();

const normalizeOptionalString = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const mapBlogPost = (row: QueryResultRow): BlogPost => ({
  id: String(row.id),
  title: String(row.title || ""),
  excerpt: String(row.excerpt || ""),
  content: String(row.content || ""),
  author: String(row.author || ""),
  imageUrl: String(row.imageUrl || DEFAULT_IMAGE),
  audioUrl: row.audioUrl ? String(row.audioUrl) : null,
  readCount: Number(row.readCount || 0),
  createdAt: normalizeDate(row.createdAt),
  isChildCorner: Boolean(row.isChildCorner),
});

const mapBook = (row: QueryResultRow): Book => ({
  id: String(row.id),
  title: String(row.title || ""),
  author: String(row.author || ""),
  imageUrl: String(row.imageUrl || DEFAULT_IMAGE),
  pdfUrl: row.pdfUrl ? String(row.pdfUrl) : null,
  description: row.description ? String(row.description) : null,
});

const mapVideo = (row: QueryResultRow): Video => ({
  id: String(row.id),
  title: String(row.title || ""),
  url: String(row.url || ""),
  imageUrl:
    row.imageUrl && row.imageUrl !== "no-image.jpg"
      ? String(row.imageUrl)
      : DEFAULT_VIDEO_IMAGE,
  categorySlug: String(row.categorySlug || ""),
  isYouTube: Boolean(row.isYouTube),
  createdAt: normalizeDate(row.createdAt),
});

const parseSort = (
  sort = "desc,createdAt",
  allowedFields: SortField[] = ["createdAt", "readCount", "id"],
) => {
  const [directionPart = "desc", fieldPart = "createdAt"] = sort.split(",");
  const direction: SortDirection =
    directionPart.toLowerCase() === "asc" ? "asc" : "desc";
  const field = allowedFields.includes(fieldPart as SortField)
    ? (fieldPart as SortField)
    : allowedFields[0];

  return {
    direction,
    column: BLOG_SORT_COLUMNS[field],
  };
};

const runQuery = async <T extends QueryResultRow>(text: string, values: unknown[] = []) => {
  const pool = getDatabasePool();

  if (!pool) {
    return [] as T[];
  }

  const result = await pool.query<T>(text, values);
  return result.rows;
};

const runCountQuery = async (text: string, values: unknown[] = []) => {
  const rows = await runQuery<{ count: string }>(text, values);
  return Number(rows[0]?.count || 0);
};

const appendWhereClause = (clauses: string[], values: unknown[], clause: string, value?: unknown) => {
  if (typeof value === "undefined") {
    return;
  }

  values.push(value);
  clauses.push(`${clause} $${values.length}`);
};

const getBlogPostSelect = () =>
  `SELECT id, title, excerpt, content, author, "imageUrl", "audioUrl", "readCount", "createdAt", "isChildCorner"
   FROM "BlogPost"`;

const getBookSelect = () =>
  `SELECT id, title, author, "imageUrl", "pdfUrl", description
   FROM "Book"`;

const getVideoSelect = () =>
  `SELECT id, title, url, "imageUrl", "categorySlug", "isYouTube", "createdAt"
   FROM "Video"`;

export const getLatestBlogPosts = async (limit: number, isChildCorner = false) => {
  if (!isDatabaseConfigured) {
    return [] as BlogPost[];
  }

  const rows = await runQuery(
    `${getBlogPostSelect()}
     WHERE "isChildCorner" = $1
     ORDER BY "createdAt" DESC
     LIMIT $2`,
    [isChildCorner, limit],
  );

  return rows.map(mapBlogPost);
};

export const getBlogPosts = async ({
  page = 0,
  take = 10,
  sort = "desc,createdAt",
  isChildCorner,
  title,
  excerpt,
}: {
  page?: number;
  take?: number;
  sort?: string;
  isChildCorner?: boolean | null;
  title?: string;
  excerpt?: string;
} = {}): Promise<PaginatedResult<BlogPost>> => {
  if (!isDatabaseConfigured) {
    return { results: [], totalItems: 0 };
  }

  const { column, direction } = parseSort(sort, ["createdAt", "readCount", "id"]);
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (typeof isChildCorner === "boolean") {
    appendWhereClause(clauses, values, `"isChildCorner" =`, isChildCorner);
  }
  if (title?.trim()) {
    appendWhereClause(clauses, values, `title ILIKE`, `%${title.trim()}%`);
  }
  if (excerpt?.trim()) {
    appendWhereClause(clauses, values, `excerpt ILIKE`, `%${excerpt.trim()}%`);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await runQuery(
    `${getBlogPostSelect()}
     ${whereClause}
     ORDER BY ${column} ${direction.toUpperCase()}
     LIMIT $${values.push(take)}
     OFFSET $${values.push(page * take)}`,
    values,
  );
  const countValues = values.slice(0, values.length - 2);
  const totalItems = await runCountQuery(
    `SELECT COUNT(*)::text AS count
     FROM "BlogPost"
     ${whereClause}`,
    countValues,
  );

  return {
    results: rows.map(mapBlogPost),
    totalItems,
  };
};

export const getBlogPostById = async (id: string) => {
  if (!isDatabaseConfigured) {
    return null;
  }

  const rows = await runQuery(
    `${getBlogPostSelect()}
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return rows[0] ? mapBlogPost(rows[0]) : null;
};

export const createBlogPost = async (input: BlogPostInput) => {
  if (!isDatabaseConfigured) {
    return null;
  }

  const rows = await runQuery(
    `INSERT INTO "BlogPost" (title, excerpt, content, author, "imageUrl", "audioUrl", "isChildCorner")
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, title, excerpt, content, author, "imageUrl", "audioUrl", "readCount", "createdAt", "isChildCorner"`,
    [
      input.title.trim(),
      input.excerpt.trim(),
      input.content.trim(),
      input.author.trim(),
      normalizeOptionalString(input.imageUrl) || DEFAULT_IMAGE,
      normalizeOptionalString(input.audioUrl),
      Boolean(input.isChildCorner),
    ],
  );

  return rows[0] ? mapBlogPost(rows[0]) : null;
};

export const updateBlogPost = async (id: string, input: Partial<BlogPostInput>) => {
  if (!isDatabaseConfigured) {
    return null;
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (typeof input.title === "string") {
    fields.push(`title = $${values.push(input.title.trim())}`);
  }
  if (typeof input.excerpt === "string") {
    fields.push(`excerpt = $${values.push(input.excerpt.trim())}`);
  }
  if (typeof input.content === "string") {
    fields.push(`content = $${values.push(input.content.trim())}`);
  }
  if (typeof input.author === "string") {
    fields.push(`author = $${values.push(input.author.trim())}`);
  }
  if ("imageUrl" in input) {
    fields.push(`"imageUrl" = $${values.push(normalizeOptionalString(input.imageUrl) || DEFAULT_IMAGE)}`);
  }
  if ("audioUrl" in input) {
    fields.push(`"audioUrl" = $${values.push(normalizeOptionalString(input.audioUrl))}`);
  }
  if (typeof input.isChildCorner === "boolean") {
    fields.push(`"isChildCorner" = $${values.push(input.isChildCorner)}`);
  }

  if (!fields.length) {
    return getBlogPostById(id);
  }

  const rows = await runQuery(
    `UPDATE "BlogPost"
     SET ${fields.join(", ")}
     WHERE id = $${values.push(id)}
     RETURNING id, title, excerpt, content, author, "imageUrl", "audioUrl", "readCount", "createdAt", "isChildCorner"`,
    values,
  );

  return rows[0] ? mapBlogPost(rows[0]) : null;
};

export const incrementBlogPostReadCount = async (id: string) => {
  if (!isDatabaseConfigured) {
    return null;
  }

  const rows = await runQuery(
    `UPDATE "BlogPost"
     SET "readCount" = "readCount" + 1
     WHERE id = $1
     RETURNING id, title, excerpt, content, author, "imageUrl", "audioUrl", "readCount", "createdAt", "isChildCorner"`,
    [id],
  );

  return rows[0] ? mapBlogPost(rows[0]) : null;
};

export const deleteBlogPost = async (id: string) => {
  if (!isDatabaseConfigured) {
    return null;
  }

  const rows = await runQuery(
    `DELETE FROM "BlogPost"
     WHERE id = $1
     RETURNING id, title, excerpt, content, author, "imageUrl", "audioUrl", "readCount", "createdAt", "isChildCorner"`,
    [id],
  );

  return rows[0] ? mapBlogPost(rows[0]) : null;
};

export const getMostReadBlogPosts = async (
  limit: number,
  excludeId?: string,
  isChildCorner = false,
) => {
  if (!isDatabaseConfigured) {
    return [] as BlogPost[];
  }

  const values: unknown[] = [isChildCorner];
  const excludeClause = excludeId
    ? ` AND id <> $${values.push(excludeId)}`
    : "";

  const rows = await runQuery(
    `${getBlogPostSelect()}
     WHERE "isChildCorner" = $1${excludeClause}
     ORDER BY "readCount" DESC, "createdAt" DESC
     LIMIT $${values.push(limit)}`,
    values,
  );

  return rows.map(mapBlogPost);
};

export const getBooks = async ({
  page = 0,
  take = 12,
  category,
  title,
  author,
}: {
  page?: number;
  take?: number;
  category?: string | null;
  title?: string;
  author?: string;
} = {}): Promise<PaginatedResult<Book>> => {
  if (!isDatabaseConfigured) {
    return { results: [], totalItems: 0 };
  }

  const clauses: string[] = [];
  const values: unknown[] = [];

  if (title?.trim()) {
    appendWhereClause(clauses, values, `title ILIKE`, `%${title.trim()}%`);
  }
  if (author?.trim()) {
    appendWhereClause(clauses, values, `author ILIKE`, `%${author.trim()}%`);
  }
  if (category === "pdf") {
    clauses.push(`"pdfUrl" IS NOT NULL`);
  } else if (category === "free-books") {
    clauses.push(`"pdfUrl" IS NULL`);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await runQuery(
    `${getBookSelect()}
     ${whereClause}
     ORDER BY id DESC
     LIMIT $${values.push(take)}
     OFFSET $${values.push(page * take)}`,
    values,
  );
  const countValues = values.slice(0, values.length - 2);
  const totalItems = await runCountQuery(
    `SELECT COUNT(*)::text AS count
     FROM "Book"
     ${whereClause}`,
    countValues,
  );

  return {
    results: rows.map(mapBook),
    totalItems,
  };
};

export const getBookById = async (id: string) => {
  if (!isDatabaseConfigured) {
    return null;
  }

  const rows = await runQuery(
    `${getBookSelect()}
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return rows[0] ? mapBook(rows[0]) : null;
};

export const createBook = async (input: BookInput) => {
  if (!isDatabaseConfigured) {
    return null;
  }

  const rows = await runQuery(
    `INSERT INTO "Book" (title, author, "imageUrl", "pdfUrl", description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, author, "imageUrl", "pdfUrl", description`,
    [
      input.title.trim(),
      input.author.trim(),
      normalizeOptionalString(input.imageUrl) || DEFAULT_IMAGE,
      normalizeOptionalString(input.pdfUrl),
      normalizeOptionalString(input.description),
    ],
  );

  return rows[0] ? mapBook(rows[0]) : null;
};

export const updateBook = async (id: string, input: Partial<BookInput>) => {
  if (!isDatabaseConfigured) {
    return null;
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (typeof input.title === "string") {
    fields.push(`title = $${values.push(input.title.trim())}`);
  }
  if (typeof input.author === "string") {
    fields.push(`author = $${values.push(input.author.trim())}`);
  }
  if ("imageUrl" in input) {
    fields.push(`"imageUrl" = $${values.push(normalizeOptionalString(input.imageUrl) || DEFAULT_IMAGE)}`);
  }
  if ("pdfUrl" in input) {
    fields.push(`"pdfUrl" = $${values.push(normalizeOptionalString(input.pdfUrl))}`);
  }
  if ("description" in input) {
    fields.push(`description = $${values.push(normalizeOptionalString(input.description))}`);
  }

  if (!fields.length) {
    return getBookById(id);
  }

  const rows = await runQuery(
    `UPDATE "Book"
     SET ${fields.join(", ")}
     WHERE id = $${values.push(id)}
     RETURNING id, title, author, "imageUrl", "pdfUrl", description`,
    values,
  );

  return rows[0] ? mapBook(rows[0]) : null;
};

export const deleteBook = async (id: string) => {
  if (!isDatabaseConfigured) {
    return null;
  }

  const rows = await runQuery(
    `DELETE FROM "Book"
     WHERE id = $1
     RETURNING id, title, author, "imageUrl", "pdfUrl", description`,
    [id],
  );

  return rows[0] ? mapBook(rows[0]) : null;
};

export const getVideos = async ({
  page = 0,
  take = 12,
  categorySlug,
  title,
  isYouTube,
}: {
  page?: number;
  take?: number;
  categorySlug?: string | null;
  title?: string;
  isYouTube?: boolean | null;
} = {}): Promise<PaginatedResult<Video>> => {
  if (!isDatabaseConfigured) {
    return { results: [], totalItems: 0 };
  }

  const clauses: string[] = [];
  const values: unknown[] = [];

  if (categorySlug?.trim()) {
    appendWhereClause(clauses, values, `"categorySlug" =`, categorySlug.trim());
  }
  if (title?.trim()) {
    appendWhereClause(clauses, values, `title ILIKE`, `%${title.trim()}%`);
  }
  if (typeof isYouTube === "boolean") {
    appendWhereClause(clauses, values, `"isYouTube" =`, isYouTube);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await runQuery(
    `${getVideoSelect()}
     ${whereClause}
     ORDER BY "createdAt" DESC
     LIMIT $${values.push(take)}
     OFFSET $${values.push(page * take)}`,
    values,
  );
  const countValues = values.slice(0, values.length - 2);
  const totalItems = await runCountQuery(
    `SELECT COUNT(*)::text AS count
     FROM "Video"
     ${whereClause}`,
    countValues,
  );

  return {
    results: rows.map(mapVideo),
    totalItems,
  };
};

export const getVideoById = async (id: string) => {
  if (!isDatabaseConfigured) {
    return null;
  }

  const rows = await runQuery(
    `${getVideoSelect()}
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return rows[0] ? mapVideo(rows[0]) : null;
};

export const createVideo = async (input: VideoInput) => {
  if (!isDatabaseConfigured) {
    return null;
  }

  const rows = await runQuery(
    `INSERT INTO "Video" (title, url, "imageUrl", "categorySlug", "isYouTube")
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, url, "imageUrl", "categorySlug", "isYouTube", "createdAt"`,
    [
      input.title.trim(),
      input.url.trim(),
      normalizeOptionalString(input.imageUrl) || DEFAULT_VIDEO_IMAGE,
      input.categorySlug.trim(),
      Boolean(input.isYouTube),
    ],
  );

  return rows[0] ? mapVideo(rows[0]) : null;
};

export const updateVideo = async (id: string, input: Partial<VideoInput>) => {
  if (!isDatabaseConfigured) {
    return null;
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (typeof input.title === "string") {
    fields.push(`title = $${values.push(input.title.trim())}`);
  }
  if (typeof input.url === "string") {
    fields.push(`url = $${values.push(input.url.trim())}`);
  }
  if ("imageUrl" in input) {
    fields.push(`"imageUrl" = $${values.push(normalizeOptionalString(input.imageUrl) || DEFAULT_VIDEO_IMAGE)}`);
  }
  if (typeof input.categorySlug === "string") {
    fields.push(`"categorySlug" = $${values.push(input.categorySlug.trim())}`);
  }
  if (typeof input.isYouTube === "boolean") {
    fields.push(`"isYouTube" = $${values.push(input.isYouTube)}`);
  }

  if (!fields.length) {
    return getVideoById(id);
  }

  const rows = await runQuery(
    `UPDATE "Video"
     SET ${fields.join(", ")}
     WHERE id = $${values.push(id)}
     RETURNING id, title, url, "imageUrl", "categorySlug", "isYouTube", "createdAt"`,
    values,
  );

  return rows[0] ? mapVideo(rows[0]) : null;
};

export const deleteVideo = async (id: string) => {
  if (!isDatabaseConfigured) {
    return null;
  }

  const rows = await runQuery(
    `DELETE FROM "Video"
     WHERE id = $1
     RETURNING id, title, url, "imageUrl", "categorySlug", "isYouTube", "createdAt"`,
    [id],
  );

  return rows[0] ? mapVideo(rows[0]) : null;
};

export const searchSiteContent = async (searchText = ""): Promise<SearchResult> => {
  if (!isDatabaseConfigured) {
    return {
      blogPosts: [],
      books: [],
    };
  }

  const trimmedQuery = searchText.trim();
  const hasQuery = Boolean(trimmedQuery);
  const blogValues: unknown[] = [];
  const bookValues: unknown[] = [];

  const blogWhere = hasQuery
    ? `WHERE title ILIKE $${blogValues.push(`%${trimmedQuery}%`)}`
    : "";
  const bookWhere = hasQuery
    ? `WHERE title ILIKE $${bookValues.push(`%${trimmedQuery}%`)}`
    : "";

  const [blogRows, bookRows] = await Promise.all([
    runQuery(
      `${getBlogPostSelect()}
       ${blogWhere}
       ORDER BY "createdAt" DESC
       LIMIT 3`,
      blogValues,
    ),
    runQuery(
      `${getBookSelect()}
       ${bookWhere}
       ORDER BY id DESC
       LIMIT 3`,
      bookValues,
    ),
  ]);

  return {
    blogPosts: blogRows.map(mapBlogPost),
    books: bookRows.map(mapBook),
  };
};
