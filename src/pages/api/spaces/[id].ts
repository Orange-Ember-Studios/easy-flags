/**
 * API Handler - Spaces
 */

import type { APIRoute } from "astro";
import { SpaceService } from "@application/services";
import { getRepositoryRegistry } from "@infrastructure/registry";
import { getDatabase } from "@lib/db";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const spaceService = new SpaceService();

    if (params.id) {
      // Get single space
      const space = await spaceService.getSpace(parseInt(params.id as string));
      if (!space) {
        return new Response(JSON.stringify({ error: "Space not found" }), {
          status: 404,
        });
      }
      return new Response(JSON.stringify(space), { status: 200 });
    } else {
      // Get all spaces
      const spaces = await spaceService.getAllSpaces();
      return new Response(JSON.stringify(spaces), { status: 200 });
    }
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
    const spaceService = new SpaceService();
    const body = await request.json();

    // TODO: Get user ID from session
    const userId = 1;

    const space = await spaceService.createSpace(userId, {
      name: body.name,
      description: body.description,
    });

    return new Response(JSON.stringify(space), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 },
    );
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const spaceService = new SpaceService();
    const body = await request.json();
    const spaceId = parseInt(params.id as string);

    const space = await spaceService.updateSpace(spaceId, {
      name: body.name,
      description: body.description,
    });

    return new Response(JSON.stringify(space), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500 },
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const spaceService = new SpaceService();
    const spaceId = parseInt(params.id as string);

    await spaceService.deleteSpace(spaceId);

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
