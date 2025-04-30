import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from "@clerk/nextjs/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get application data for the current user
    const result = await query(
      'SELECT * FROM applications WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      // No application found, return empty data
      return NextResponse.json({ 
        success: true,
        application: null
      })
    }

    return NextResponse.json({ 
      success: true, 
      application: result.rows[0] 
    })
  } catch (error: any) {
    console.error('Error fetching application:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 