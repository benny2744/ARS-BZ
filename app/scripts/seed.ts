
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Create test admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const testPassword = await bcrypt.hash('johndoe123', 10)

    const admin = await prisma.user.upsert({
      where: { email: 'admin@demo.com' },
      update: {},
      create: {
        email: 'admin@demo.com',
        name: 'Admin User',
        role: 'ADMIN',
        password: adminPassword,
      },
    })

    // Create test user with exact credentials as requested
    const testUser = await prisma.user.upsert({
      where: { email: 'john@doe.com' },
      update: {},
      create: {
        email: 'john@doe.com',
        name: 'John Doe',
        role: 'ADMIN',
        password: testPassword,
      },
    })

    // Create a few participant users
    const participant1 = await prisma.user.upsert({
      where: { email: 'participant1@demo.com' },
      update: {},
      create: {
        email: 'participant1@demo.com',
        name: 'Alice Johnson',
        role: 'PARTICIPANT',
        password: await bcrypt.hash('demo123', 10),
      },
    })

    const participant2 = await prisma.user.upsert({
      where: { email: 'participant2@demo.com' },
      update: {},
      create: {
        email: 'participant2@demo.com',
        name: 'Bob Smith',
        role: 'PARTICIPANT',
        password: await bcrypt.hash('demo123', 10),
      },
    })

    console.log('👤 Created users:', {
      admin: admin.email,
      testUser: testUser.email,
      participant1: participant1.email,
      participant2: participant2.email
    })

    // Create a sample polling session
    const session = await prisma.pollingSession.create({
      data: {
        title: 'Team Meeting Feedback',
        description: 'Gather feedback about our recent team meeting and upcoming projects',
        sessionCode: 'DEMO01',
        adminId: admin.id,
        status: 'WAITING',
        allowAnonymous: true,
        showRealTimeResults: false,
        maxParticipants: 50
      }
    })

    // Create sample questions for the session
    const question1 = await prisma.question.create({
      data: {
        sessionId: session.id,
        title: 'How would you rate the overall meeting quality?',
        description: 'Please rate on a scale of 1-5',
        type: 'MULTIPLE_CHOICE',
        options: ['⭐ 1 - Poor', '⭐⭐ 2 - Fair', '⭐⭐⭐ 3 - Good', '⭐⭐⭐⭐ 4 - Very Good', '⭐⭐⭐⭐⭐ 5 - Excellent'],
        required: true,
        order: 1
      }
    })

    const question2 = await prisma.question.create({
      data: {
        sessionId: session.id,
        title: 'What topics should we prioritize in our next sprint?',
        description: 'Select all that apply',
        type: 'POLL',
        options: ['UI/UX Improvements', 'Backend Performance', 'Security Updates', 'New Features', 'Bug Fixes', 'Documentation'],
        required: false,
        order: 2
      }
    })

    const question3 = await prisma.question.create({
      data: {
        sessionId: session.id,
        title: 'Any additional feedback or suggestions?',
        description: 'Please share your thoughts',
        type: 'TEXT',
        options: [],
        required: false,
        order: 3
      }
    })

    const question4 = await prisma.question.create({
      data: {
        sessionId: session.id,
        title: 'Share a photo of your workspace setup',
        description: 'Optional: Show us your work environment',
        type: 'PHOTO_UPLOAD',
        options: [],
        required: false,
        order: 4
      }
    })

    console.log('📝 Created session with questions:', {
      session: session.title,
      sessionCode: session.sessionCode,
      questionsCount: 4
    })

    // Create another completed session with responses
    const completedSession = await prisma.pollingSession.create({
      data: {
        title: 'Product Launch Survey',
        description: 'Feedback on our new product launch',
        sessionCode: 'PROD01',
        adminId: admin.id,
        status: 'COMPLETED',
        allowAnonymous: true,
        showRealTimeResults: true,
        maxParticipants: 100
      }
    })

    const completedQuestion = await prisma.question.create({
      data: {
        sessionId: completedSession.id,
        title: 'How likely are you to recommend our product?',
        type: 'MULTIPLE_CHOICE',
        options: ['Not at all likely', 'Unlikely', 'Neutral', 'Likely', 'Very likely'],
        required: true,
        order: 1,
        active: false
      }
    })

    // Add some participants to sessions
    const sessionParticipant1 = await prisma.sessionParticipant.create({
      data: {
        sessionId: session.id,
        userId: participant1.id
      }
    })

    const sessionParticipant2 = await prisma.sessionParticipant.create({
      data: {
        sessionId: session.id,
        nickname: 'AnonymousUser1'
      }
    })

    // Add some sample responses to the completed session
    await prisma.response.create({
      data: {
        questionId: completedQuestion.id,
        sessionId: completedSession.id,
        userId: participant1.id,
        responseType: 'OPTION',
        optionValue: 'Very likely'
      }
    })

    await prisma.response.create({
      data: {
        questionId: completedQuestion.id,
        sessionId: completedSession.id,
        userId: participant2.id,
        responseType: 'OPTION',
        optionValue: 'Likely'
      }
    })

    console.log('🎯 Created sample data successfully!')
    console.log('🔑 Test credentials:')
    console.log('   Admin: admin@demo.com / admin123')
    console.log('   Test Admin: john@doe.com / johndoe123') 
    console.log('   Participant 1: participant1@demo.com / demo123')
    console.log('   Participant 2: participant2@demo.com / demo123')
    console.log('📊 Demo session code: DEMO01')

  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
