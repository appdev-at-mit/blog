import { Post } from "@/interfaces/post";

import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = join(process.cwd(), "_posts");
const readingsDirectory = join(postsDirectory, "readings");

export function getPostBySlug(slug: string): Post {
  const fullPath = join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const post: Post = {
    id: slug,
    title: data.title,
    author: data.author,
    date: data.date,
    tags: data.tags,
    content: content,
    important: data.important || false,
    excerpt: data.excerpt || "",
  };

  return post;
}

export function convertMarkdownToHtml(markdown: string): string {
  console.log(markdown);
  const processedContent = remark().use(html, {sanitize:false}).processSync(markdown);
  return processedContent.toString();
}

export function getAllPosts(): Post[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const fileNamesFiltered = fileNames.filter((fileName) => fileName.endsWith(".md"));
  fileNamesFiltered.sort((a, b) => {
    const dateA = new Date(getPostBySlug(a.replace(/\.md$/, "")).date);
    const dateB = new Date(getPostBySlug(b.replace(/\.md$/, "")).date);
    return dateB.getTime() - dateA.getTime();
  });
  const posts: Post[] = fileNamesFiltered.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    return getPostBySlug(slug);
  });

  return posts;
}

export function getAllReadings(): Post[] {
  const fileNames = fs.readdirSync(readingsDirectory);
  const fileNamesFiltered = fileNames.filter((fileName) => fileName.endsWith(".md"));
  fileNamesFiltered.sort((a, b) => {
    const dateA = new Date(getPostBySlug(a.replace(/\.md$/, "")).date);
    const dateB = new Date(getPostBySlug(b.replace(/\.md$/, "")).date);
    return dateB.getTime() - dateA.getTime();
  });
  const posts: Post[] = fileNamesFiltered.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    return getPostBySlug(`readings/${slug}`);
  });

  return posts;
}