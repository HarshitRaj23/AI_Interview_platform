import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "../../../../firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  console.log("------ API HIT: /api/vapi/generate ------");
  try {
    const body = await request.json();
    console.log("DEBUG: Received POST body:", JSON.stringify(body, null, 2));

    const { type, role, level, techstack, amount, userid } = body;

    // Validate required fields
    if (!type || !role || !level || !techstack || !amount || !userid) {
      console.error("ERROR: Missing required fields!", { type, role, level, techstack, amount, userid });
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Generate questions from Gemini
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Return ONLY a raw JSON array of questions, with no text/comments before or after, e.g. ["Question 1", "Question 2", "Question 3"].
        DO NOT EXPLAIN OR ADD ANY OTHER WORDS.`
    });

    console.log("DEBUG: Gemini raw questions output:", questions);

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
      console.log("DEBUG: Successfully parsed questions as JSON array:", parsedQuestions);
    } catch (err) {
      // Try to recover if Gemini returns extra text
      const match = questions.match(/\[.*\]/s);
      if (match) {
        try {
          parsedQuestions = JSON.parse(match[0]);
          console.log("DEBUG: Parsed questions after recovery attempt:", parsedQuestions);
        } catch (err2) {
          console.error("ERROR: Recovery parse also failed!", match[0]);
          return Response.json({ success: false, error: "Invalid questions format even after recovery" }, { status: 500 });
        }
      } else {
        console.error("ERROR: Failed to parse Gemini output as JSON array:", questions);
        return Response.json({ success: false, error: "Invalid questions format" }, { status: 500 });
      }
    }

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((t) => t.trim()),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    console.log("DEBUG: Ready to save interview:", interview);

    await db.collection("interviews").add(interview);

    console.log("DEBUG: Interview saved successfully!");
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("ERROR in /api/vapi/generate:", error);
    return Response.json({ success: false, error: error?.toString() || "Unknown error" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
