"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-100/80 font-sans text-xl px-5 md:px-10 lg:px-30 py-4 sticky top-0 z-50 border-b border-gray-400 backdrop-blur-md">
      <div className="flex justify-between">
        <Link href="https://mitappdev.com">
          <Image
            src="/logo-cropped.svg"
            alt="Logo"
            width={200}
            height={10}
            className="inline-block mr-2 saturate-50"
          />
        </Link>
        <div className="hidden space-x-4 md:flex items-center">
          <a
            href="https://mitappdev.com/team"
            className="text-gray-500 hover:text-gray-800"
          >
            Team
          </a>
          <a
            href="https://mitappdev.com/products"
            className="text-gray-500 hover:text-gray-800"
          >
            Products
          </a>
          <a
            href="https://blog.mitappdev.com"
            className="text-gray-500 hover:text-gray-800"
          >
            Blog
          </a>
          <a
            href="https://mitappdev.com/apply"
            className="text-white bg-appdev-purple px-4 py-2 rounded-full hover:brightness-110"
          >
            Apply
          </a>
        </div>
        <div className="md:hidden flex items-center">
          <button
            className="text-gray-500 hover:text-gray-800 focus:outline-none"
            onClick={() => {
              document
                .querySelector(".mobile-menu")
                ?.classList.toggle("hidden");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="mobile-menu md:hidden mt-2 hidden">
        <Link
          href="https://mitappdev.com/team"
          className="block text-gray-500 hover:text-gray-800 py-2"
        >
          Team
        </Link>
        <Link
          href="https://mitappdev.com/products"
          className="block text-gray-500 hover:text-gray-800 py-2"
        >
          Products
        </Link>
        <Link
          href="https://blog.mitappdev.com"
          className="block text-gray-500 hover:text-gray-800 py-2"
        >
          Blog
        </Link>
        <Link
          href="https://mitappdev.com/apply"
          className="block text-gray-500 hover:text-gray-800 py-2"
        >
          Apply
        </Link>
      </div>
    </nav>
  );
}
