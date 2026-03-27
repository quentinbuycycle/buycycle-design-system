import fs from "fs";
import path from "path";
import { IconLibrary } from "./IconLibrary";
import styles from "./page.module.css";

const ICONS_DIR = path.join(process.cwd(), "public", "icons");

function loadIcons(category: string) {
  const dir = path.join(ICONS_DIR, category);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".svg"))
    .map((filename) => {
      const svgContent = fs.readFileSync(path.join(dir, filename), "utf-8");
      return {
        name: filename.replace(".svg", ""),
        filename,
        url: `/icons/${category}/${filename}`,
        category,
        svgContent,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function IconsPage() {
  const monotone = loadIcons("monotone");
  const duotone = loadIcons("duotone");

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Icons</h1>
          <p className={styles.heroSubtitle}>
            Browse and download buycycle icons in SVG format. Click to download, right-click to copy SVG code.
          </p>
        </div>
      </section>

      <IconLibrary monotone={monotone} duotone={duotone} />
    </>
  );
}
