module.exports = {
  permalink: "posts/{{ page.fileSlug }}.html",
  eleventyComputed: {
    ogImage: (data) => data.ogImage || `/og/posts/${data.page.fileSlug}.png`,
    ogImageAlt: (data) => data.ogImageAlt || `${data.title}. ${data.description}`,
  },
};
