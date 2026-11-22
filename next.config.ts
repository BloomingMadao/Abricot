/** @type {import('next').NextConfig} */
const nextConfig = {
  // The <title> of a page with generateMetadata (a project's name) goes in the <head>.
  // By default, Next.js sends the page first and adds the title at the END of the <body>
  // ("streaming metadata"): invalid HTML for the W3C validator (<title>, <meta> and <link> in the body).
  // /.*/: every browser gets the "blocking" version (the title in the <head>), as search engine bots do.
  // Cost: the page starts after its title is known; here it's the same request as the page (getProject).
  htmlLimitedBots: /.*/,
};

export default nextConfig;
