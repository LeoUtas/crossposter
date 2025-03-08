import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client'

export async function POST(request: NextRequest) {
  // Verify user is authenticated
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get form data
  const formData = await request.formData();
  const organizationValue = formData.get('organization');
  
  // Convert to string or null, ensuring we don't pass File objects
  const organization = organizationValue instanceof File ? null : 
                      (organizationValue || null);

  try {
    // Set linkedin_company in users table
    if (!session.user?.email) {
      throw new Error("User email not found in session");
    }

    const prisma = new PrismaClient();

    const result = await prisma.users.update({
      where: { email: session.user.email },
      data: { linkedin_company: organization }
    });

    console.log("Result", result);

    return NextResponse.json(result);
  } catch (error: unknown) {
    // Log the full error stack if it's an Error object
    if (error instanceof Error) {
      console.error("Error saving organization:", error.stack);
    } else {
      console.error("Unknown error saving organization:", error);
    }

    return NextResponse.json(
      { error: "Failed to save organization" },
      { status: 500 }
    );
  }
}
