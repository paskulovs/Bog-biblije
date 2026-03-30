import fs from "fs/promises";
import path from "path";
import { Article, ArticleInput } from "./types";
import { slugify } from "./slug";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "articles.json");
const DEFAULT_IMAGE_URL = "/images/bible_giving.jpg";

const sortByCreatedAtDesc = (articles: Article[]) =>
  [...articles].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

const ensureStoreFile = async () => {
  try {
    await fs.access(DATA_FILE_PATH);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, "[]", "utf8");
  }
};

const readStore = async () => {
  await ensureStoreFile();
  const fileContents = await fs.readFile(DATA_FILE_PATH, "utf8");
  return JSON.parse(fileContents) as Article[];
};

const writeStore = async (articles: Article[]) => {
  await fs.writeFile(
    DATA_FILE_PATH,
    JSON.stringify(sortByCreatedAtDesc(articles), null, 2),
    "utf8",
  );
};

const normalizeOptionalString = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeImageUrl = (value?: string) =>
  normalizeOptionalString(value) || DEFAULT_IMAGE_URL;

const normalizeDate = (value?: string) => {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const createId = () =>
  `article_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const ensureUniqueSlug = (
  requestedSlug: string,
  articles: Article[],
  excludedId?: string,
) => {
  const baseSlug = slugify(requestedSlug) || `clanak-${articles.length + 1}`;
  let uniqueSlug = baseSlug;
  let index = 2;

  while (
    articles.some(
      (article) => article.slug === uniqueSlug && article.id !== excludedId,
    )
  ) {
    uniqueSlug = `${baseSlug}-${index}`;
    index += 1;
  }

  return uniqueSlug;
};

export const getAllArticles = async () => sortByCreatedAtDesc(await readStore());

export const getLatestArticles = async (limit: number) =>
  sortByCreatedAtDesc(await readStore()).slice(0, limit);

export const getMostReadArticles = async (limit: number, excludeId?: string) =>
  (await readStore())
    .filter((article) => article.id !== excludeId)
    .sort((left, right) => right.readCount - left.readCount)
    .slice(0, limit);

export const getArticleById = async (id: string) =>
  (await readStore()).find((article) => article.id === id) || null;

export const getArticleBySlug = async (slug: string) =>
  (await readStore()).find((article) => article.slug === slug) || null;

export const queryArticles = async ({
  page = 0,
  take = 10,
  search,
  sort = "desc,createdAt",
}: {
  page?: number;
  take?: number;
  search?: string;
  sort?: string;
}) => {
  const [direction = "desc", field = "createdAt"] = sort.split(",");
  const searchValue = search?.trim().toLowerCase();
  const allArticles = await readStore();

  const filteredArticles = allArticles.filter((article) => {
    if (!searchValue) return true;

    return [article.title, article.excerpt, article.author, article.content]
      .join(" ")
      .toLowerCase()
      .includes(searchValue);
  });

  const sortedArticles = [...filteredArticles].sort((left, right) => {
    const factor = direction === "asc" ? 1 : -1;

    if (field === "readCount") {
      return (left.readCount - right.readCount) * factor;
    }

    return (
      (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()) *
      factor
    );
  });

  const startIndex = page * take;
  const results = sortedArticles.slice(startIndex, startIndex + take);

  return {
    results,
    totalItems: filteredArticles.length,
  };
};

export const createArticle = async (input: ArticleInput) => {
  const articles = await readStore();
  const now = new Date().toISOString();
  const article: Article = {
    id: createId(),
    slug: ensureUniqueSlug(input.slug || input.title, articles),
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    author: input.author.trim(),
    imageUrl: normalizeImageUrl(input.imageUrl),
    audioUrl: normalizeOptionalString(input.audioUrl),
    readCount: 0,
    createdAt: normalizeDate(input.createdAt),
    updatedAt: now,
  };

  articles.unshift(article);
  await writeStore(articles);
  return article;
};

export const updateArticle = async (id: string, input: Partial<ArticleInput>) => {
  const articles = await readStore();
  const article = articles.find((item) => item.id === id);

  if (!article) {
    return null;
  }

  article.slug = ensureUniqueSlug(
    input.slug || input.title || article.slug,
    articles,
    id,
  );
  article.title = input.title?.trim() || article.title;
  article.excerpt = input.excerpt?.trim() || article.excerpt;
  article.content = input.content?.trim() || article.content;
  article.author = input.author?.trim() || article.author;
  article.imageUrl = normalizeImageUrl(input.imageUrl || article.imageUrl);
  article.audioUrl = normalizeOptionalString(input.audioUrl) || undefined;
  article.createdAt = normalizeDate(input.createdAt || article.createdAt);
  article.updatedAt = new Date().toISOString();

  await writeStore(articles);
  return article;
};

export const incrementArticleReadCount = async (id: string) => {
  const articles = await readStore();
  const article = articles.find((item) => item.id === id);

  if (!article) {
    return null;
  }

  article.readCount += 1;
  article.updatedAt = new Date().toISOString();
  await writeStore(articles);
  return article;
};

export const deleteArticle = async (id: string) => {
  const articles = await readStore();
  const articleIndex = articles.findIndex((item) => item.id === id);

  if (articleIndex === -1) {
    return null;
  }

  const [deletedArticle] = articles.splice(articleIndex, 1);
  await writeStore(articles);
  return deletedArticle;
};
