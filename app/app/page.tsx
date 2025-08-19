
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { 
  Vote, 
  Users, 
  BarChart3, 
  Smartphone,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle
} from "lucide-react"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <main className="container mx-auto max-w-7xl px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Vote className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Real-time Audience Response System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Engage your audience with interactive polls, voting, and multimedia responses. 
            Perfect for presentations, meetings, and educational sessions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session?.user ? (
              <>
                <Link href="/dashboard">
                  <Button size="lg" className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="outline" size="lg" className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Admin Panel</span>
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/join">
                  <Button size="lg" className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Join Session</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" size="lg">
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Vote className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Multiple Question Types</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Support for multiple choice polls, text responses, photo submissions, 
                ratings, and more to gather diverse feedback.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Real-time Results</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                See responses as they come in with live charts and analytics. 
                Toggle visibility for participants as needed.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Smartphone className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Mobile Friendly</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Works seamlessly on all devices. Participants can join and respond 
                using their smartphones, tablets, or computers.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Flexible Access</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Choose between authenticated user access or anonymous participation 
                with nicknames for maximum flexibility.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Rich Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detailed results with charts, participant tracking, and export 
                capabilities to analyze engagement and responses.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Shield className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Admin Controls</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Full session management with the ability to control question flow, 
                manage participants, and moderate responses.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Session</h3>
              <p className="text-gray-600">
                Admin creates a polling session with questions and shares the session code
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Participants Join</h3>
              <p className="text-gray-600">
                Audience members enter the session code to join and start responding
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">View Results</h3>
              <p className="text-gray-600">
                Real-time results and analytics help drive engagement and insights
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Get Started</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/join">
                <CardHeader className="text-center">
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>Join a Session</CardTitle>
                  <CardDescription>
                    Enter a session code to participate in real-time polling
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            {!session?.user && (
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/auth/signup">
                  <CardHeader className="text-center">
                    <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                      Sign up as admin to create and manage your own sessions
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
