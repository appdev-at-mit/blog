import { Post } from "@/interfaces/post";
import AppWindow from "@/app/components/appwindow";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import { getPostBySlug, convertMarkdownToHtml } from "@/lib/api";
import MDBody from "@/app/components/mdbody";

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const post: Post = getPostBySlug(slug);
  const contentHtml = convertMarkdownToHtml(post.content);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />
      <article className="flex-1 mx-5 md:mx-10 lg:mx-80 pt-10 font-sans">
        <a
          href="/"
          className="font-mono py-2 tracking-widest text-gray-300 uppercase pb-5 block"
        >
          &lt; back to journal
        </a>
        <AppWindow color={0}>
          <h1 className="text-4xl font-bold pb-3">{post.title}</h1>
          <p className="font-mono uppercase text-sm pb-3">
            {post.author.name} | {new Date(post.date).toLocaleDateString()}
          </p>
          <MDBody>
            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </MDBody>
          {post.image && <img src={post.image} alt={post.title} />}
        </AppWindow>
      </article>
      <div className="mx-5 md:mx-10 lg:mx-80 pt-10">
        <Footer />
      </div>
    </div>
  );
}
