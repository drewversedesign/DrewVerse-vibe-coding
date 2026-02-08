import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { projectName, repoUrl, type = "static_site" } = await req.json();
    const renderApiKey = process.env.RENDER_API_KEY;

    if (!renderApiKey) {
      return NextResponse.json({ error: "RENDER_API_KEY not configured" }, { status: 400 });
    }

    if (!repoUrl) {
      return NextResponse.json({ error: "GitHub Repository URL is required for real deployment" }, { status: 400 });
    }

    // Call Render API to create a service
    const response = await fetch("https://api.render.com/v1/services", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${renderApiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        type,
        name: projectName,
        repo: repoUrl,
        branch: "main",
        // Additional config could be added here
        autoDeploy: "yes"
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create Render service");
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      serviceId: data.id,
      url: data.url || `https://${projectName.toLowerCase().replace(/\s+/g, '-')}.onrender.com`
    });
  } catch (error: any) {
    console.error("Render Deployment Error:", error);
    return NextResponse.json({ error: error.message || "Failed to initiate deployment" }, { status: 500 });
  }
}
