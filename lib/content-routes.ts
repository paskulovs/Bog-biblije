import { Book, ReadableArticle, Video } from "./types";
import { slugify } from "./slug";

export const BOOK_CATEGORIES = {
  PDF: "pdf",
  FREE_BOOKS: "free-books",
} as const;

export const BOOK_CATEGORY_OPTIONS = [
  {
    value: BOOK_CATEGORIES.PDF,
    label: "PDF knjige",
    description: "Digitalna izdanja koja možete odmah preuzeti.",
  },
  {
    value: BOOK_CATEGORIES.FREE_BOOKS,
    label: "Besplatna knjiga",
    description: "Štampana izdanja koja možete zatražiti preko naših kontakata.",
  },
] as const;

export const DEFAULT_BOOK_CATEGORY = BOOK_CATEGORIES.PDF;

export const VIDEO_CATEGORY_OPTIONS = [
  {
    value: "licna-iskustva",
    label: "Lična iskustva",
    description: "Svedočenja ljudi o susretu sa Božijom rečju.",
  },
  {
    value: "duhovne-teme",
    label: "Duhovne teme",
    description: "Kratki video materijali o veri, životu i biblijskim pitanjima.",
  },
  {
    value: "filmovi",
    label: "Biblijski filmovi",
    description: "Tematski filmovi i video materijali za dublje proučavanje.",
  },
  {
    value: "komentari-biblije",
    label: "Komentari Biblije",
    description: "Biblijski komentari i objašnjenja za dublje razumevanje teksta.",
  },
] as const;

export const ALL_VIDEO_CATEGORIES = "sve";
export const VIDEO_CATEGORY_FILTER_OPTIONS = [
  {
    value: ALL_VIDEO_CATEGORIES,
    label: "Sve kategorije",
    description: "Svi video materijali iz dostupnih kategorija.",
  },
  ...VIDEO_CATEGORY_OPTIONS,
] as const;
export const DEFAULT_VIDEO_CATEGORY = ALL_VIDEO_CATEGORIES;
export const PUBLIC_VIDEO_CATEGORY_SLUGS = VIDEO_CATEGORY_OPTIONS.map((option) => option.value);
export const CHILD_VIDEO_CATEGORY = "djeciji-kutak";

export const getArticlePath = (article: Pick<ReadableArticle, "id" | "title" | "slug">) =>
  article.slug
    ? `/clanci/${article.slug}`
    : `/clanci/${article.id}--${slugify(article.title)}`;

export const getArticleIdFromSlugParam = (value: string) =>
  value.includes("--") ? value.split("--")[0] : value;

export const normalizeBookCategory = (value: unknown) => {
  if (value === BOOK_CATEGORIES.FREE_BOOKS) {
    return BOOK_CATEGORIES.FREE_BOOKS;
  }

  return BOOK_CATEGORIES.PDF;
};

export const normalizeVideoCategory = (value: unknown) => {
  if (
    typeof value === "string" &&
    (value === ALL_VIDEO_CATEGORIES ||
      VIDEO_CATEGORY_OPTIONS.some((option) => option.value === value))
  ) {
    return value;
  }

  return DEFAULT_VIDEO_CATEGORY;
};

export const getVideoWatchUrl = (video: Pick<Video, "isYouTube" | "url">) => {
  if (!video.isYouTube || /^https?:\/\//i.test(video.url)) {
    return video.url;
  }

  return `https://www.youtube.com/watch?v=${video.url}`;
};

export const getBookCtaHref = (book: Pick<Book, "pdfUrl">) =>
  book.pdfUrl ? book.pdfUrl : "/#section_6";
