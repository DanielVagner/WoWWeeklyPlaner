import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentWeekStart } from '@/lib/reset'

interface Params { params: Promise<{ charId: string }> }

// SQLite ukládá tasksDone jako JSON string – helper pro parse/stringify
const parseTasks  = (raw: string): string[] => { try { return JSON.parse(raw) } catch { return [] } }
const stringifyTasks = (arr: string[]): string => JSON.stringify(arr)

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { charId } = await params
  const weekStart  = getCurrentWeekStart()

  const character = await db.character.findFirst({
    where: { id: charId, userId: session.user.id },
  })
  if (!character) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const state = await db.weeklyState.findUnique({
    where: { characterId_weekStart: { characterId: charId, weekStart } },
  })

  if (!state) {
    return NextResponse.json({
      characterId: charId, weekStart, mpRunsDone: 0,
      mpHighestKey: 0, raidBossesDone: 0, delvesDone: 0, tasksDone: '[]',
    })
  }

  return NextResponse.json(state)
}

export async function PUT(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { charId } = await params
  const body       = await req.json() as { mpRunsDone?: number; delvesDone?: number; tasksDone?: string[] }

  const character = await db.character.findFirst({
    where: { id: charId, userId: session.user.id },
  })
  if (!character) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const weekStart = getCurrentWeekStart()

  const updated = await db.weeklyState.upsert({
    where:  { characterId_weekStart: { characterId: charId, weekStart } },
    create: {
      characterId:    charId,
      weekStart,
      mpRunsDone:     body.mpRunsDone  ?? 0,
      mpHighestKey:   0,
      raidBossesDone: 0,
      delvesDone:     body.delvesDone  ?? 0,
      tasksDone:      stringifyTasks(body.tasksDone ?? []),
    },
    update: {
      ...(body.mpRunsDone  !== undefined && { mpRunsDone:  body.mpRunsDone }),
      ...(body.delvesDone  !== undefined && { delvesDone:  body.delvesDone }),
      ...(body.tasksDone   !== undefined && { tasksDone:   stringifyTasks(body.tasksDone) }),
    },
  })

  return NextResponse.json(updated)
}
