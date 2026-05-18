module.exports = function (eleventyConfig) {
  const social = {
    github: {
      label: "GitHub",
      handle: "@okhomenko",
      url: "https://github.com/okhomenko",
    },
    twitter: {
      label: "Twitter/X",
      handle: "@okhomenko",
      url: "https://x.com/okhomenko",
    },
    linkedin: {
      label: "LinkedIn",
      handle: "Oleksandr Khomenko",
      url: "https://www.linkedin.com/in/okhomenko/",
    },
  };

  eleventyConfig.addPassthroughCopy({ "src/style.css": "style.css" });
  eleventyConfig.addPassthroughCopy({ "src/theme.js": "theme.js" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/ads.txt": "ads.txt" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "src/favicon-light.svg": "favicon-light.svg" });
  eleventyConfig.addPassthroughCopy({ "src/favicon-dark.svg": "favicon-dark.svg" });
  eleventyConfig.addPassthroughCopy({ "src/logo.svg": "logo.svg" });
  eleventyConfig.addPassthroughCopy({ "src/profile-photo.png": "profile-photo.png" });
  eleventyConfig.addPassthroughCopy({ "src/og-default.svg": "og-default.svg" });
  eleventyConfig.addPassthroughCopy({ "src/og-default.png": "og-default.png" });
  eleventyConfig.addPassthroughCopy({ "src/og": "og" });

  eleventyConfig.addGlobalData("site", {
    url: "https://olekk.com",
    title: "Oleksandr Khomenko",
    description:
      "Essays on software engineering, AI-enabled development, product architecture, systems thinking, and endurance running.",
    author: "Oleksandr Khomenko",
    social,
    socialProfiles: [
      social.github.url,
      social.twitter.url,
      social.linkedin.url,
    ],
    defaultOgImage: "/og-default.png",
    defaultOgImageAlt:
      "Oleksandr Khomenko. Notes from building software and running long.",
    defaultOgImageWidth: 1200,
    defaultOgImageHeight: 630,
    defaultOgImageType: "image/png",
    analytics: {
      cloudflareBeaconToken: "0c5fa71fc7784c68afc245daaa3071d9",
    },
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return new Date(dateObj).toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(dateObj));
  });

  eleventyConfig.addFilter("absoluteUrl", (url, base) => {
    return new URL(url || "/", base).toString();
  });

  eleventyConfig.addFilter("withAnyTag", (posts = [], tags = []) => {
    const wantedTags = Array.isArray(tags) ? tags : [tags].filter(Boolean);
    if (wantedTags.length === 0) return [];

    return posts.filter((post) => {
      const postTags = Array.isArray(post?.data?.tags) ? post.data.tags : [];
      return wantedTags.some((tag) => postTags.includes(tag));
    });
  });

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value, null, 2));

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
