import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Schema for sibling registration
const siblingRegistrationSchema = z.object({
    parent_email: z.string().trim().email().optional().or(z.literal('')),
    parent_phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits').optional().or(z.literal('')),
    student_name: z.string().trim().min(2, 'Student name is required'),
    student_dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date of birth'),
    gender: z.enum(['Male', 'Female', 'Other']),
    address: z.string().trim().min(5, 'Address is required'),
    grade: z.string().min(1, 'Grade is required'),
    course_id: z.string().uuid('Invalid course selection'),
    batch_id: z.string().uuid('Invalid batch selection'),
    parent_name: z.string().trim().min(2, 'Parent name is required'),
}).refine(data => data.parent_email || data.parent_phone, {
    message: "At least one of parent email or phone number is required",
    path: ["parent_email"]
})

export async function POST(request: Request) {
    const supabase = createClient()
    const adminClient = createAdminClient()

    try {
        const body = await request.json()
        const validated = siblingRegistrationSchema.parse(body)

        const {
            parent_email, parent_phone, student_name, student_dob,
            gender, address, grade, course_id, batch_id, parent_name
        } = validated

        // 1. Detect Existing Parent Contact
        let parentId: string | null = null

        const { data: existingParents, error: searchError } = await supabase
            .from('students')
            .select('parent_id, parent_email, parent_phone')
            .or(`parent_email.eq.${parent_email},parent_phone.eq.${parent_phone}`)
            .not('parent_id', 'is', null)
            .limit(1)

        if (searchError) {
            console.error('Parent detection error:', searchError)
            return NextResponse.json({ error: 'Database verification failed' }, { status: 500 })
        }

        const existingParent = existingParents?.[0]

        if (existingParent) {
            // Conflict Check: Prevent cross-linking different parents
            if (parent_email && existingParent.parent_email && parent_email !== existingParent.parent_email) {
                return NextResponse.json({ error: 'Parent contact information does not match existing records (Email conflict).' }, { status: 409 })
            }
            if (parent_phone && existingParent.parent_phone && parent_phone !== existingParent.parent_phone) {
                return NextResponse.json({ error: 'Parent contact information does not match existing records (Phone conflict).' }, { status: 409 })
            }
            parentId = existingParent.parent_id
        }

        // 2. Resolve/Create Parent Account
        if (!parentId) {
            // Create new Supabase Auth user
            const tempPassword = Math.random().toString(36).slice(-10)
            const email = parent_email || `${parent_phone}@temp.soa.academy`

            const { data: newUser, error: authError } = await adminClient.auth.admin.createUser({
                email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: {
                    full_name: parent_name,
                    role: 'parent'
                }
            })

            if (authError) {
                console.error('Auth creation failure:', authError)
                return NextResponse.json({ error: 'Unable to create parent account. ' + authError.message }, { status: 500 })
            }
            parentId = newUser.user.id
        }

        // 3. Prevent duplicate student under same parent
        const { data: duplicateStudent } = await supabase
            .from('students')
            .select('student_id')
            .eq('parent_id', parentId)
            .eq('student_full_name', student_name)
            .eq('date_of_birth', student_dob)
            .maybeSingle()

        if (duplicateStudent) {
            return NextResponse.json({ error: 'This student is already registered under this account.' }, { status: 409 })
        }

        // 4. Create New Student Record
        const { data: newStudent, error: insertError } = await supabase
            .from('students')
            .insert({
                parent_id: parentId,
                parent_email: parent_email || null,
                parent_phone: parent_phone || null,
                student_full_name: student_name,
                date_of_birth: student_dob,
                gender,
                address,
                parent_name,
                is_active: true,
                admission_date: new Date().toISOString()
            })
            .select('student_id')
            .single()

        if (insertError) {
            console.error('Database insert failure:', insertError)
            return NextResponse.json({ error: 'Student registration failed. Please try again.' }, { status: 500 })
        }

        // 5. Create Batch Enrollment
        const { error: enrollmentError } = await supabase
            .from('batch_enrollments')
            .insert({
                student_id: newStudent.student_id,
                batch_id,
                allocation_status: 'Active',
                enrolled_date: new Date().toISOString()
            })

        if (enrollmentError) {
            console.error('Enrollment failure:', enrollmentError)
            // We keep the student record but report the error
            return NextResponse.json({
                success: true,
                warning: 'Student registered but batch enrollment failed. Please contact admin.',
                student_id: newStudent.student_id
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            student_id: newStudent.student_id,
            parent_id: parentId
        })

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
        }
        console.error('Unexpected registration error:', error)
        return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 })
    }
}
