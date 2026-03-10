/**
 * API Handler - Single Team Member
 */

import type { APIRoute } from "astro";
import { TeamMemberService } from "@application/services";
import { getRepositoryRegistry } from "@infrastructure/registry";

export const prerender = false;

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const teamMemberService = new TeamMemberService();
    const body = await request.json();
    const memberId = parseInt(params.memberId as string);
    const member = await teamMemberService.updateTeamMemberRole(
      memberId,
      body.role_id,
    );
    return new Response(JSON.stringify(member), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 },
    );
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const teamMemberService = new TeamMemberService();
    const registry = getRepositoryRegistry();
    const spaceId = parseInt(params.spaceId as string);
    const memberId = parseInt(params.memberId as string);

    // Get the space member to find the user ID
    const spaceMemberRepo = registry.getSpaceMemberRepository();
    const member = await spaceMemberRepo.findById(memberId);

    if (!member) {
      return new Response(JSON.stringify({ error: "Team member not found" }), {
        status: 404,
      });
    }

    await teamMemberService.removeTeamMember(spaceId, member.user_id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 },
    );
  }
};
