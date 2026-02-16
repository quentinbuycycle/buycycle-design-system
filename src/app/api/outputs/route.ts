import { NextResponse } from "next/server";

interface OutputData {
  slug: string;
  title: string;
  author: string;
  date: string;
  tags: string[];
  problem: string;
  solution: string;
  rationale: string;
  limitations: string;
}

function parseFrontmatter(markdown: string): {
  frontmatter: Record<string, any>;
  content: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content: markdown };
  }

  const frontmatterText = match[1];
  const content = match[2];

  const frontmatter: Record<string, any> = {};
  const lines = frontmatterText.split("\n");

  let currentKey = "";
  let currentValue = "";
  let inArray = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("- ")) {
      // Array item
      if (inArray && currentKey === "tags") {
        const item = trimmedLine.slice(2).replace(/^["']|["']$/g, "");
        if (!frontmatter[currentKey]) {
          frontmatter[currentKey] = [];
        }
        frontmatter[currentKey].push(item);
      }
    } else if (trimmedLine.includes(":")) {
      // Save previous key if exists
      if (currentKey && !inArray) {
        frontmatter[currentKey] = currentValue.replace(/^["']|["']$/g, "");
      }

      // Parse new key-value
      const colonIndex = trimmedLine.indexOf(":");
      currentKey = trimmedLine.slice(0, colonIndex).trim();
      let value = trimmedLine.slice(colonIndex + 1).trim();

      // Check for inline array notation
      if (value.startsWith("[") && value.endsWith("]")) {
        try {
          frontmatter[currentKey] = JSON.parse(value);
          currentKey = "";
          inArray = false;
        } catch {
          currentValue = value;
          inArray = false;
        }
      } else if (value === "") {
        // Empty value might mean array or nested object follows
        inArray = currentKey === "tags" || currentKey === "prototypes" || currentKey === "finalPrototypes";
        currentValue = "";
      } else {
        currentValue = value;
        inArray = false;
      }
    }
  }

  // Save last key
  if (currentKey && !inArray) {
    frontmatter[currentKey] = currentValue.replace(/^["']|["']$/g, "");
  }

  return { frontmatter, content };
}

function extractSections(content: string): {
  problem: string;
  solution: string;
  rationale: string;
  limitations: string;
} {
  const sections = {
    problem: "",
    solution: "",
    rationale: "",
    limitations: "",
  };

  const problemMatch = content.match(/## Problem\s*\n([\s\S]*?)(?=\n## |$)/);
  const solutionMatch = content.match(/## Solution\s*\n([\s\S]*?)(?=\n## |$)/);
  const rationaleMatch = content.match(/## UX & UI Rationale\s*\n([\s\S]*?)(?=\n## |$)/);
  const limitationsMatch = content.match(/## System Limitations\s*\n([\s\S]*?)(?=\n## |$)/);

  if (problemMatch) sections.problem = problemMatch[1].trim();
  if (solutionMatch) sections.solution = solutionMatch[1].trim();
  if (rationaleMatch) sections.rationale = rationaleMatch[1].trim();
  if (limitationsMatch) sections.limitations = limitationsMatch[1].trim();

  return sections;
}

async function fetchOutputsFromGitHub(token: string): Promise<OutputData[]> {
  const url = "https://api.github.com/repos/quentinbuycycle/buycycle-design-hub/contents/content/output";

  const listRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!listRes.ok) {
    throw new Error(`Failed to list files from GitHub: ${listRes.status}`);
  }

  const files = await listRes.json();
  const markdownFiles = files.filter(
    (f: any) => f.type === "file" && f.name.endsWith(".md")
  );

  const outputs: OutputData[] = [];

  for (const file of markdownFiles) {
    const fileRes = await fetch(file.download_url);
    if (!fileRes.ok) continue;

    const markdown = await fileRes.text();
    const { frontmatter, content } = parseFrontmatter(markdown);
    const sections = extractSections(content);

    const slug = file.name.replace(".md", "");

    outputs.push({
      slug,
      title: frontmatter.title || "",
      author: frontmatter.author || "",
      date: frontmatter.date || "",
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      problem: sections.problem,
      solution: sections.solution,
      rationale: sections.rationale,
      limitations: sections.limitations,
    });
  }

  return outputs;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");
    const sinceParam = searchParams.get("since");

    // 1. Password check
    const uploadPassword = process.env.UPLOAD_PASSWORD;
    if (!uploadPassword || password !== uploadPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get GitHub token
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return NextResponse.json(
        { error: "Server misconfiguration: missing GITHUB_TOKEN" },
        { status: 500 }
      );
    }

    // 3. Fetch all outputs from GitHub
    let outputs = await fetchOutputsFromGitHub(githubToken);

    // 4. Filter by date if 'since' is provided
    if (sinceParam) {
      const sinceDate = new Date(sinceParam);
      if (!isNaN(sinceDate.getTime())) {
        outputs = outputs.filter((output) => {
          const outputDate = new Date(output.date);
          return outputDate >= sinceDate;
        });
      }
    }

    // 5. Sort by date descending (most recent first)
    outputs.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    // 6. Return response
    return NextResponse.json({
      outputs,
      count: outputs.length,
    });
  } catch (error) {
    console.error("Outputs fetch error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
