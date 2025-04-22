import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuth } from "@clerk/nextjs/server";

// Helper function to convert snake_case keys to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelCaseKey = key.replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
      );
      result[camelCaseKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

// Helper function to convert camelCase keys to snake_case
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toSnakeCase(v));
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeCaseKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      result[snakeCaseKey] = toSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  const action = params.action;
  console.log(`[API GET] Processing ${action} request`);
  
  const { userId } = getAuth(request);
  if (!userId) {
    console.error("[API GET] Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(`[API GET] Authorized user: ${userId}`);

  try {
    const searchParams = request.nextUrl.searchParams;
    
    switch (action) {
      case 'test-connection': {
        console.log("[API GET] Testing database connection");
        const result = await query<any[]>('SELECT version()', []);
        console.log(`[API GET] Database version: ${result[0]?.version}`);
        return NextResponse.json({ success: true, version: result[0]?.version });
      }
              
      case 'get-application': {
        console.log(`[API GET] Fetching application for user ${userId}`);
        let applicationResult = await query<any[]>(
          'SELECT * FROM applications WHERE user_id = $1',
          [userId]
        );

        if (applicationResult.length === 0) {
          // No application found, create a new one with default status
          console.log(`[API GET] No application found for user ${userId}. Creating a new one.`);
          const insertQuery = `
            INSERT INTO applications (user_id, status)
            VALUES ($1, $2)
            RETURNING *;
          `;
          const insertValues = [userId, 'not_started'];
          console.log(`[API GET] Executing INSERT query with user_id=${userId}, status=not_started`);
          const newApplication = await query<any[]>(insertQuery, insertValues);
          
          if (newApplication.length === 0) {
            // Handle potential insertion error (though unlikely if SELECT failed)
            console.error(`[API GET] Failed to create initial application for user ${userId}.`);
            return NextResponse.json({ error: 'Failed to initialize application data' }, { status: 500 });
          }
          console.log(`[API GET] New application created successfully with ID: ${newApplication[0].id}`);
          // Set the result to the newly created application
          applicationResult = newApplication;
        } else {
          console.log(`[API GET] Existing application found for user ${userId} with ID: ${applicationResult[0].id}`);
        }
        
        // Convert snake_case from DB to camelCase for client
        const camelCaseResult = toCamelCase(applicationResult[0]);
        console.log(`[API GET] Returning application data: ${JSON.stringify(camelCaseResult)}`);
        return NextResponse.json({ application: camelCaseResult });
      }

      default:
        console.error(`[API GET] Invalid action requested: ${action}`);
        return NextResponse.json(
          { error: `Invalid GET action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error(`[API GET Error] (${action}):`, error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  const action = params.action;
  console.log(`[API POST] Processing ${action} request`);
  
  const { userId } = getAuth(request);
  if (!userId) {
    console.error("[API POST] Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(`[API POST] Authorized user: ${userId}`);

  try {
    const body = await request.json();
    console.log(`[API POST] Request body for ${action}:`, JSON.stringify(body));
    
    switch (action) {
      case 'save-application': {
        // Convert camelCase from client to snake_case for DB
        const applicationData = toSnakeCase(body);
        console.log(`[API POST] Saving application for user ${userId}`);

        // Ensure user_id is set in the data
        applicationData.user_id = userId;

        // Extract fields matching the database schema
        const { 
          user_id,
          legal_name,
          email,
          university,
          major,
          graduation_year,
          experience,
          why_attend,
          project_experience,
          future_plans,
          fun_fact,
          self_description,
          links,
          teammates,
          referral_email,
          dietary_restrictions,
          agree_to_terms,
          status = 'in_progress' // Default status when saving
        } = applicationData;

        // Basic validation (more robust validation should exist, potentially reusing Zod schema)
        if (!user_id) {
          console.error("[API POST] Missing required user_id");
          return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
        }

        console.log(`[API POST] Preparing to upsert application for user ${user_id}`);

        const upsertQuery = `
          INSERT INTO applications (
            user_id, legal_name, email, university, major, graduation_year, experience, 
            why_attend, project_experience, future_plans, fun_fact, self_description, 
            links, teammates, referral_email, dietary_restrictions, agree_to_terms, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (user_id) DO UPDATE SET
            legal_name = COALESCE(EXCLUDED.legal_name, applications.legal_name),
            email = COALESCE(EXCLUDED.email, applications.email), 
            university = COALESCE(EXCLUDED.university, applications.university),
            major = COALESCE(EXCLUDED.major, applications.major),
            graduation_year = COALESCE(EXCLUDED.graduation_year, applications.graduation_year),
            experience = COALESCE(EXCLUDED.experience, applications.experience),
            why_attend = COALESCE(EXCLUDED.why_attend, applications.why_attend),
            project_experience = COALESCE(EXCLUDED.project_experience, applications.project_experience),
            future_plans = COALESCE(EXCLUDED.future_plans, applications.future_plans),
            fun_fact = COALESCE(EXCLUDED.fun_fact, applications.fun_fact),
            self_description = COALESCE(EXCLUDED.self_description, applications.self_description),
            links = COALESCE(EXCLUDED.links, applications.links),
            teammates = COALESCE(EXCLUDED.teammates, applications.teammates),
            referral_email = COALESCE(EXCLUDED.referral_email, applications.referral_email),
            dietary_restrictions = COALESCE(EXCLUDED.dietary_restrictions, applications.dietary_restrictions),
            agree_to_terms = COALESCE(EXCLUDED.agree_to_terms, applications.agree_to_terms),
            status = CASE 
                WHEN applications.status = 'submitted' THEN 'submitted' 
                WHEN applications.status = 'accepted' THEN 'accepted'
                WHEN applications.status = 'rejected' THEN 'rejected'
                WHEN applications.status = 'confirmed' THEN 'confirmed'
                ELSE COALESCE(EXCLUDED.status, applications.status) 
            END,
            updated_at = NOW()
          RETURNING *;
        `;

        const values = [
          user_id,
          legal_name ?? null,
          email ?? null,
          university ?? null,
          major ?? null,
          graduation_year ?? null,
          experience ?? null,
          why_attend ?? null,
          project_experience ?? null,
          future_plans ?? null,
          fun_fact ?? null,
          self_description ?? null,
          links ?? null,
          teammates ?? null,
          referral_email ?? null,
          dietary_restrictions ?? null,
          agree_to_terms ?? false,
          status
        ];

        console.log(`[API POST] Executing upsert with status: ${status}`);
        const upsertResult = await query<any[]>(upsertQuery, values);
        console.log(`[API POST] Application saved successfully for user ${userId}, id: ${upsertResult[0].id}`);
        
        return NextResponse.json({ application: toCamelCase(upsertResult[0]) });
      }

      case 'submit-application': {
        // Submission should save the latest data and set status to submitted
        const applicationData = toSnakeCase(body); // Get full body data
        console.log(`[API POST] Submitting application for user ${userId}`);

        // Ensure user_id is set in the data
        applicationData.user_id = userId;

        // Extract fields matching the database schema
        const { 
          user_id,
          legal_name,
          email,
          university,
          major,
          graduation_year,
          experience,
          why_attend,
          project_experience,
          future_plans,
          fun_fact,
          self_description,
          links,
          teammates,
          referral_email,
          dietary_restrictions,
          agree_to_terms,
        } = applicationData;

        // --- Validation --- 
        // Ensure terms are agreed
        if (agree_to_terms !== true) {
          console.error(`[API POST] Submission rejected: Terms not agreed for user ${userId}`);
          return NextResponse.json({ error: 'You must agree to the terms to submit.' }, { status: 400 });
        }
        
        // Add required field validation (same as save-application)
        if (!legal_name || !email || !university || !major || !graduation_year || !experience || !why_attend || !project_experience || !future_plans || !fun_fact || !self_description) {
          console.error(`[API POST] Submission rejected: Missing required fields for user ${userId}`);
          return NextResponse.json({ error: 'Missing required application fields for submission' }, { status: 400 });
        }

        // --- Database Operation (Upsert and set status to submitted) --- 
        console.log(`[API POST] Preparing to submit application for user ${userId}`);
        const upsertSubmitQuery = `
          INSERT INTO applications (
            user_id, legal_name, email, university, major, graduation_year, experience, 
            why_attend, project_experience, future_plans, fun_fact, self_description, 
            links, teammates, referral_email, dietary_restrictions, agree_to_terms, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (user_id) DO UPDATE SET
            legal_name = EXCLUDED.legal_name,
            email = EXCLUDED.email, 
            university = EXCLUDED.university,
            major = EXCLUDED.major,
            graduation_year = EXCLUDED.graduation_year,
            experience = EXCLUDED.experience,
            why_attend = EXCLUDED.why_attend,
            project_experience = EXCLUDED.project_experience,
            future_plans = EXCLUDED.future_plans,
            fun_fact = EXCLUDED.fun_fact,
            self_description = EXCLUDED.self_description,
            links = EXCLUDED.links,
            teammates = EXCLUDED.teammates,
            referral_email = EXCLUDED.referral_email,
            dietary_restrictions = EXCLUDED.dietary_restrictions,
            agree_to_terms = EXCLUDED.agree_to_terms,
            status = $18, -- Set status to submitted
            updated_at = NOW()
          RETURNING *;
        `;

        const submitValues = [
          user_id,
          legal_name,
          email,
          university,
          major,
          graduation_year,
          experience,
          why_attend,
          project_experience,
          future_plans,
          fun_fact,
          self_description,
          links ?? null,
          teammates ?? null,
          referral_email ?? null,
          dietary_restrictions ?? null,
          true, // agree_to_terms must be true here
          'submitted' // Explicitly set status to submitted
        ];

        console.log(`[API POST] Executing submission upsert for user ${userId}`);
        const submitResult = await query<any[]>(upsertSubmitQuery, submitValues);
        
        if (submitResult.length === 0) {
          console.error(`[API POST] Submission failed for user ${userId}`);
          return NextResponse.json({ error: 'Failed to submit application.' }, { status: 500 });
        }
        
        console.log(`[API POST] Application submitted successfully for user ${userId}, id: ${submitResult[0].id}`);
        return NextResponse.json({ success: true, application: toCamelCase(submitResult[0]) });
      }

      default:
        console.error(`[API POST] Invalid action requested: ${action}`);
        return NextResponse.json(
          { error: `Invalid POST action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error(`[API POST Error] (${action}):`, error);
    // Handle specific DB errors like unique constraint violation
    if (error.code === '23505') { // Unique violation error code for PostgreSQL
      console.error(`[API POST] Database unique constraint violation for action ${action}:`, error.detail);
      return NextResponse.json(
        { error: 'Database error: Unique constraint violated. Check email.', details: error.detail }, 
        { status: 409 } // Conflict status code
      );
    }
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
} 