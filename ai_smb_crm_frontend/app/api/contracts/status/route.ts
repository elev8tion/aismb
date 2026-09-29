import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/cloudflare/env';
import { ncbOpenApiRead, type NCBEnv } from '@/lib/agent/ncbClient';
import { statusQuerySchema } from '@/lib/validation/contract.schemas';
import { formatZodErrors } from '@kre8tion/shared-types';
import { getCRMAuth, hasPartnershipAccess, unauthorizedStatus } from '@/lib/security/crmAuth';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const cfEnv = getEnv();
  const env = cfEnv as unknown as NCBEnv & Record<string, string>;

  try {
    const auth = await getCRMAuth(env, req);
    const authError = unauthorizedStatus(auth);
    if (authError) {
      return NextResponse.json(
        { error: authError === 401 ? 'Unauthorized' : 'Forbidden' },
        { status: authError },
      );
    }

    const queryResult = statusQuerySchema.safeParse({
      partnership_id: req.nextUrl.searchParams.get('partnership_id')
    });

    if (!queryResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: formatZodErrors(queryResult.error as any)
      }, { status: 400 });
    }

    const { partnership_id } = queryResult.data;

    if (!auth || !(await hasPartnershipAccess(env, auth, partnership_id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const documents = await ncbOpenApiRead(env, 'documents', { partnership_id });
    const signatures = await ncbOpenApiRead(env, 'document_signatures', { partnership_id });

    return NextResponse.json({ documents, signatures });
  } catch (err) {
    console.error('[contracts/status] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
