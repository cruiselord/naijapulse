import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createServiceClient();
    
    // Test basic connection - just try to get auth user (will be null but proves connection)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Test if we can list schemas (doesn't require tables to exist)
    const { data, error } = await supabase
      .from('information_schema_tables')
      .select('*')
      .limit(1);

    // If both fail with schema error, it means we're not connected
    // If they fail with table_not_found, it means we're connected but need migrations
    
    if (error) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('jwt') || errorMsg.includes('unauthorized')) {
        return Response.json(
          {
            status: 'auth_error',
            message: 'Supabase credentials are invalid',
            error: error.message,
          },
          { status: 401 }
        );
      } else if (errorMsg.includes('not found')) {
        return Response.json(
          {
            status: 'success_but_tables_missing',
            message: 'Connected to Supabase but database tables not found!',
            advice: 'Run: supabase db push',
            details: {
              url: process.env.NEXT_PUBLIC_SUPABASE_URL,
              error: error.message,
            },
          },
          { status: 200 }
        );
      }
    }

    return Response.json(
      {
        status: 'success',
        message: 'Supabase connected successfully!',
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        user: user ? `Authenticated: ${user.email}` : 'Not authenticated (normal for service role)',
        next_step: 'Apply migrations: supabase db push',
      },
      { status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    
    return Response.json(
      {
        status: 'error',
        message: 'Fatal error connecting to Supabase',
        error: msg,
        troubleshot: [
          '1. Check NEXT_PUBLIC_SUPABASE_URL is correct',
          '2. Check NEXT_PUBLIC_SUPABASE_ANON_KEY is correct',
          '3. Check SUPABASE_SERVICE_ROLE_KEY is valid',
        ],
      },
      { status: 500 }
    );
  }
}
