import express from "express";
import { EnvironmentService } from "../application/services/environmentService";
import { FeatureService } from "../application/services/featureService";
import { FlagQueryService } from "../application/services/flagQueryService";
import { asyncHandler } from "../utils/errorHandler";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants";
import { ok, fail } from "../utils/apiResponse";

export default function createFlagRouter(
  environmentService: EnvironmentService,
  featureService: FeatureService,
  flagQueryService: FlagQueryService,
) {
  const router = express.Router();

  router.get("/", asyncHandler(async (req, res) => {
    const env = req.query.env as string | undefined;
    if (!env) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(fail("ENV_QUERY_REQUIRED", "env query parameter required (name)"));
    }

    const flags = await flagQueryService.getFlagsByEnvironmentName(env);
    if (!flags) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(fail("ENVIRONMENT_NOT_FOUND", ERROR_MESSAGES.ENVIRONMENT_NOT_FOUND));
    }

    res.json(ok(flags));
  }));

  router.get("/:env/:key", asyncHandler(async (req, res) => {
    const envName = req.params.env as string | undefined;
    const key = req.params.key as string | undefined;

    if (!envName || !key) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(fail("ENV_AND_KEY_REQUIRED", "env and key path parameters required"));
    }

    const environment = await environmentService.findByName(envName);
    if (!environment) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(fail("ENVIRONMENT_NOT_FOUND", ERROR_MESSAGES.ENVIRONMENT_NOT_FOUND));
    }

    const feature = await featureService.findByKey(key);
    if (!feature) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(fail("FEATURE_NOT_FOUND", ERROR_MESSAGES.FEATURE_NOT_FOUND));
    }

    const result = await flagQueryService.isFeatureEnabled(envName, key);
    if (!result) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(fail("FEATURE_VALUE_NOT_FOUND", "feature value not found"));
    }

    res.json(ok(result));
  }));

  return router;
}
