import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'

interface PDFRequest {
  code: string
  language: string
  results: any
  explainLevel: string
}

export async function POST(request: NextRequest) {
  try {
    const body: PDFRequest = await request.json()
    const { code, language, results, explainLevel } = body

    if (!results) {
      return NextResponse.json(
        { error: 'Results are required' },
        { status: 400 }
      )
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const maxWidth = pageWidth - 2 * margin
    let yPosition = margin

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize = 10, isBold = false, yPos = yPosition) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')

      const lines = doc.splitTextToSize(text, maxWidth)

      // Check if we need a new page
      if (yPos + lines.length * fontSize + 10 > pageHeight - margin) {
        doc.addPage()
        yPos = margin
      }

      lines.forEach((line: string, index: number) => {
        doc.text(line, margin, yPos + index * fontSize)
      })

      return yPos + lines.length * fontSize + 5
    }

    // Title
    doc.setTextColor(88, 28, 135) // Purple
    yPosition = addText('ReviewAI - Code Review Report', 24, true, margin)
    yPosition += 10

    // Subtitle
    doc.setTextColor(100, 100, 100)
    yPosition = addText(`Generated on ${new Date().toLocaleString()}`, 10, false, yPosition)
    yPosition += 10

    // Code Health Score
    doc.setTextColor(0, 0, 0)
    yPosition = addText(`Code Health Score: ${results.healthScore}/100`, 14, true, yPosition)
    yPosition += 10

    // Health Score Bar
    const scoreColor = results.healthScore >= 80 ? 'green' : results.healthScore >= 60 ? 'yellow' : results.healthScore >= 40 ? 'orange' : 'red'
    doc.setDrawColor(scoreColor)
    doc.setFillColor(scoreColor)
    doc.rect(margin, yPosition, maxWidth, 8, 'FD')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text(`${results.healthScore}%`, margin + 5, yPosition + 6)
    doc.setTextColor(0, 0, 0)
    yPosition += 15

    // Language and Explain Level
    yPosition = addText(`Language: ${language}`, 10, false, yPosition)
    yPosition = addText(`Explanation Level: ${explainLevel}`, 10, false, yPosition)
    yPosition += 10

    // Developer Insights
    if (results.developerInsights) {
      yPosition = addText('Developer Insights', 14, true, yPosition)
      yPosition += 5

      if (results.developerInsights.summary) {
        yPosition = addText(`Summary: ${results.developerInsights.summary}`, 10, false, yPosition)
        yPosition += 5
      }

      if (results.developerInsights.keyPoints && results.developerInsights.keyPoints.length > 0) {
        yPosition = addText('Key Points:', 10, true, yPosition)
        results.developerInsights.keyPoints.forEach((point: string) => {
          yPosition = addText(`• ${point}`, 10, false, yPosition)
        })
        yPosition += 5
      }

      if (results.developerInsights.recommendations && results.developerInsights.recommendations.length > 0) {
        yPosition = addText('Recommendations:', 10, true, yPosition)
        results.developerInsights.recommendations.forEach((rec: string) => {
          yPosition = addText(`• ${rec}`, 10, false, yPosition)
        })
        yPosition += 10
      }
    }

    // Bugs Section
    if (results.bugs && results.bugs.length > 0) {
      yPosition = addText('🐛 Bugs Found', 14, true, yPosition)
      yPosition += 5

      results.bugs.forEach((bug: any, index: number) => {
        yPosition = addText(`${index + 1}. ${bug.title}`, 11, true, yPosition)
        yPosition = addText(`Severity: ${bug.severity.toUpperCase()}`, 10, false, yPosition)
        yPosition = addText(`Description: ${bug.description}`, 10, false, yPosition)

        if (bug.code) {
          yPosition = addText('Issue Location:', 10, true, yPosition)
          yPosition = addText(bug.code.substring(0, 200), 9, false, yPosition)
        }

        if (bug.explanation) {
          yPosition = addText(`Explanation (${explainLevel}):`, 10, true, yPosition)
          yPosition = addText(bug.explanation, 10, false, yPosition)
        }

        if (bug.fix) {
          yPosition = addText('Recommended Fix:', 10, true, yPosition)
          yPosition = addText(bug.fix.substring(0, 300), 9, false, yPosition)
        }

        yPosition += 10
      })
    }

    // Security Section
    if (results.security && results.security.length > 0) {
      yPosition = addText('🔒 Security Issues', 14, true, yPosition)
      yPosition += 5

      results.security.forEach((issue: any, index: number) => {
        yPosition = addText(`${index + 1}. ${issue.title}`, 11, true, yPosition)
        yPosition = addText(`Severity: ${issue.severity.toUpperCase()}`, 10, false, yPosition)
        yPosition = addText(`Description: ${issue.description}`, 10, false, yPosition)

        if (issue.code) {
          yPosition = addText('Issue Location:', 10, true, yPosition)
          yPosition = addText(issue.code.substring(0, 200), 9, false, yPosition)
        }

        if (issue.explanation) {
          yPosition = addText(`Explanation (${explainLevel}):`, 10, true, yPosition)
          yPosition = addText(issue.explanation, 10, false, yPosition)
        }

        if (issue.fix) {
          yPosition = addText('Recommended Fix:', 10, true, yPosition)
          yPosition = addText(issue.fix.substring(0, 300), 9, false, yPosition)
        }

        yPosition += 10
      })
    }

    // Performance Section
    if (results.performance && results.performance.length > 0) {
      yPosition = addText('⚡ Performance Issues', 14, true, yPosition)
      yPosition += 5

      results.performance.forEach((issue: any, index: number) => {
        yPosition = addText(`${index + 1}. ${issue.title}`, 11, true, yPosition)
        yPosition = addText(`Severity: ${issue.severity.toUpperCase()}`, 10, false, yPosition)
        yPosition = addText(`Description: ${issue.description}`, 10, false, yPosition)

        if (issue.code) {
          yPosition = addText('Issue Location:', 10, true, yPosition)
          yPosition = addText(issue.code.substring(0, 200), 9, false, yPosition)
        }

        if (issue.explanation) {
          yPosition = addText(`Explanation (${explainLevel}):`, 10, true, yPosition)
          yPosition = addText(issue.explanation, 10, false, yPosition)
        }

        if (issue.fix) {
          yPosition = addText('Recommended Fix:', 10, true, yPosition)
          yPosition = addText(issue.fix.substring(0, 300), 9, false, yPosition)
        }

        yPosition += 10
      })
    }

    // Clean Code Section
    if (results.cleanCode && results.cleanCode.length > 0) {
      yPosition = addText('🧹 Clean Code Issues', 14, true, yPosition)
      yPosition += 5

      results.cleanCode.forEach((issue: any, index: number) => {
        yPosition = addText(`${index + 1}. ${issue.title}`, 11, true, yPosition)
        yPosition = addText(`Severity: ${issue.severity.toUpperCase()}`, 10, false, yPosition)
        yPosition = addText(`Description: ${issue.description}`, 10, false, yPosition)

        if (issue.code) {
          yPosition = addText('Issue Location:', 10, true, yPosition)
          yPosition = addText(issue.code.substring(0, 200), 9, false, yPosition)
        }

        if (issue.explanation) {
          yPosition = addText(`Explanation (${explainLevel}):`, 10, true, yPosition)
          yPosition = addText(issue.explanation, 10, false, yPosition)
        }

        if (issue.fix) {
          yPosition = addText('Recommended Fix:', 10, true, yPosition)
          yPosition = addText(issue.fix.substring(0, 300), 9, false, yPosition)
        }

        yPosition += 10
      })
    }

    // Test Cases
    if (results.testCases && results.testCases.length > 0) {
      yPosition = addText('🧪 Suggested Test Cases', 14, true, yPosition)
      yPosition += 5

      results.testCases.forEach((testCase: string, index: number) => {
        yPosition = addText(`${index + 1}. ${testCase}`, 10, false, yPosition)
      })
    }

    // Improved Code Section (truncated)
    if (results.improvedCode) {
      doc.addPage()
      yPosition = margin
      yPosition = addText('✨ Improved Code', 14, true, yPosition)
      yPosition += 10

      const codeLines = doc.splitTextToSize(results.improvedCode.substring(0, 3000), maxWidth)
      codeLines.forEach((line: string, index: number) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
        doc.setFontSize(8)
        doc.setFont('courier', 'normal')
        doc.text(line, margin, yPosition + index * 8)
      })
    }

    // Footer on all pages
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('Generated by ReviewAI - AI-Powered Code Review', margin, pageHeight - 10)
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 30, pageHeight - 10)
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="reviewai-report.pdf"'
      }
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
