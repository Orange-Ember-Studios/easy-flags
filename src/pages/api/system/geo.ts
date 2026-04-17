import type { APIRoute } from "astro";
import { Country, State, City } from "country-state-city";
import { successResponse, badRequestResponse, HTTP_STATUS } from "@/utils/api";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const type = url.searchParams.get("type");
  const countryCode = url.searchParams.get("countryCode");
  const stateCode = url.searchParams.get("stateCode");

  try {
    if (type === "countries") {
      const countries = Country.getAllCountries().map(c => ({
        code: c.isoCode,
        name: c.name,
        phoneCode: c.phonecode,
        flag: c.flag
      }));
      return new Response(JSON.stringify(successResponse(countries)), {
        status: HTTP_STATUS.OK,
      });
    }

    if (type === "states") {
      if (!countryCode) {
        return new Response(JSON.stringify(badRequestResponse("countryCode is required")), {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }
      const states = State.getStatesOfCountry(countryCode).map(s => ({
        code: s.isoCode,
        name: s.name
      }));
      return new Response(JSON.stringify(successResponse(states)), {
        status: HTTP_STATUS.OK,
      });
    }

    if (type === "cities") {
      if (!countryCode || !stateCode) {
        return new Response(JSON.stringify(badRequestResponse("countryCode and stateCode are required")), {
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }
      const cities = City.getCitiesOfState(countryCode, stateCode).map(c => ({
        name: c.name
      }));
      return new Response(JSON.stringify(successResponse(cities)), {
        status: HTTP_STATUS.OK,
      });
    }

    return new Response(JSON.stringify(badRequestResponse("Invalid type")), {
      status: HTTP_STATUS.BAD_REQUEST,
    });
  } catch (error: any) {
    return new Response(JSON.stringify(badRequestResponse(error.message)), {
      status: HTTP_STATUS.BAD_REQUEST,
    });
  }
};
