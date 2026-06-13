const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const Image = require("@11ty/eleventy-img");
const path = require("path");
const fs = require("fs");

// Cap parallel image jobs — high concurrency over hundreds of large JPEGs
// intermittently fails sharp; a modest cap makes the build deterministic.
Image.concurrency = 3;

// Generate resized WebP derivatives for a source image (web path like
// "/assets/img/gallery/xv/foo.JPEG"). Returns eleventy-img metadata.
// Output files land in _site/assets/img/opt/ and are content-hashed +
// cached, so repeat builds are fast.
async function optimize(src, widths) {
  const input = path.join(__dirname, "src", src);
  return Image(input, {
    widths,
    formats: ["webp"],
    outputDir: path.join(__dirname, "_site/assets/img/opt/"),
    urlPath: "/assets/img/opt/",
    sharpWebpOptions: { quality: 72 },
    // Don't crash the whole build on one unreadable file.
    failOnError: false,
  });
}

const escAttr = (s) => String(s || "").replace(/"/g, "&quot;");

module.exports = function(eleventyConfig) {
  // Passthrough — keep originals (used full-size by the lightbox)
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/llms.txt": "llms.txt" });

  // Plugins
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  // ── IMAGE PIPELINE ──────────────────────────────────────────────
  // Gallery thumbnail: small WebP for the grid, original kept for the lightbox.
  eleventyConfig.addNunjucksAsyncShortcode("galThumb", async function(src, cat) {
    try {
      const m = await optimize(src, [500]);
      const img = m.webp[m.webp.length - 1];
      return `<img src="${img.url}" alt="${escAttr("Pichardo's Photography — " + cat + " session")}" loading="lazy" decoding="async" width="${img.width}" height="${img.height}" data-lightbox="${escAttr(src)}">`;
    } catch (e) {
      return `<img src="${escAttr(src)}" alt="${escAttr(cat + " photography")}" loading="lazy" data-lightbox="${escAttr(src)}">`;
    }
  });

  // Generic responsive image (decorative strips, feature photos, banners).
  // opts: { widths, sizes, class, loading, fetchpriority, lightbox, ariaHidden }
  eleventyConfig.addNunjucksAsyncShortcode("pic", async function(src, alt, opts) {
    opts = opts || {};
    const widths = opts.widths || [800];
    const sizes = opts.sizes || "100vw";
    const klass = opts.class ? ` class="${escAttr(opts.class)}"` : "";
    const loading = opts.loading || "lazy";
    const fp = opts.fetchpriority ? ` fetchpriority="${opts.fetchpriority}"` : "";
    const lb = opts.lightbox ? ` data-lightbox="${escAttr(src)}"` : "";
    const ah = opts.ariaHidden ? ` aria-hidden="true"` : "";
    const st = opts.style ? ` style="${escAttr(opts.style)}"` : "";
    try {
      const m = await optimize(src, widths);
      const set = m.webp;
      const big = set[set.length - 1];
      const srcset = set.map(i => `${i.url} ${i.width}w`).join(", ");
      return `<img${klass} src="${big.url}" srcset="${srcset}" sizes="${escAttr(sizes)}" alt="${escAttr(alt)}" width="${big.width}" height="${big.height}" loading="${loading}" decoding="async"${fp}${lb}${ah}${st}>`;
    } catch (e) {
      return `<img${klass} src="${escAttr(src)}" alt="${escAttr(alt)}" loading="${loading}"${fp}${lb}${ah}${st}>`;
    }
  });

  // Hero carousel: optimized first frame + a JSON list of optimized frames
  // for the JS to rotate through. `list` is an array of web paths.
  eleventyConfig.addNunjucksAsyncShortcode("heroBg", async function(list, alt) {
    const urls = [], positions = [];
    let first = null, firstPos = "center top";
    for (const item of list) {
      const src = (item && item.src) ? item.src : item;
      const pos = (item && item.pos) ? item.pos : "center top";
      try {
        const m = await optimize(src, [1600]);
        const img = m.webp[m.webp.length - 1];
        if (!first) { first = img; firstPos = pos; }
        urls.push(img.url);
        positions.push(pos);
      } catch (e) { /* skip unreadable frame */ }
    }
    if (!first) {
      const f0 = (list[0] && list[0].src) ? list[0].src : list[0];
      return `<img class="hero-bg-img" src="${escAttr(f0)}" alt="${escAttr(alt)}" loading="eager" fetchpriority="high">`;
    }
    return `<img class="hero-bg-img" src="${first.url}" alt="${escAttr(alt)}" width="${first.width}" height="${first.height}" loading="eager" fetchpriority="high" decoding="async" style="object-position:${escAttr(firstPos)}" data-images='${JSON.stringify(urls)}' data-positions='${JSON.stringify(positions)}'>`;
  });

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
