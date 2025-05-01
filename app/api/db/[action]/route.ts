import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Helper function to convert snake_case to camelCase
function toCamelCase(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  });
  
  return result;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    const action = params.action;
    const data = await request.json();

    console.log(`API POST received: action=${action}, userId=${userId}`);
    console.log('Request data:', data);

    switch (action) {
      case 'submit': {
        console.log('Processing submit action');
        // Convert data from snake_case to camelCase
        const camelCaseData = toCamelCase(data);
        console.log('Converted to camelCase:', camelCaseData);
        
        // Save and submit the application in one step
        const submittedApplication = await prisma.application.upsert({
          where: { userId },
          update: {
            ...camelCaseData,
            status: 'submitted',
            updatedAt: new Date(),
          },
          create: {
            userId,
            ...camelCaseData,
            status: 'submitted',
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
        
        console.log('Application submitted successfully:', submittedApplication);
        return NextResponse.json({ 
          success: true, 
          application: submittedApplication 
        });
      }
      
      case 'confirm-attendance': {
        const updatedApplication = await prisma.application.update({
          where: { userId },
          data: {
            status: 'confirmed',
            updatedAt: new Date(),
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          application: updatedApplication 
        });
      }
      
      case 'decline-attendance': {
        const updatedApplication = await prisma.application.update({
          where: { userId },
          data: {
            status: 'waitlisted',
            updatedAt: new Date(),
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          application: updatedApplication 
        });
      }
      


      default:
        console.log(`Invalid action: ${action}`);
        return NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('API error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { action: string } }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    const params = await context.params;
    const { action } = params;
    console.log(`API GET received: action=${action}, userId=${userId}`);

    switch (action) {
      case 'get': {
        const application = await prisma.application.findUnique({
          where: { userId }
        });
        
        console.log('Retrieved application:', application);
        return NextResponse.json({ 
          success: true, 
          application: application || null
        });
      }
      
      
      default:
        console.log(`Invalid GET action: ${action}`);
        return NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('API GET error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
} 