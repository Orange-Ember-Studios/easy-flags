/**
 * API Handler - Team Members
 */

import type { APIRoute } from "astro";
import { TeamMemberService } from "@application/services";
import { getRepositoryRegistry } from "@infrastructure/registry";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const teamMemberService = new TeamMemberService();
    const spaceId = parseInt(params.spaceId as string);
    const members = await teamMemberService.getTeamMembers(spaceId);
    return new Response(JSON.stringify(members), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 },
    );
  }
};

export const POST: APIRoute = async ({ request, params }) => {
  try {
    const teamMemberService = new TeamMemberService();
    const registry = getRepositoryRegistry();
    const body = await request.json();
    const spaceId = parseInt(params.spaceId as string);

    // Find user by email
    const userRepo = registry.getUserRepository();
    const user = await userRepo.findByEmail(body.email);
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const member = await teamMemberService.addTeamMember(
      spaceId,
      user.id,
      body.role_id || 3,
    );
    return new Response(JSON.stringify(member), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 },
    );
  }
};
