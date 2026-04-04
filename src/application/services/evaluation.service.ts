import { getRepositoryRegistry } from "@infrastructure/registry";
import type { Feature, FeatureFlag, TargetingRule, AdvancedConfiguration } from "@domain/entities";

export interface EvaluationContext {
  spaceId: number;
  environmentId: number;
  apiKey: string;
  userId?: string;
  customContext?: Record<string, any>;
}

export interface EvaluationResult {
  value: boolean | string | Record<string, any>;
  evaluationTimeMs: number;
  featureId?: number;
  error?: string;
}

export class FlagEvaluationService {
  private registry = getRepositoryRegistry();

  async evaluateFlag(
    featureKey: string,
    context: EvaluationContext,
  ): Promise<EvaluationResult> {
    const startTime = performance.now();
    try {
      const featureRepo = this.registry.getFeatureRepository();
      const flagRepo = this.registry.getFeatureFlagRepository();
      const advancedConfigRepo = this.registry.getAdvancedConfigRepository();

      const feature = await featureRepo.findByKey(context.spaceId, featureKey);
      if (!feature) throw new Error("Feature not found");

      const flag = await flagRepo.findByFeatureAndEnvironment(feature.id, context.environmentId);
      if (!flag) throw new Error("Feature flag not found");

      const advancedConfig = await advancedConfigRepo.findByFeatureFlagId(flag.id);
      const targetingRules = await this.registry.getTargetingRuleRepository().findByFeatureFlagId(flag.id);

      let value: boolean | string | Record<string, any> = false;
      let isEnabled = flag.is_enabled;

      // Check Targeting Rules
      if (isEnabled && targetingRules && targetingRules.length > 0) {
        let ruleMatched = false;
        for (const rule of targetingRules) {
          if (this.evaluateRule(rule, context)) {
            ruleMatched = true;
            break;
          }
        }
        if (!ruleMatched) {
          isEnabled = false;
        }
      }

      // Check Scheduling
      if (isEnabled && advancedConfig && advancedConfig.scheduling_enabled) {
        const now = new Date();
        
        if (advancedConfig.schedule_start_date) {
          const startDateTime = new Date(`${advancedConfig.schedule_start_date}T${advancedConfig.schedule_start_time || "00:00:00"}`);
          if (now < startDateTime) {
            isEnabled = false;
          }
        }
        
        if (isEnabled && advancedConfig.schedule_end_date) {
          const endDateTime = new Date(`${advancedConfig.schedule_end_date}T${advancedConfig.schedule_end_time || "23:59:59"}`);
          if (now > endDateTime) {
            isEnabled = false;
          }
        }
      }

      // Determine flag value based on configuration
      if (!isEnabled) {
        value = false;
      } else {
        // Rollout check
        let rolloutPercentage = flag.rollout_percentage;
        
        // Use advanced rollout if available
        if (advancedConfig && advancedConfig.rollout_percentage !== undefined) {
          rolloutPercentage = advancedConfig.rollout_percentage;
        }

        if (rolloutPercentage !== undefined && rolloutPercentage < 100) {
          if (context.userId) {
            const hash =
              parseInt(
                context.userId
                  .split("")
                  .reduce((acc, char) => acc + char.charCodeAt(0), 0)
                  .toString(16),
                16,
              ) % 100;
            value = hash < rolloutPercentage;
          } else {
            value = Math.random() * 100 < rolloutPercentage;
          }
        } else {
          value = true;
        }

        // If flag has a specific value override, use it
        const flagValue = (advancedConfig && advancedConfig.default_value) || flag.value;
        if (flagValue !== undefined && flagValue !== null) {
          try {
            value = JSON.parse(flagValue);
          } catch {
            value = flagValue;
          }
        }
      }

      return {
        value,
        featureId: feature.id,
        evaluationTimeMs: performance.now() - startTime,
      };
    } catch (error) {
      return {
        value: false,
        evaluationTimeMs: performance.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private evaluateRule(rule: TargetingRule, context: EvaluationContext): boolean {
    const { rule_type, rule_value, operator } = rule;
    let contextValue: string | undefined;

    switch (rule_type) {
      case "email_domain":
        contextValue = context.customContext?.email;
        if (contextValue && contextValue.includes("@")) {
          contextValue = contextValue.split("@")[1];
        }
        break;
      case "user_id":
        contextValue = context.userId;
        break;
      case "user_segment":
        contextValue = context.customContext?.segment;
        break;
      case "percentage":
        // Nested rollout within rule?
        const hash =
          parseInt(
            (context.userId || "anonymous")
              .split("")
              .reduce((acc, char) => acc + char.charCodeAt(0), 0)
              .toString(16),
            16,
          ) % 100;
        return hash < parseInt(rule_value);
      default:
        return false;
    }

    if (!contextValue) return false;

    switch (operator) {
      case "equals":
        return contextValue === rule_value;
      case "contains":
        return contextValue.includes(rule_value);
      case "greater_than":
        return parseFloat(contextValue) > parseFloat(rule_value);
      default:
        return false;
    }
  }
}
