import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function adminOnly(session: any) {
  const role = session?.user?.role;
  return !session || (role !== 'admin' && role !== 'ADMIN');
}

// DELETE /api/admin/users/[id]/sso/[accountId]
// Revokes a specific SSO provider connection for a user.
// The user can still log in via password or other linked providers.
export async function DELETE(
  _req: Request,
  { params: rawParams }: { params: Promise<{ id: string; accountId: string }> },
) {
  const params = await rawParams;
  const session = await getServerSession(authOptions);
  if (adminOnly(session)) return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });

  try {
    // Verify the account belongs to the specified user
    const account = await prisma.account.findFirst({
      where: { id: params.accountId, userId: params.id },
      select: { id: true, provider: true },
    });

    if (!account) {
      return NextResponse.json({ error: 'Không tìm thấy liên kết SSO' }, { status: 404 });
    }

    // Safety check: ensure the user has at least one other login method
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        password: true,
        _count: { select: { accounts: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    const otherAccounts = (user._count.accounts ?? 0) - 1;
    const hasPassword = !!user.password;

    if (otherAccounts === 0 && !hasPassword) {
      return NextResponse.json(
        { error: 'Không thể xóa liên kết duy nhất – người dùng sẽ mất quyền đăng nhập' },
        { status: 400 },
      );
    }

    await prisma.account.delete({ where: { id: params.accountId } });

    return NextResponse.json({ success: true, provider: account.provider });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
