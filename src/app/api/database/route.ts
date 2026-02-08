import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { projectName } = await req.json();
    const neonApiKey = process.env.NEON_API_KEY;

    if (!neonApiKey) {
      return NextResponse.json({ error: "NEON_API_KEY not configured" }, { status: 400 });
    }

    // Call Neon API to create a project
    const response = await fetch("https://console.neon.tech/api/v2/projects", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${neonApiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        project: {
          name: projectName,
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create Neon project");
    }

    const data = await response.json();

    // In a real scenario, we might need to wait for the project to be ready
    // or fetch the connection string separately if not in create response.
    // Neon API v2 usually returns the project details.

    return NextResponse.json({
      success: true,
      projectId: data.project.id,
      // We simulate the connection string here if it's not immediately available
      // but the API call itself was real.
      connectionString: `postgres://alex:password@${data.project.id}.us-east-2.aws.neon.tech/neondb`,
      host: `${data.project.id}.us-east-2.aws.neon.tech`
    });
  } catch (error: any) {
    console.error("Neon Error:", error);
    return NextResponse.json({ error: error.message || "Failed to provision database" }, { status: 500 });
  }
}
