import type { APIRoute } from "astro";
import { clearAuthCookie, getUserFromContext } from "@/utils/auth";
import { revokeUserTokens } from "@/lib/auth-service";
import { successResponse, unauthorizedResponse } from "@/utils/api";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const user = getUserFromContext(context);
  if (!user) {
    return new Response(JSON.stringify(unauthorizedResponse()), {
      status: 401,
    });
  }

  // Revoke all tokens for the user
  await revokeUserTokens(user.id);

  // Clear the current session cookie
  clearAuthCookie(context);
  return new Response(
    JSON.stringify(
      successResponse({
        message: "Logged out successfully. All sessions revoked.",
      }),
    ),
    { status: 200 },
  );
};
