import { describe, expect, test } from "bun:test";
import {
  NOTE_IMAGE_BACKGROUND_COLORS,
  NOTE_IMAGE_THEMES,
  buildImageExportBasename,
  buildNoteImageCardMarkup,
  estimateReadingStats,
  generateCardCss,
  resolveTheme,
} from "./note-image-card";

describe("note-image-card shared module", () => {
  test("resolves theme correctly with fallbacks", () => {
    expect(resolveTheme(undefined, "notepad")).toBe("notepad");
    expect(resolveTheme(undefined, "xuan")).toBe("xuan");
    expect(resolveTheme("warm", undefined)).toBe("sunset");
    expect(resolveTheme(undefined, undefined)).toBe("aurora");
  });

  test("retains valid colors for current themes and legacy slate exports", () => {
    const expectedThemes = ["slate", "aurora", "sunset", "midnight", "mint", "lavender", "notepad", "xuan", "polaroid"];
    for (const theme of expectedThemes) {
      expect(NOTE_IMAGE_THEMES[theme]).toBeDefined();
      expect(NOTE_IMAGE_BACKGROUND_COLORS[theme]).toBeDefined();
      expect(NOTE_IMAGE_THEMES[theme].cardBg).toBeDefined();
      expect(NOTE_IMAGE_THEMES[theme].textColor).toBeDefined();
    }
  });

  test("generates rich card markup with title, date, and official EdgeEver logo badge", () => {
    const markup = buildNoteImageCardMarkup({
      title: "Shared Card Title",
      notebook: "Work",
      tags: ["feature", "design"],
      updatedAt: "2026-08-22",
      bodyHtml: "<p>Note body text</p>",
      theme: "slate",
      fontStyle: "serif",
      showTitle: true,
      showNotebook: false,
      showTags: false,
      showUpdatedAt: true,
      showBranding: true,
    });

    expect(markup).toContain("Shared Card Title");
    expect(markup).toContain("2026-08-22");
    expect(markup).toContain("edgeever-brand-logo");
    expect(markup).toContain("EdgeEver");
    expect(markup).not.toContain("edgeever-meta-notebook");
    expect(markup).not.toContain("edgeever-meta-tag");
  });

  test("generates notepad theme markup and CSS with tear strip and ruled lines", () => {
    const markup = buildNoteImageCardMarkup({
      title: "Notepad Memo",
      bodyHtml: "<p>Classic note line</p>",
      theme: "notepad",
      fontStyle: "serif",
    });
    expect(markup).toContain("edgeever-card-tear-strip");

    const css = generateCardCss({
      theme: "notepad",
      fontStyle: "serif",
      fontSize: "lg",
      cardWidth: "standard",
    });
    expect(css).toContain("edgeever-card-tear-strip");
    expect(css).toContain("linear-gradient(to bottom, transparent calc(100% - 1px), #e8decb calc(100% - 1px))");
  });

  test("generates terminal header for mono font style", () => {
    const markup = buildNoteImageCardMarkup({
      title: "Code Memo",
      notebook: "TerminalNote",
      bodyHtml: "<p>console.log()</p>",
      theme: "midnight",
      fontStyle: "mono",
    });
    expect(markup).toContain("edgeever-terminal-header");
    expect(markup).toContain("TerminalNote");
  });

  test("generates polaroid theme card with custom author and reading time", () => {
    const markup = buildNoteImageCardMarkup({
      title: "Memories in Summer",
      notebook: "Journal",
      bodyHtml: "<p>A quick reflection on building delightful software.</p>",
      theme: "polaroid",
      fontStyle: "serif",
      showTitle: true,
      showReadingTime: true,
      author: "@tianma",
      showAuthor: true,
      showBranding: true,
    });

    expect(markup).toContain("edgeever-grain-overlay");
    expect(markup).toContain("data-theme=\"polaroid\"");
    expect(markup).toContain("@tianma");
    expect(markup).toContain("edgeever-footer-author");
    expect(markup).toContain("edgeever-meta-reading");

    const css = generateCardCss({
      theme: "polaroid",
      fontStyle: "serif",
      fontSize: "md",
      cardWidth: "standard",
    });
    expect(css).toContain("data-theme=\"polaroid\"");
    expect(css).toContain("edgeever-grain-overlay");
  });

  test("calculates reading stats for mixed Chinese and English text", () => {
    const stats = estimateReadingStats("<p>这里是中文内容五十字。</p><p>Some english words here.</p>");
    expect(stats.totalCount).toBeGreaterThan(0);
    expect(stats.minutes).toBeGreaterThanOrEqual(1);
  });

  test("sanitizes filenames and guards against reserved Windows names", () => {
    expect(buildImageExportBasename("CON", "fallback")).toBe("_CON");
    expect(buildImageExportBasename("My Note/Title?*", "fallback")).toBe("My Note-Title--");
  });
});
