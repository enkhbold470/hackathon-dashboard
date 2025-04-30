import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from "@clerk/nextjs/server"
import { query } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.json()
    
    // Check if an application already exists for this user
    const existingApplication = await query(
      'SELECT id FROM applications WHERE user_id = $1',
      [userId]
    )

    // Map form fields to match database columns
    const data = {
      user_id: userId,
      cwid: formData.cwid || '',
      full_name: formData.full_name || '',
      discord: formData.discord || '',
      skill_level: formData.skill_level || '',
      hackathon_experience: formData.hackathon_experience || '',
      dietary_restrictions: formData.dietary_restrictions || '',
      hear_about_us: formData.hear_about_us || '',
      why_attend: formData.why_attend || '',
      project_experience: formData.project_experience || '',
      future_plans: formData.future_plans || '',
      fun_fact: formData.fun_fact || '',
      self_description: formData.self_description || '',
      links: formData.links || '',
      teammates: formData.teammates || '',
      referral_email: formData.referral_email || '',
      dietary_restrictions_extra: formData.dietary_restrictions_extra || '',
      agree_to_terms: formData.agree_to_terms || false,
      status: formData.status || 'in_progress'
    }

    let result

    if (existingApplication.rows.length > 0) {
      // Update existing application
      result = await query(
        `UPDATE applications
        SET
          cwid = $1,
          full_name = $2,
          discord = $3,
          skill_level = $4,
          hackathon_experience = $5,
          dietary_restrictions = $6,
          hear_about_us = $7,
          why_attend = $8,
          project_experience = $9,
          future_plans = $10,
          fun_fact = $11,
          self_description = $12,
          links = $13,
          teammates = $14,
          referral_email = $15,
          dietary_restrictions_extra = $16,
          agree_to_terms = $17,
          status = $18,
          updated_at = NOW()
        WHERE user_id = $19
        RETURNING *`,
        [
          data.cwid,
          data.full_name,
          data.discord,
          data.skill_level,
          data.hackathon_experience,
          data.dietary_restrictions,
          data.hear_about_us,
          data.why_attend,
          data.project_experience,
          data.future_plans,
          data.fun_fact,
          data.self_description,
          data.links,
          data.teammates,
          data.referral_email,
          data.dietary_restrictions_extra,
          data.agree_to_terms,
          data.status,
          data.user_id
        ]
      )
    } else {
      // Create new application
      result = await query(
        `INSERT INTO applications (
          user_id,
          cwid,
          full_name,
          discord,
          skill_level,
          hackathon_experience,
          dietary_restrictions,
          hear_about_us,
          why_attend,
          project_experience,
          future_plans,
          fun_fact,
          self_description,
          links,
          teammates,
          referral_email,
          dietary_restrictions_extra,
          agree_to_terms,
          status
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
        RETURNING *`,
        [
          data.user_id,
          data.cwid,
          data.full_name,
          data.discord,
          data.skill_level,
          data.hackathon_experience,
          data.dietary_restrictions,
          data.hear_about_us,
          data.why_attend,
          data.project_experience,
          data.future_plans,
          data.fun_fact,
          data.self_description,
          data.links,
          data.teammates,
          data.referral_email,
          data.dietary_restrictions_extra,
          data.agree_to_terms,
          data.status
        ]
      )
    }

    return NextResponse.json({ 
      success: true, 
      application: result.rows[0] 
    })
  } catch (error: any) {
    console.error('Error saving application:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 