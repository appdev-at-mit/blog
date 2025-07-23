import { Post } from "@/interfaces/post";

import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = join(process.cwd(), "_posts");

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
  };

  return post;
}

export function convertMarkdownToHtml(markdown: string): string {
  const processedContent = remark().use(html).processSync(markdown);
  return processedContent.toString();
}

export function getAllPosts(): Post[] {
  const fileNames = fs.readdirSync(postsDirectory);
  fileNames.sort((a, b) => {
    const dateA = new Date(getPostBySlug(a.replace(/\.md$/, "")).date);
    const dateB = new Date(getPostBySlug(b.replace(/\.md$/, "")).date);
    return dateB.getTime() - dateA.getTime();
  });
  const posts: Post[] = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    return getPostBySlug(slug);
  });

  return posts;
}
