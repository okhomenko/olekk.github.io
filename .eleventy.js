module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/style.css": "style.css" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/ads.txt": "ads.txt" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/og-default.svg": "og-default.svg" });

  eleventyConfig.addGlobalData("site", {
    url: "https://olekk.com",
    title: "Oleksandr Khomenko",
    description:
      "Essays on software engineering, AI-enabled development, product architecture, systems thinking, and endurance running.",
    author: "Oleksandr Khomenko",
    github: "https://github.com/okhomenko",
    defaultOgImage: "/og-default.svg",
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

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value, null, 2));

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
