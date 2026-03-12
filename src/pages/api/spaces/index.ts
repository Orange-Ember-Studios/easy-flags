import type { APIRoute } from "astro";
import { getUserFromContext } from "@/utils/auth";
import {
  successResponse,
  unauthorizedResponse,
  badRequestResponse,
} from "@/utils/api";
import { SpaceService, TeamMemberService } from "@application/services";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const user = getUserFromContext(context);

  if (!user) {
    return new Response(JSON.stringify(unauthorizedResponse()), {
      status: 401,
    });
  }

  try {
    const spaceService = new SpaceService();
    const spaces = await spaceService.getUserSpaces(user.id);
    return new Response(JSON.stringify(successResponse(spaces)), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching spaces:", error);
    return new Response(
      JSON.stringify(badRequestResponse("Failed to fetch spaces")),
      { status: 400 },
    );
  }
};

export const POST: APIRoute = async (context) => {
  const user = getUserFromContext(context);

  if (!user) {
    return new Response(JSON.stringify(unauthorizedResponse()), {
      status: 401,
    });
  }

  try {
    const body = await context.request.json();
    const { name, description } = body;

    if (!name) {
      return new Response(
        JSON.stringify(badRequestResponse("Space name is required")),
        { status: 400 },
      );
    }

    const spaceService = new SpaceService();
    const newSpace = await spaceService.createSpace(user.id, {
      name,
      description: description || "",
    });

    // Automatically add the space owner as an admin team member
    try {
      const teamMemberService = new TeamMemberService();
      await teamMemberService.addTeamMember(newSpace.id, user.id, 2); // 2 = admin role
    } catch (err) {
      console.error("Warning: Failed to add space owner as team member:", err);
      // Don't fail the response, space was created successfully
    }

    return new Response(JSON.stringify(successResponse(newSpace)), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating space:", error);
    return new Response(
      JSON.stringify(badRequestResponse("Failed to create space")),
      { status: 400 },
    );
  }
};
