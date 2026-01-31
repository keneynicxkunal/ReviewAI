import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

interface ReviewRequest {
  code: string
  language: string
  securityMode?: boolean
  explainLevel?: 'junior' | 'senior'
}

export async function POST(request: NextRequest) {
  try {
    const body: ReviewRequest = await request.json()
    const { code, language, securityMode = false, explainLevel = 'senior' } = body

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    // Create comprehensive prompt for code review
    const reviewPrompt = `You are a senior software engineer and AI Code Reviewer at a top-tier tech company. Review the provided ${language} code as if it is going to production.

Analyze the code and provide a JSON response with the following structure:
{
  "bugs": [
    {
      "title": "Short descriptive title",
      "description": "Detailed explanation of the bug",
      "severity": "critical" | "high" | "medium" | "low",
      "line": line_number,
      "code": "relevant code snippet",
      "fix": "suggested fixed code",
      "explanation": "detailed explanation for ${explainLevel} developers"
    }
  ],
  "security": [
    {
      "title": "Short descriptive title",
      "description": "Detailed explanation of the security issue",
      "severity": "critical" | "high" | "medium" | "low",
      "line": line_number,
      "code": "relevant code snippet",
      "fix": "suggested fixed code",
      "explanation": "detailed explanation for ${explainLevel} developers"
    }
  ],
  "performance": [
    {
      "title": "Short descriptive title",
      "description": "Detailed explanation of the performance issue",
      "severity": "critical" | "high" | "medium" | "low",
      "line": line_number,
      "code": "relevant code snippet",
      "fix": "suggested optimized code",
      "explanation": "detailed explanation for ${explainLevel} developers"
    }
  ],
  "cleanCode": [
    {
      "title": "Short descriptive title",
      "description": "Detailed explanation of clean code issue",
      "severity": "critical" | "high" | "medium" | "low",
      "line": line_number,
      "code": "relevant code snippet",
      "fix": "suggested improved code",
      "explanation": "detailed explanation for ${explainLevel} developers"
    }
  ],
  "healthScore": 0-100,
  "improvedCode": "full improved version of the code",
  "testCases": ["test case 1", "test case 2"],
  "developerInsights": {
    "summary": "Overall summary of code quality",
    "keyPoints": ["key point 1", "key point 2"],
    "recommendations": ["recommendation 1", "recommendation 2"]
  }
}

Important Guidelines:
1. For ${explainLevel} level explanations: ${explainLevel === 'junior' ? 'Keep explanations simple, clear, and avoid jargon. Use analogies and step-by-step breakdowns.' : 'Provide detailed technical explanations with industry best practices, trade-offs, and production considerations.'}
2. ${securityMode ? 'Focus heavily on security vulnerabilities including SQL injection, XSS, CSRF, authentication flaws, authorization issues, etc.' : 'Provide balanced analysis across all categories.'}
3. Calculate healthScore based on: severity of issues found, code complexity, adherence to best practices, and potential bugs
4. improvedCode should be a complete, production-ready version addressing all identified issues
5. testCases should be practical, edge-case covering test suggestions
6. Provide specific line numbers where issues occur
7. Include actual code snippets in quotes

Code to review:
\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON, no markdown formatting.`

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer. Always respond with valid JSON only, no markdown.'
        },
        {
          role: 'user',
          content: reviewPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })

    const aiContent = response.choices[0].message.content || '{}'

    // Clean the response to ensure valid JSON
    const cleanedContent = aiContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    let reviewResult
    try {
      reviewResult = JSON.parse(cleanedContent)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('AI Content:', cleanedContent)

      // Return a fallback result if parsing fails
      reviewResult = {
        bugs: [
          {
            title: 'Analysis Error',
            description: 'Failed to parse AI response. Please try again.',
            severity: 'low' as const,
            line: 0,
            code: code.substring(0, 100) + '...',
            fix: 'Try reviewing the code again',
            explanation: 'There was an error processing the review. Please check the code and try again.'
          }
        ],
        security: [],
        performance: [],
        cleanCode: [],
        healthScore: 50,
        improvedCode: code,
        testCases: [],
        developerInsights: {
          summary: 'Unable to complete full analysis',
          keyPoints: ['Please try again'],
          recommendations: ['Check code syntax', 'Ensure code is complete']
        }
      }
    }

    // Validate and ensure all required fields exist
    const validatedResult = {
      bugs: Array.isArray(reviewResult.bugs) ? reviewResult.bugs : [],
      security: Array.isArray(reviewResult.security) ? reviewResult.security : [],
      performance: Array.isArray(reviewResult.performance) ? reviewResult.performance : [],
      cleanCode: Array.isArray(reviewResult.cleanCode) ? reviewResult.cleanCode : [],
      healthScore: typeof reviewResult.healthScore === 'number' ? reviewResult.healthScore : 75,
      improvedCode: typeof reviewResult.improvedCode === 'string' ? reviewResult.improvedCode : code,
      testCases: Array.isArray(reviewResult.testCases) ? reviewResult.testCases : [],
      developerInsights: {
        summary: reviewResult.developerInsights?.summary || 'Code analysis completed',
        keyPoints: Array.isArray(reviewResult.developerInsights?.keyPoints) ? reviewResult.developerInsights.keyPoints : [],
        recommendations: Array.isArray(reviewResult.developerInsights?.recommendations) ? reviewResult.developerInsights.recommendations : []
      }
    }

    // Save to database
    try {
      await db.codeReview.create({
        data: {
          code,
          language,
          results: JSON.stringify(validatedResult),
          healthScore: validatedResult.healthScore
        }
      })
    } catch (dbError) {
      console.error('Failed to save to database:', dbError)
      // Continue even if database save fails
    }

    return NextResponse.json(validatedResult)
  } catch (error) {
    console.error('Code review error:', error)
    return NextResponse.json(
      { error: 'Failed to review code', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
