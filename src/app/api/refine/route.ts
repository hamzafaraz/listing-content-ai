import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { restrictedKeywords } from '@/data/restrictedKeywords';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
        }

        const { imagePlan, userInstruction, projectContext } = await req.json();

        if (!imagePlan || !userInstruction) {
            return NextResponse.json({ error: { message: 'Missing required fields' } }, { status: 400 });
        }

        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: { message: 'Anthropic API key not configured' } },
                { status: 500 }
            );
        }

        // Construct the refinement prompt
        const systemPrompt = `You are an expert Amazon listing designer assisting a user in refining their listing content. 
        Your goal is to modify the provided image plan based ONLY on the user's specific instruction.
        
        CRITICAL RESTRICTION: You must NEVER use the following restricted keywords or phrases in your output:
        ${restrictedKeywords.join(', ')}
        
        If the user asks for something that violates this list, politely refuse or find a compliant alternative.
        
        INSTRUCTIONS:
        1. Maintain the overall JSON structure of the image plan (imageNumber, purpose, textContent, visualGuidance, aiPrompt).
        2. You MAY add or update the following standard fields in 'textContent' if the user requests them, even if they are currently missing:
           - headline
           - subheadline
           - bulletPoints (array of strings)
           - badges (array of strings)
           - callToAction
        3. Only update the fields requested by the user. Leave others unchanged unless they conflict with the request.`;

        const userMessage = `
        Current Image Plan:
        ${JSON.stringify(imagePlan, null, 2)}

        Project Context (Product Info):
        ${JSON.stringify(projectContext, null, 2)}

        User Instruction:
        "${userInstruction}"

        Please update the "Current Image Plan" based on the "User Instruction".
        Respond with ONLY a JSON object containing the updated image plan (with the same structure: imageNumber, purpose, textContent, visualGuidance, aiPrompt).
        Do not explain the changes, just return the JSON.
        `;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 2000,
                system: systemPrompt,
                messages: [{ role: 'user', content: userMessage }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return NextResponse.json(data, { status: 400 });
        }

        const aiResponseText = data.content[0].text;

        // Extract JSON
        let updatedPlan;
        try {
            const cleanText = aiResponseText.replace(/```json|```/g, '').trim();
            const startIndex = cleanText.indexOf('{');
            const endIndex = cleanText.lastIndexOf('}');
            if (startIndex !== -1 && endIndex !== -1) {
                updatedPlan = JSON.parse(cleanText.substring(startIndex, endIndex + 1));
            } else {
                updatedPlan = JSON.parse(cleanText);
            }
        } catch (e) {
            console.error('JSON Parse Error:', e);
            return NextResponse.json({ error: { message: 'Failed to parse AI response' } }, { status: 500 });
        }

        return NextResponse.json({ updatedPlan });

    } catch (error: any) {
        console.error('Error in refinement API:', error);
        return NextResponse.json(
            { error: { message: error.message || 'Internal server error' } },
            { status: 500 }
        );
    }
}
