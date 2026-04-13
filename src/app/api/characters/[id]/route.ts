import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params { params: Promise<{ id: string }> }

// PATCH /api/characters/[id] – toggle isTracked
export async function PATCH(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const character = await db.character.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, isTracked: true },
  })
  if (!character) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await db.character.update({
    where: { id },
    data:  { isTracked: !character.isTracked },
  })

  return NextResponse.json({ isTracked: updated.isTracked })
}
