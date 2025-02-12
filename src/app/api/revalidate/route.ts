import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const tag = searchParams.get('tag')

    if (path) {
      revalidatePath(path)
    }

    if (tag) {
      revalidateTag(tag)
    }

    if (!path && !tag) {
      return NextResponse.json(
        { message: 'Missing path or tag parameter' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        revalidated: true, 
        now: Date.now(),
        path: path || null,
        tag: tag || null
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Revalidation error:', err)
    return NextResponse.json(
      { message: 'Error revalidating', error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 