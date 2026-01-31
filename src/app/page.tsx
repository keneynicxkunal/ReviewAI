'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import Editor from '@monaco-editor/react'
import { CheckCircle2, AlertTriangle, XCircle, Bug, Shield, Zap, Code2, Download, Sparkles, ArrowRight, FileCode, Lock, TestTube2, GitPullRequest, Brain, Zap as ZapIcon, HeartPulse, TrendingUp } from 'lucide-react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued'

interface ReviewResult {
  bugs: Array<{
    title: string
    description: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    line: number
    code: string
    fix?: string
    explanation?: string
  }>
  security: Array<{
    title: string
    description: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    line: number
    code: string
    fix?: string
    explanation?: string
  }>
  performance: Array<{
    title: string
    description: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    line: number
    code: string
    fix?: string
    explanation?: string
  }>
  cleanCode: Array<{
    title: string
    description: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    line: number
    code: string
    fix?: string
    explanation?: string
  }>
  healthScore: number
  improvedCode?: string
  testCases?: string[]
  developerInsights?: {
    summary: string
    keyPoints: string[]
    recommendations: string[]
  }
}

export default function ReviewAI() {
  const [activeSection, setActiveSection] = useState<'landing' | 'playground'>('landing')
  const [code, setCode] = useState(`// Example code with some issues
function processUserData(user) {
  var data = user.data;
  var processed = [];

  for(var i = 0; i < data.length; i++) {
    var item = data[i];
    processed.push({
      name: item.n,
      email: item.e,
      value: parseInt(item.v)
    });
  }

  return processed;
}

function validateInput(input) {
  if(input === null || input === undefined) {
    return false;
  }
  return true;
}

function calculateTotal(items) {
  var total = 0;
  for(var i = 0; i < items.length; i++) {
    total = total + items[i].price * items[i].quantity;
  }
  return total;
}
`)
  const [language, setLanguage] = useState('javascript')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ReviewResult | null>(null)
  const [explainLevel, setExplainLevel] = useState<'junior' | 'senior'>('senior')
  const [securityMode, setSecurityMode] = useState(false)
  const [showDiff, setShowDiff] = useState(false)

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' }
  ]

  const handleReview = async () => {
    if (!code.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some code to review',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          securityMode,
          explainLevel
        })
      })

      if (!response.ok) {
        throw new Error('Failed to review code')
      }

      const data = await response.json()
      setResults(data)
      toast({
        title: 'Success!',
        description: 'Code review completed successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to review code. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!results) return

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          results,
          explainLevel
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reviewai-report-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Success!',
        description: 'PDF report downloaded successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download PDF report',
        variant: 'destructive'
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'low':
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />
      default:
        return <CheckCircle2 className="h-5 w-5" />
    }
  }

  const renderIssueList = (issues: ReviewResult['bugs'], category: string) => {
    if (!issues || issues.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <p className="text-lg">No issues found in this category!</p>
          <p className="text-sm mt-2">Your code looks great for {category.toLowerCase()}.</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {issues.map((issue, index) => (
          <Card key={index} className="border-l-4" style={{ borderLeftColor: getSeverityColor(issue.severity) === 'bg-red-500' ? '#ef4444' : getSeverityColor(issue.severity) === 'bg-orange-500' ? '#f97316' : getSeverityColor(issue.severity) === 'bg-yellow-500' ? '#eab308' : '#3b82f6' }}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(issue.severity)}
                  <CardTitle className="text-lg">{issue.title}</CardTitle>
                </div>
                <Badge className={getSeverityColor(issue.severity)}>
                  {issue.severity}
                </Badge>
              </div>
              <CardDescription className="mt-2">{issue.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {issue.code && (
                <div>
                  <Label className="text-sm font-semibold">Issue Location</Label>
                  <div className="mt-2 bg-muted rounded-md p-4 overflow-x-auto">
                    <code className="text-sm whitespace-pre-wrap">{issue.code}</code>
                  </div>
                </div>
              )}
              {issue.explanation && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertTitle className="text-sm font-semibold">
                    {explainLevel === 'junior' ? '🧒 Simple Explanation' : '👨‍💻 Senior Developer Insights'}
                  </AlertTitle>
                  <AlertDescription className="text-sm mt-1">{issue.explanation}</AlertDescription>
                </Alert>
              )}
              {issue.fix && (
                <div>
                  <Label className="text-sm font-semibold">✨ Recommended Fix</Label>
                  <div className="mt-2 bg-green-50 dark:bg-green-950/20 rounded-md p-4 overflow-x-auto">
                    <code className="text-sm whitespace-pre-wrap">{issue.fix}</code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Landing Page
  if (activeSection === 'landing') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-blue-950/20">
        {/* Header */}
        <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ReviewAI
                </h1>
                <p className="text-xs text-muted-foreground">AI-Powered Code Review</p>
              </div>
            </div>
            <Button onClick={() => setActiveSection('playground')} size="lg" className="shadow-lg">
              Try Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1">
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-5xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="mb-4 px-4 py-1 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
                  🚀 Production-Ready AI Code Review
                </Badge>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                  Ship Cleaner, Faster,<br />Safer Code with AI
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                  Experience the power of AI-driven code review. Detect bugs, security vulnerabilities, and performance issues before they reach production. Get senior-level insights and suggestions instantly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={() => setActiveSection('playground')}
                    size="lg"
                    className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Review Your Code Now
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    <FileCode className="mr-2 h-5 w-5" />
                    View Demo
                  </Button>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <div className="text-4xl font-bold text-purple-600 mb-2">50K+</div>
                  <div className="text-sm text-muted-foreground">Reviews Generated</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">Bug Detection Rate</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">2M+</div>
                  <div className="text-sm text-muted-foreground">Lines of Code</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                  <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-4 bg-white/50 dark:bg-gray-800/50">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
                <p className="text-xl text-muted-foreground">Everything you need for production-ready code</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-xl">
                  <CardHeader>
                    <Bug className="h-12 w-12 text-purple-600 mb-2" />
                    <CardTitle>Bug Detection</CardTitle>
                    <CardDescription>Find bugs before they hit production with advanced AI analysis</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-xl">
                  <CardHeader>
                    <Shield className="h-12 w-12 text-blue-600 mb-2" />
                    <CardTitle>Security Analysis</CardTitle>
                    <CardDescription>Identify vulnerabilities and security risks in your codebase</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-2 hover:border-indigo-500 transition-all hover:shadow-xl">
                  <CardHeader>
                    <Zap className="h-12 w-12 text-indigo-600 mb-2" />
                    <CardTitle>Performance Optimization</CardTitle>
                    <CardDescription>Optimize code performance with AI-powered suggestions</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-2 hover:border-green-500 transition-all hover:shadow-xl">
                  <CardHeader>
                    <Code2 className="h-12 w-12 text-green-600 mb-2" />
                    <CardTitle>Clean Code Best Practices</CardTitle>
                    <CardDescription>Follow industry standards and maintainable code patterns</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-2 hover:border-orange-500 transition-all hover:shadow-xl">
                  <CardHeader>
                    <Brain className="h-12 w-12 text-orange-600 mb-2" />
                    <CardTitle>Explain Like I'm Junior/Senior</CardTitle>
                    <CardDescription>Toggle explanations to match your experience level</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-2 hover:border-pink-500 transition-all hover:shadow-xl">
                  <CardHeader>
                    <TrendingUp className="h-12 w-12 text-pink-600 mb-2" />
                    <CardTitle>Code Health Score</CardTitle>
                    <CardDescription>Get a comprehensive score for your code quality</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-2 hover:border-red-500 transition-all hover:shadow-xl">
                  <CardHeader>
                    <Lock className="h-12 w-12 text-red-600 mb-2" />
                    <CardTitle>Security Mode</CardTitle>
                    <CardDescription>Deep security analysis for production code</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-2 hover:border-teal-500 transition-all hover:shadow-xl">
                  <CardHeader>
                    <TestTube2 className="h-12 w-12 text-teal-600 mb-2" />
                    <CardTitle>Auto Test Suggestions</CardTitle>
                    <CardDescription>Get automated test case suggestions for your code</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-2 hover:border-cyan-500 transition-all hover:shadow-xl">
                  <CardHeader>
                    <GitPullRequest className="h-12 w-12 text-cyan-600 mb-2" />
                    <CardTitle>GitHub PR Integration</CardTitle>
                    <CardDescription>Automated pull request reviews coming soon</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-4xl">
              <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white border-0 shadow-2xl">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-4xl mb-4">Ready to Improve Your Code?</CardTitle>
                  <CardDescription className="text-white/90 text-lg">
                    Join thousands of developers shipping better code with ReviewAI
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    onClick={() => setActiveSection('playground')}
                    size="lg"
                    variant="secondary"
                    className="text-lg px-8 py-6"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Your First Review
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mt-auto">
          <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
            <p className="mb-2">© 2024 ReviewAI. All rights reserved.</p>
            <p className="text-sm">Built with ❤️ for developers who care about code quality</p>
          </div>
        </footer>
      </div>
    )
  }

  // Code Review Playground
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-blue-950/20">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ReviewAI
              </h1>
              <p className="text-xs text-muted-foreground">AI-Powered Code Review</p>
            </div>
          </div>
          <Button onClick={() => setActiveSection('landing')} variant="ghost" size="sm">
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Code Input */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-purple-600" />
                  Code Review Playground
                </CardTitle>
                <CardDescription>
                  Paste your code below for instant AI-powered analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">Programming Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-4 pt-6">
                    <Switch
                      id="security-mode"
                      checked={securityMode}
                      onCheckedChange={setSecurityMode}
                    />
                    <Label htmlFor="security-mode" className="flex items-center gap-2 cursor-pointer">
                      <Lock className="h-4 w-4" />
                      Security Mode
                    </Label>
                  </div>
                </div>

                <div className="h-[400px] border rounded-lg overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: 'on',
                      padding: { top: 16, bottom: 16 }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Label htmlFor="explain-level">Explanation Level:</Label>
                    <Select value={explainLevel} onValueChange={(value: any) => setExplainLevel(value)}>
                      <SelectTrigger id="explain-level" className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">🧒 Junior</SelectItem>
                        <SelectItem value="senior">👨‍💻 Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleReview}
                    disabled={loading}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Review Code
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Developer Insights */}
            {results?.developerInsights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-orange-600" />
                    Developer Insights
                  </CardTitle>
                  <CardDescription>
                    Why this matters in production
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <ZapIcon className="h-4 w-4" />
                    <AlertTitle>Summary</AlertTitle>
                    <AlertDescription className="mt-2">
                      {results.developerInsights.summary}
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Key Points</Label>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      {results.developerInsights.keyPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Recommendations</Label>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      {results.developerInsights.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-4">
            {results ? (
              <>
                {/* Code Health Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="h-5 w-5 text-pink-600" />
                        Code Health Score
                      </div>
                      <div className={`text-4xl font-bold ${getHealthScoreColor(results.healthScore)}`}>
                        {results.healthScore}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={results.healthScore} className={`h-3 ${getHealthScoreBg(results.healthScore)}`} />
                    <p className="text-sm text-muted-foreground mt-2">
                      {results.healthScore >= 80 ? 'Excellent! Your code is production-ready.' :
                       results.healthScore >= 60 ? 'Good! A few improvements needed.' :
                       results.healthScore >= 40 ? 'Fair! Several issues need attention.' :
                       'Needs improvement! Critical issues found.'}
                    </p>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setShowDiff(!showDiff)}
                        variant={showDiff ? 'default' : 'outline'}
                        className="flex-1"
                      >
                        <FileCode className="mr-2 h-4 w-4" />
                        {showDiff ? 'Hide' : 'Show'} Diff View
                      </Button>
                      <Button
                        onClick={handleDownloadPDF}
                        variant="outline"
                        className="flex-1"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Diff View */}
                {showDiff && results.improvedCode && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileCode className="h-5 w-5 text-blue-600" />
                        Before vs After
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] overflow-auto">
                        <ReactDiffViewer
                          oldValue={code}
                          newValue={results.improvedCode}
                          splitView={true}
                          useDarkTheme={true}
                          compareMethod={DiffMethod.WORDS}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Test Cases */}
                {results.testCases && results.testCases.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TestTube2 className="h-5 w-5 text-teal-600" />
                        Suggested Test Cases
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {results.testCases.map((testCase, idx) => (
                          <Alert key={idx}>
                            <TestTube2 className="h-4 w-4" />
                            <AlertDescription className="text-sm">{testCase}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Review Results Tabs */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>AI Review Report</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {results.bugs.length + results.security.length + results.performance.length + results.cleanCode.length} Issues Found
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="bugs" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="bugs" className="flex items-center gap-2">
                          <Bug className="h-4 w-4" />
                          Bugs
                          {results.bugs.length > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                              {results.bugs.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Security
                          {results.security.length > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                              {results.security.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Performance
                          {results.performance.length > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                              {results.performance.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="cleanCode" className="flex items-center gap-2">
                          <Code2 className="h-4 w-4" />
                          Clean Code
                          {results.cleanCode.length > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                              {results.cleanCode.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="bugs" className="mt-6 max-h-[600px] overflow-y-auto">
                        {renderIssueList(results.bugs, 'Bugs')}
                      </TabsContent>

                      <TabsContent value="security" className="mt-6 max-h-[600px] overflow-y-auto">
                        {renderIssueList(results.security, 'Security')}
                      </TabsContent>

                      <TabsContent value="performance" className="mt-6 max-h-[600px] overflow-y-auto">
                        {renderIssueList(results.performance, 'Performance')}
                      </TabsContent>

                      <TabsContent value="cleanCode" className="mt-6 max-h-[600px] overflow-y-auto">
                        {renderIssueList(results.cleanCode, 'Clean Code')}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-full min-h-[600px] flex items-center justify-center">
                <CardContent className="text-center">
                  <Sparkles className="h-24 w-24 mx-auto mb-6 text-purple-600/50" />
                  <h3 className="text-2xl font-semibold mb-2">Ready to Review</h3>
                  <p className="text-muted-foreground mb-6">
                    Paste your code on the left and click "Review Code" to get started
                  </p>
                  <div className="space-y-3 text-left max-w-md mx-auto">
                    <div className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-semibold">Bug Detection</div>
                        <div className="text-muted-foreground">Find bugs before they hit production</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <div className="font-semibold">Security Analysis</div>
                        <div className="text-muted-foreground">Identify vulnerabilities and security risks</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <Zap className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <div className="font-semibold">Performance Optimization</div>
                        <div className="text-muted-foreground">Optimize code for better performance</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <Code2 className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <div className="font-semibold">Clean Code Best Practices</div>
                        <div className="text-muted-foreground">Follow industry coding standards</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 ReviewAI. All rights reserved. | Built with ❤️ for developers who care about code quality</p>
        </div>
      </footer>
    </div>
  )
}
