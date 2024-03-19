import type { NavMenuConfig } from "@/types";

export const navMenuConfig: NavMenuConfig = {
  infosNav: [
    {
      title: "Resources",
      items: [
        {
          title: "Homepage",
          href: "/",
          description: "The Chrome Extension for data tranquility",
          image: "/images/examples/landing.jpg",
        },
        {
          title: "Changelog",
          href: "/releases",
          description: "Stay up to date with the latest changes.",
          image: "/images/examples/changelog.jpg",
        },
        {
          title: "Waitlist",
          href: "/waitlist",
          description:
            "Join the waitlist to be the first to know when we launch.",
          image: "/images/examples/waitlist.jpg",
          forceReload: true,
        },
      ],
    },
  ],
  examplesNav: [
    {
      title: "Examples",
      items: [
        {
          title: "Static Blog",
          href: "/blog",
          description: "A Markdown/MDX blog built using Content Collections.",
          image: "/images/examples/static-blog.jpg",
        },
        {
          title: "Docs",
          href: "/docs/getting-started",
          description:
            "A Markdown/MDX docs site built using Content Collections.",
          image: "/images/examples/documentation.jpg",
        },
        {
          title: "Blog DB",
          href: "/blog-db",
          description:
            "Blog built using Astro DB. With categories, views & likes.",
          // image: "/images/examples/blog-db.jpg",
          disabled: true,
        },
        {
          title: "Ecommerce",
          href: "/products",
          disabled: true,
          description: "Ecommerce pages fetching data from an API.",
          // image: "/images/examples/ecommerce.jpg",
        },
        {
          title: "Anime List",
          href: "/animes",
          description: "Fetch anime content from an graphql endpoint",
          // image: "/images/examples/animes.jpg",
          disabled: true,
        },
        {
          title: "Authentification",
          href: "/auth",
          description: "Implement an authentification using Astro DB & Lucia",
          // image: "/images/examples/auth.jpg",
          disabled: true,
        },
      ],
    },
  ],
  links: [
    {
      title: "Pricing",
      href: "/pricing",
      description: "Pricing cards, FAQs and more.",
      image: "/images/examples/pricing.jpg",
    },
    {
      title: "About",
      href: "/about",
      description: "Simple page",
      image: "/images/examples/about.jpg",
    },
  ],
};
