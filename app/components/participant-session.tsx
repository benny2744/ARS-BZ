
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SessionStatus } from "@/components/session-status"
import { 
  Vote, 
  Users, 
  Clock, 
  CheckCircle,
  Upload,
  MessageSquare,
  Camera,
  Star,
  Loader2,
  ArrowLeft
} from "lucide-react"
import { toast } from "sonner"
import type { PollingSession, Question, User } from "@/lib/types"
import Link from "next/link"

interface ParticipantSessionProps {
  sessionId: string
  participantId?: string
  user?: User
}

export function ParticipantSession({ sessionId, participantId, user }: ParticipantSessionProps) {
  const [session, setSession] = useState<PollingSession | null>(null)
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [response, setResponse] = useState("")
  const [selectedOption, setSelectedOption] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [hasResponded, setHasResponded] = useState(false)
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    fetchSession()
    // Poll for session updates every 5 seconds
    const interval = setInterval(fetchSession, 5000)
    return () => clearInterval(interval)
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data)
        
        // Find active question
        const active = data.questions?.find((q: Question) => q.active)
        setActiveQuestion(active || null)
        
        // Check if user has already responded
        if (active && user) {
          const userResponse = active.responses?.find((r: any) => r.userId === user.id)
          setHasResponded(!!userResponse)
        }

        // Fetch results if allowed
        if (data.showRealTimeResults) {
          fetchResults()
        }
      } else if (response.status === 404) {
        toast.error("Session not found")
      }
    } catch (error) {
      console.error("Error fetching session:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/results`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error("Error fetching results:", error)
    }
  }

  const handleSubmitResponse = async () => {
    if (!activeQuestion || !participantId) return

    let responseData: any = {
      questionId: activeQuestion.id,
      sessionId,
      participantId,
      responseType: 'TEXT'
    }

    if (activeQuestion.type === 'MULTIPLE_CHOICE' || activeQuestion.type === 'POLL') {
      if (!selectedOption) {
        toast.error("Please select an option")
        return
      }
      responseData.responseType = 'OPTION'
      responseData.optionValue = selectedOption
    } else if (activeQuestion.type === 'TEXT') {
      if (!response.trim()) {
        toast.error("Please enter a response")
        return
      }
      responseData.textValue = response.trim()
    } else if (activeQuestion.type === 'PHOTO_UPLOAD') {
      if (!selectedFile) {
        toast.error("Please select a file to upload")
        return
      }
      
      // First upload the file
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!uploadResponse.ok) {
        toast.error("Failed to upload file")
        return
      }
      
      const uploadData = await uploadResponse.json()
      responseData.responseType = 'FILE'
      responseData.fileUrl = uploadData.fileUrl
    } else if (activeQuestion.type === 'RATING') {
      if (!response) {
        toast.error("Please provide a rating")
        return
      }
      responseData.responseType = 'RATING'
      responseData.textValue = response
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(responseData)
      })

      if (response.ok) {
        toast.success("Response submitted successfully!")
        setHasResponded(true)
        setResponse("")
        setSelectedOption("")
        setSelectedFile(null)
        fetchSession() // Refresh to get updated data
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to submit response")
      }
    } catch (error) {
      console.error("Error submitting response:", error)
      toast.error("Failed to submit response")
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      
      if (file.size > maxSize) {
        toast.error("File size must be less than 10MB")
        return
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only image files are allowed (JPG, PNG, GIF, WebP)")
        return
      }
      
      setSelectedFile(file)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading session...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-red-600 mb-4">Session not found or you don't have access to this session.</p>
            <Link href="/join">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Join
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Session Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-3">
                <Vote className="h-6 w-6 text-primary" />
                <span>{session.title}</span>
              </CardTitle>
              {session.description && (
                <CardDescription className="mt-2">{session.description}</CardDescription>
              )}
            </div>
            <SessionStatus 
              status={session.status}
              participantCount={session.participants?.length}
            />
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-4">
            <span className="font-mono bg-muted px-2 py-1 rounded font-bold">
              {session.sessionCode}
            </span>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{session.participants?.length || 0} participants</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Session Status Messages */}
      {session.status === 'WAITING' && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">Session hasn't started yet</p>
                <p className="text-yellow-700 text-sm">Please wait for the presenter to begin the session.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {session.status === 'COMPLETED' && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">Session completed</p>
                <p className="text-green-700 text-sm">Thank you for participating!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Question */}
      {activeQuestion && session.status === 'ACTIVE' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded">
                {activeQuestion.type === 'MULTIPLE_CHOICE' && <Vote className="h-5 w-5 text-blue-600" />}
                {activeQuestion.type === 'TEXT' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                {activeQuestion.type === 'PHOTO_UPLOAD' && <Camera className="h-5 w-5 text-blue-600" />}
                {activeQuestion.type === 'RATING' && <Star className="h-5 w-5 text-blue-600" />}
                {activeQuestion.type === 'POLL' && <Vote className="h-5 w-5 text-blue-600" />}
              </div>
              <span>Current Question</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">{activeQuestion.title}</h2>
            {activeQuestion.description && (
              <p className="text-muted-foreground mb-4">{activeQuestion.description}</p>
            )}

            {hasResponded ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Response submitted!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Thank you for your response. Wait for the next question.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Multiple Choice / Poll */}
                {(activeQuestion.type === 'MULTIPLE_CHOICE' || activeQuestion.type === 'POLL') && (
                  <div className="space-y-2">
                    {activeQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type={activeQuestion.type === 'MULTIPLE_CHOICE' ? 'radio' : 'checkbox'}
                          id={`option-${index}`}
                          name="option"
                          value={option}
                          checked={selectedOption === option}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="w-4 h-4"
                          disabled={submitting}
                        />
                        <label htmlFor={`option-${index}`} className="text-sm cursor-pointer flex-1 py-2">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Response */}
                {activeQuestion.type === 'TEXT' && (
                  <div className="space-y-2">
                    <Label htmlFor="textResponse">Your response</Label>
                    <textarea
                      id="textResponse"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type your response here..."
                      rows={4}
                      disabled={submitting}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                )}

                {/* Photo Upload */}
                {activeQuestion.type === 'PHOTO_UPLOAD' && (
                  <div className="space-y-2">
                    <Label htmlFor="photoUpload">Choose photo</Label>
                    <Input
                      id="photoUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={submitting}
                    />
                    {selectedFile && (
                      <p className="text-sm text-green-600">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                )}

                {/* Rating */}
                {activeQuestion.type === 'RATING' && (
                  <div className="space-y-2">
                    <Label htmlFor="ratingResponse">Rating (1-5)</Label>
                    <Input
                      id="ratingResponse"
                      type="number"
                      min="1"
                      max="5"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Enter rating from 1 to 5"
                      disabled={submitting}
                    />
                  </div>
                )}

                <Button 
                  onClick={handleSubmitResponse}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Submit Response</span>
                    </div>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results (if allowed) */}
      {session.showRealTimeResults && results && (
        <Card>
          <CardHeader>
            <CardTitle>Live Results</CardTitle>
            <CardDescription>Real-time response data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.results?.map((result: any) => (
                <div key={result.questionId} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-medium mb-2">{result.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {result.totalResponses} responses
                  </p>
                  
                  {result.optionCounts && (
                    <div className="space-y-2">
                      {Object.entries(result.optionCounts).map(([option, count]: [string, any]) => (
                        <div key={option} className="flex items-center justify-between">
                          <span className="text-sm">{option}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ 
                                  width: `${result.percentages?.[option] || 0}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {result.percentages?.[option] || 0}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {result.averageRating && (
                    <p className="text-sm">Average Rating: {result.averageRating}/5</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Active Question */}
      {!activeQuestion && session.status === 'ACTIVE' && (
        <Card>
          <CardContent className="p-12 text-center">
            <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Waiting for next question</p>
            <p className="text-muted-foreground">
              The presenter will activate the next question shortly.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
