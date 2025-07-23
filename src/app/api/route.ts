import { Post } from "@/interfaces/post";
import { getAllPosts } from "@/lib/api";

export async function GET() {
  const posts: Post[] = getAllPosts();
  return new Response(JSON.stringify(posts), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
