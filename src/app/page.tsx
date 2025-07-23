import { Post } from "@/interfaces/post";
import { getAllPosts } from "@/lib/api";
import AppWindow from "@/app/components/appwindow";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import Badges from "@/app/components/badges";
import App from "next/app";

export default function Home() {
  const posts: Post[] = getAllPosts();

  return (
    <div className="bg-gray-100">
      <Navbar />
      <main className="mx-5 md:mx-10 lg:mx-30 pt-20 bg-gray-100 font-sans h-full">
        <p className="font-mono py-2 tracking-widest text-gray-300 uppercase">
          &lt;main className="mx-5 md:mx-10 lg:mx-30 pt-20 bg-gray-100
          font-sans"&gt;
        </p>
        <hr className="text-gray-200" />
        <h1 className="text-6xl font-bold text-gray-600 pb-10">
          news and ramblings
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <a
              href={`/posts/${post.id}`}
              key={post.id}
              className={post.important ? "col-span-1 md:col-span-2" : ""}
            >
              <AppWindow color={(index % 5) + 1}>
                <h2 className="text-2xl font-bold">{post.title}</h2>
                <p className="font-mono uppercase text-sm pb-3">
                  {post.author.name} |{" "}
                  {new Date(post.date).toLocaleDateString()}
                </p>
                {post.excerpt && <p className="pb-3">{post.excerpt}</p>}
                <Badges tags={post.tags} color={(index % 5) + 1} />
              </AppWindow>
            </a>
          ))}
        </div>
        <Footer />
      </main>
    </div>
  );
}
