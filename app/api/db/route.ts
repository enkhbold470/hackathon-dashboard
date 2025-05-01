import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // Fast test connection endpoint doesn't require userId
    if (action === 'test-connection') {
      return NextResponse.json({ success: true, message: 'Database connection successful' });
    }
    
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    switch (action) {
      case 'get-application':
        const application = await prisma.application.findUnique({
          where: { userId }
        });
        return NextResponse.json({ application });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Database API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, ...data } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    switch (action) {
      case 'save-application': {
        // Single database operation with upsert
        const application = await prisma.application.upsert({
          where: { userId },
          update: {
            cwid: data.cwid,
            fullName: data.full_name,
            discord: data.discord,
            skillLevel: data.skill_level,
            hackathonExperience: data.hackathon_experience,
            hearAboutUs: data.hear_about_us,
            whyAttend: data.why_attend,
            projectExperience: data.project_experience,
            futurePlans: data.future_plans,
            funFact: data.fun_fact,
            selfDescription: data.self_description,
            links: data.links,
            teammates: data.teammates,
            referralEmail: data.referral_email,
            dietaryRestrictionsExtra: data.dietary_restrictions_extra,
            tshirtSize: data.tshirt_size,
            agreeToTerms: data.agree_to_terms || false,
            status: data.status || 'in_progress'
          },
          create: {
            userId,
            cwid: data.cwid,
            fullName: data.full_name,
            discord: data.discord,
            skillLevel: data.skill_level,
            hackathonExperience: data.hackathon_experience,
            hearAboutUs: data.hear_about_us,
            whyAttend: data.why_attend,
            projectExperience: data.project_experience,
            futurePlans: data.future_plans,
            funFact: data.fun_fact,
            selfDescription: data.self_description,
            links: data.links,
            teammates: data.teammates,
            referralEmail: data.referral_email,
            dietaryRestrictionsExtra: data.dietary_restrictions_extra,
            tshirtSize: data.tshirt_size,
            agreeToTerms: data.agree_to_terms || false,
            status: data.status || 'in_progress'
          }
        });

        return NextResponse.json({ success: true, application });
      }
      
      case 'submit-application': {
        const application = await prisma.application.update({
          where: { userId },
          data: { status: 'submitted' }
        });
        
        return NextResponse.json({ success: true, application });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Database API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 