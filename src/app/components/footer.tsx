export default function Footer() {
  return (
    <footer className="bg-gray-100 font-sans py-6 mt-10 border-l border-gray-200">
      <p className="font-mono py-2 tracking-widest text-gray-300 uppercase">
        &lt;footer className="bg-gray-100 font-sans py-6 mt-10"&gt;
      </p>
      <hr className="text-gray-200" />
      <p className="text-gray-600 py-2 text-xl">
        Made with ❤️ by AppDev@MIT
        <br />
        <span className="text-gray-400">
          © {new Date().getFullYear()} All rights reserved.
        </span>
      </p>
      <hr className="text-gray-200" />
      <p className="font-mono py-2 tracking-widest text-gray-300 uppercase">
        &lt;/footer&gt;
      </p>
    </footer>
  );
}
