import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const ICONS_DIR = path.join(process.cwd(), "public", "icons");
const CATEGORIES = ["monotone", "duotone"] as const;

function isAuthenticated(authCookie: string | undefined): boolean {
  const uploadPassword = process.env.UPLOAD_PASSWORD;
  if (!uploadPassword || !authCookie) return false;

  const expectedToken = crypto
    .createHmac("sha256", uploadPassword)
    .update("buycycle-hub-auth")
    .digest("hex");

  return authCookie === expectedToken;
}

export async function GET() {
  try {
    const result: Record<string, Array<{
      name: string;
      filename: string;
      url: string;
      category: string;
    }>> = {};

    for (const category of CATEGORIES) {
      const dir = path.join(ICONS_DIR, category);
      if (!fs.existsSync(dir)) {
        result[category] = [];
        continue;
      }

      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".svg"));
      result[category] = files
        .map((filename) => ({
          name: filename.replace(".svg", ""),
          filename,
          url: `/icons/${category}/${filename}`,
          category,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing icons:", error);
    return NextResponse.json(
      { error: "Failed to list icons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("hub-auth");

    if (!isAuthenticated(authCookie?.value)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("icons") as File[];
    const category = (formData.get("category") as string) || "monotone";

    if (!CATEGORIES.includes(category as typeof CATEGORIES[number])) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!files.length) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const invalid = files.filter(
      (f) => !f.name.endsWith(".svg") && f.type !== "image/svg+xml"
    );
    if (invalid.length) {
      return NextResponse.json(
        {
          error: `Only SVG files are allowed. Invalid: ${invalid.map((f) => f.name).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const targetDir = path.join(ICONS_DIR, category);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const uploaded: string[] = [];
    const githubToken = process.env.GITHUB_TOKEN;

    for (const file of files) {
      const sanitized = file.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9._-]/g, "");

      const content = await file.text();
      fs.writeFileSync(path.join(targetDir, sanitized), content, "utf-8");
      uploaded.push(sanitized);

      if (githubToken) {
        await commitIconToGitHub(category, sanitized, content, githubToken);
      }
    }

    return NextResponse.json({ success: true, uploaded });
  } catch (error) {
    console.error("Upload error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function commitIconToGitHub(
  category: string,
  filename: string,
  content: string,
  token: string
): Promise<void> {
  const filePath = `public/icons/${category}/${filename}`;
  const url = `https://api.github.com/repos/quentinbuycycle/buycycle-design-hub/contents/${filePath}`;

  let sha: string | undefined;
  const getRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (getRes.ok) {
    const existing = await getRes.json();
    sha = existing.sha;
  }

  const body: Record<string, string> = {
    message: `feat: add ${category} icon — ${filename}`,
    content: Buffer.from(content, "utf-8").toString("base64"),
  };
  if (sha) {
    body.sha = sha;
  }

  const putRes = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    console.error(`GitHub commit failed for ${filename}: ${putRes.status} — ${err}`);
  }
}
