import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createServiceClient();
    
    // Test 1: Check connection by querying sources
    const { data: sources, error: sourcesError, status } = await supabase
      .from('sources')
      .select('count', { count: 'exact' })
      .limit(1);

    if (sourcesError) {
      return Response.json(
        {
          status: 'error',
          message: 'Database connection failed',
          error: sourcesError.message,
          details: sourcesError,
        },
        { status: 500 }
      );
    }

    // Test 2: Count sources
    const { data: sourceList, error: countError } = await supabase
      .from('sources')
      .select('id, name, domain', { count: 'exact' });

    if (countError) {
      return Response.json(
        { status: 'error', message: 'Failed to count sources', error: countError.message },
        { status: 500 }
      );
    }

    const sourceCount = sourceList?.length || 0;

    // Test 3: Count articles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id', { count: 'exact' });

    if (articlesError) {
      return Response.json(
        { status: 'error', message: 'Failed to count articles', error: articlesError.message },
        { status: 500 }
      );
    }

    const articleCount = articles?.length || 0;

    // Test 4: Count clusters
    const { data: clusters, error: clusterError } = await supabase
      .from('story_clusters')
      .select('id', { count: 'exact' });

    if (clusterError) {
      return Response.json(
        { status: 'error', message: 'Failed to count clusters', error: clusterError.message },
        { status: 500 }
      );
    }

    const clusterCount = clusters?.length || 0;

    return Response.json(
      {
        status: 'success',
        message: 'Supabase connection verified!',
        database: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          sources_count: sourceCount,
          articles_count: articleCount,
          clusters_count: clusterCount,
          sources_sample: sourceList?.slice(0, 3) || [],
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return Response.json(
      {
        status: 'error',
        message: 'Supabase connection failed',
        error: msg,
      },
      { status: 500 }
    );
  }
}
