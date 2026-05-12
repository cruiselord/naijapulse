import { createServiceClient } from '@/lib/supabase/server';

const SOURCES_DATA = [
  {
    domain: 'punchng.com',
    ownership: 'Punch Newspapers Limited',
    description: 'Leading Nigerian newspaper with comprehensive coverage of politics, business, and culture.',
    logo_url: 'https://punchng.com/wp-content/uploads/2021/04/punch-logo.png',
  },
  {
    domain: 'premiumtimesng.com',
    ownership: 'Premium Times Limited',
    description: 'Independent investigative journalism platform known for in-depth reporting on Nigerian politics.',
    logo_url: 'https://media.premiumtimesng.com/img/logo-dark.svg',
  },
  {
    domain: 'guardian.ng',
    ownership: 'Guardian Newspapers Limited',
    description: 'Historic Nigerian newspaper with strong coverage of national and international news.',
    logo_url: 'https://guardian.ng/wp-content/uploads/2021/09/guardian-ng-logo.svg',
  },
  {
    domain: 'vanguardngr.com',
    ownership: 'Vanguard Media Limited',
    description: 'Major Nigerian daily newspaper with focus on politics, business, and social issues.',
    logo_url: 'https://www.vanguardngr.com/wp-content/uploads/2021/12/vanguard-logo.png',
  },
  {
    domain: 'thisdaylive.com',
    ownership: 'ThisDay Newspapers Limited',
    description: 'Premium Nigerian newspaper with focus on business, politics, and entertainment news.',
    logo_url: 'https://www.thisdaylive.com/images/logo.png',
  },
  {
    domain: 'dailytrust.com',
    ownership: 'Daily Trust Media Company',
    description: 'Northern Nigeria-focused newspaper with national reach covering politics and society.',
    logo_url: 'https://dailytrust.com/wp-content/uploads/2021/01/daily-trust-logo.png',
  },
  {
    domain: 'businessday.ng',
    ownership: 'Businessday Media Limited',
    description: 'Leading business and financial news platform covering Nigerian and continental markets.',
    logo_url: 'https://businessday.ng/wp-content/uploads/2021/01/bday-logo.svg',
  },
  {
    domain: 'saharareporters.com',
    ownership: 'Sahara Reporters',
    description: 'Online news platform known for investigative reporting on politics and corruption.',
    logo_url: 'https://saharareporters.com/images/logo.png',
  },
  {
    domain: 'channelstv.com',
    ownership: 'Channels Television Limited',
    description: 'Major Nigerian broadcast and online news outlet with extensive national coverage.',
    logo_url: 'https://www.channelstv.com/images/logo.svg',
  },
  {
    domain: 'nan.ng',
    ownership: 'News Agency of Nigeria (NAN)',
    description: 'Nigerian News Agency - official state news agency providing news to media outlets.',
    logo_url: 'https://nan.ng/images/logo.png',
  },
  {
    domain: 'thecable.ng',
    ownership: 'The Cable',
    description: 'Online-first news platform focusing on politics, business, and social commentary.',
    logo_url: 'https://www.thecable.ng/images/logo.svg',
  },
  {
    domain: 'nairaland.com',
    ownership: 'Nairaland',
    description: 'Popular Nigerian online forum and community platform for discussion and news sharing.',
    logo_url: 'https://nairaland.com/images/logo.png',
  },
  {
    domain: 'nairametrics.com',
    ownership: 'Nairametrics Limited',
    description: 'Online platform focused on business, economics, and market news in Nigeria.',
    logo_url: 'https://nairametrics.com/images/logo.svg',
  },
  {
    domain: 'techcabal.com',
    ownership: 'TechCabal',
    description: 'Leading technology and startup news platform covering African tech ecosystem.',
    logo_url: 'https://techcabal.com/images/logo.svg',
  },
  {
    domain: 'stears.co',
    ownership: 'Stears',
    description: 'Data-driven news and insights platform focusing on Nigerian and African stories.',
    logo_url: 'https://stears.co/images/logo.png',
  },
  {
    domain: 'bbc.com',
    ownership: 'British Broadcasting Corporation',
    description: 'Global news organization with extensive coverage of African and Nigerian stories.',
    logo_url: 'https://static.bbc.co.uk/nol/shared/bbc_logo_120x96.png',
  },
  {
    domain: 'reuters.com',
    ownership: 'Reuters (Thomson Reuters)',
    description: 'International news agency providing global news coverage including African news.',
    logo_url: 'https://www.reuters.com/rsrcs/r/images/reuters-logo-small.png',
  },
  {
    domain: 'aljazeera.com',
    ownership: 'Al Jazeera Network',
    description: 'Global news network with strong coverage of African political and social issues.',
    logo_url: 'https://www.aljazeera.com/media/ajcms/2017/12/logo.png',
  },
  {
    domain: 'cnn.com',
    ownership: 'Cable News Network (Warner Bros. Discovery)',
    description: 'Major global news network with dedicated Africa coverage and reporting.',
    logo_url: 'https://www.cnn.com/media/sites/cnn/img/cnn-logo.svg',
  },
  {
    domain: 'theguardian.com',
    ownership: 'The Guardian Media Group',
    description: 'Leading UK newspaper with senior journalists covering African affairs and politics.',
    logo_url: 'https://www.theguardian.com/images/logo.svg',
  },
];

export async function POST(request: Request) {
  try {
    const supabase = await createServiceClient();

    // Update each source with ownership, description, and logo_url
    let updated = 0;
    const errors: string[] = [];

    for (const source of SOURCES_DATA) {
      const { error } = await supabase
        .from('sources')
        .update({
          ownership: source.ownership,
          description: source.description,
          logo_url: source.logo_url,
        })
        .eq('domain', source.domain);

      if (error) {
        errors.push(`${source.domain}: ${error.message}`);
        console.error(`Failed to update ${source.domain}:`, error);
      } else {
        updated++;
        console.log(`✓ Updated ${source.domain}`);
      }
    }

    // Verify the updates by fetching a sample
    const { data: sample, error: sampleError } = await supabase
      .from('sources')
      .select('domain, ownership, description, logo_url')
      .limit(3);

    return Response.json(
      {
        status: 'success',
        message: `Updated ${updated} sources with ownership, description, and logo URLs`,
        updated_count: updated,
        errors: errors.length > 0 ? errors : [],
        sample_data: sample,
      },
      { status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Seed error:', msg);
    return Response.json(
      {
        status: 'error',
        message: 'Failed to seed source details',
        error: msg,
      },
      { status: 500 }
    );
  }
}
