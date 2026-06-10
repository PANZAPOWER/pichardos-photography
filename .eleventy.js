const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const path = require("path");
const fs = require("fs");

module.exports = function(eleventyConfig) {
  // Passthrough
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/llms.txt": "llms.txt" });

  // Plugins
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  // Filters
  eleventyConfig.addFilter("slugify", (str) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  );
  eleventyConfig.addFilter("jsonStringify", (obj) => JSON.stringify(obj));
  eleventyConfig.addFilter("dateYear", () => new Date().getFullYear());

  // Gallery data — auto-discover images
  eleventyConfig.addGlobalData("galleryImages", () => {
    const galleryDir = path.join(__dirname, "src/assets/img/gallery");
    const result = {};
    if (!fs.existsSync(galleryDir)) return result;
    const cats = fs.readdirSync(galleryDir);
    for (const cat of cats) {
      const catPath = path.join(galleryDir, cat);
      if (!fs.statSync(catPath).isDirectory()) continue;
      result[cat] = fs.readdirSync(catPath)
        .filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f))
        .map(f => `/assets/img/gallery/${cat}/${f}`);
    }
    return result;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
