import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlagEvaluationService } from "./evaluation.service";
import { getRepositoryRegistry } from "@infrastructure/registry";
import type { Feature, FeatureFlag, AdvancedConfiguration } from "@domain/entities";

vi.mock("@infrastructure/registry", () => ({
  getRepositoryRegistry: vi.fn(),
}));

describe("FlagEvaluationService", () => {
  let service: FlagEvaluationService;
  let mockFeatureRepo: any;
  let mockFlagRepo: any;
  let mockAdvancedConfigRepo: any;
  let mockTargetingRuleRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockFeatureRepo = { findByKey: vi.fn() };
    mockFlagRepo = { findByFeatureAndEnvironment: vi.fn() };
    mockAdvancedConfigRepo = { findByFeatureFlagId: vi.fn() };
    mockTargetingRuleRepo = { findByFeatureFlagId: vi.fn() };

    (getRepositoryRegistry as any).mockReturnValue({
      getFeatureRepository: () => mockFeatureRepo,
      getFeatureFlagRepository: () => mockFlagRepo,
      getAdvancedConfigRepository: () => mockAdvancedConfigRepo,
      getTargetingRuleRepository: () => mockTargetingRuleRepo,
    });

    service = new FlagEvaluationService();
  });

  describe("Basic Toggle (is_enabled)", () => {
    it("should return false if flag is disabled", async () => {
      const feature: Feature = { id: 1, key: "test-feature", name: "Test", type: "boolean", default_value: "false", space_id: 1, created_at: "", updated_at: "" };
      const flag: FeatureFlag = { id: 1, feature_id: 1, environment_id: 1, is_enabled: false, rollout_percentage: 100, created_at: "", updated_at: "" };

      mockFeatureRepo.findByKey.mockResolvedValue(feature);
      mockFlagRepo.findByFeatureAndEnvironment.mockResolvedValue(flag);
      mockAdvancedConfigRepo.findByFeatureFlagId.mockResolvedValue(null);

      const result = await service.evaluateFlag("test-feature", { spaceId: 1, environmentId: 1, apiKey: "test-key" });

      expect(result.value).toBe(false);
    });

    it("should return true if flag is enabled and rollout is 100%", async () => {
      const feature: Feature = { id: 1, key: "test-feature", name: "Test", type: "boolean", default_value: "false", space_id: 1, created_at: "", updated_at: "" };
      const flag: FeatureFlag = { id: 1, feature_id: 1, environment_id: 1, is_enabled: true, rollout_percentage: 100, created_at: "", updated_at: "" };

      mockFeatureRepo.findByKey.mockResolvedValue(feature);
      mockFlagRepo.findByFeatureAndEnvironment.mockResolvedValue(flag);
      mockAdvancedConfigRepo.findByFeatureFlagId.mockResolvedValue(null);

      const result = await service.evaluateFlag("test-feature", { spaceId: 1, environmentId: 1, apiKey: "test-key" });

      expect(result.value).toBe(true);
    });
  });

  describe("Rollout Percentage", () => {
    it("should be deterministic for a given user_id", async () => {
      const feature: Feature = { id: 1, key: "rollout-feature", name: "Rollout", type: "boolean", default_value: "false", space_id: 1, created_at: "", updated_at: "" };
      // 50% rollout
      const flag: FeatureFlag = { id: 1, feature_id: 1, environment_id: 1, is_enabled: true, rollout_percentage: 50, created_at: "", updated_at: "" };

      mockFeatureRepo.findByKey.mockResolvedValue(feature);
      mockFlagRepo.findByFeatureAndEnvironment.mockResolvedValue(flag);
      mockAdvancedConfigRepo.findByFeatureFlagId.mockResolvedValue(null);

      // We need to find a user_id that hashes to < 50 and one that hashes to >= 50
      // "user-1" -> hash calculation: 'u'(117) + 's'(115) + 'e'(101) + 'r'(114) + '-'(45) + '1'(49) = 541. 541 % 100 = 41. ( < 50)
      // "user-2" -> hash calculation: 'u'(117) + 's'(115) + 'e'(101) + 'r'(114) + '-'(45) + '2'(50) = 542. 542 % 100 = 42. ( < 50)
      // Wait, let's find one that is > 50. 
      // "user-A" -> 117+115+101+114+45+65 = 557. 557 % 100 = 57. ( > 50)

      const result1 = await service.evaluateFlag("rollout-feature", { spaceId: 1, environmentId: 1, apiKey: "test-key", userId: "user-1" });
      const result2 = await service.evaluateFlag("rollout-feature", { spaceId: 1, environmentId: 1, apiKey: "test-key", userId: "user-1" });
      const resultA = await service.evaluateFlag("rollout-feature", { spaceId: 1, environmentId: 1, apiKey: "test-key", userId: "user-A" });

      expect(result1.value).toBe(true);
      expect(result2.value).toBe(true);
      expect(resultA.value).toBe(false);
    });
  });

  describe("Scheduling", () => {
    it("should be disabled if current time is before start time", async () => {
      const feature: Feature = { id: 1, key: "scheduled-feature", name: "Scheduled", type: "boolean", default_value: "false", space_id: 1, created_at: "", updated_at: "" };
      const flag: FeatureFlag = { id: 1, feature_id: 1, environment_id: 1, is_enabled: true, rollout_percentage: 100, created_at: "", updated_at: "" };
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const startDate = futureDate.toISOString().split("T")[0];
      
      const advancedConfig: AdvancedConfiguration = {
        id: 1,
        feature_flag_id: 1,
        rollout_percentage: 100,
        scheduling_enabled: true,
        schedule_start_date: startDate,
        schedule_start_time: "00:00:00",
        created_at: "",
        updated_at: "",
        default_value: "true",
      };

      mockFeatureRepo.findByKey.mockResolvedValue(feature);
      mockFlagRepo.findByFeatureAndEnvironment.mockResolvedValue(flag);
      mockAdvancedConfigRepo.findByFeatureFlagId.mockResolvedValue(advancedConfig);

      const result = await service.evaluateFlag("scheduled-feature", { spaceId: 1, environmentId: 1, apiKey: "test-key" });

      expect(result.value).toBe(false);
    });

    it("should be enabled if current time is within schedule", async () => {
      const feature: Feature = { id: 1, key: "scheduled-feature", name: "Scheduled", type: "boolean", default_value: "false", space_id: 1, created_at: "", updated_at: "" };
      const flag: FeatureFlag = { id: 1, feature_id: 1, environment_id: 1, is_enabled: true, rollout_percentage: 100, created_at: "", updated_at: "" };
      
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const startDate = pastDate.toISOString().split("T")[0];
      
      const advancedConfig: AdvancedConfiguration = {
        id: 1,
        feature_flag_id: 1,
        rollout_percentage: 100,
        scheduling_enabled: true,
        schedule_start_date: startDate,
        schedule_start_time: "00:00:00",
        created_at: "",
        updated_at: "",
        default_value: "true",
      };

      mockFeatureRepo.findByKey.mockResolvedValue(feature);
      mockFlagRepo.findByFeatureAndEnvironment.mockResolvedValue(flag);
      mockAdvancedConfigRepo.findByFeatureFlagId.mockResolvedValue(advancedConfig);

      const result = await service.evaluateFlag("scheduled-feature", { spaceId: 1, environmentId: 1, apiKey: "test-key" });

      expect(result.value).toBe(true);
    });
  });

  describe("Targeting Rules", () => {
    it("should return true if email domain matches rule", async () => {
      const feature: Feature = { id: 1, key: "targeting-feature", name: "Targeting", type: "boolean", default_value: "false", space_id: 1, created_at: "", updated_at: "" };
      const flag: FeatureFlag = { id: 1, feature_id: 1, environment_id: 1, is_enabled: true, rollout_percentage: 100, created_at: "", updated_at: "" };
      
      const targetingRule = {
        id: 1,
        feature_flag_id: 1,
        rule_type: "email_domain",
        rule_value: "example.com",
        operator: "equals",
        created_at: "",
      };

      mockFeatureRepo.findByKey.mockResolvedValue(feature);
      mockFlagRepo.findByFeatureAndEnvironment.mockResolvedValue(flag);
      mockAdvancedConfigRepo.findByFeatureFlagId.mockResolvedValue({ 
        id: 1, 
        feature_flag_id: 1, 
        rollout_percentage: 100, 
        scheduling_enabled: false,
        created_at: "",
        updated_at: "",
        default_value: "true",
      });
      mockTargetingRuleRepo.findByFeatureFlagId.mockResolvedValue([targetingRule]);

      const result = await service.evaluateFlag("targeting-feature", { 
        spaceId: 1, 
        environmentId: 1, 
        apiKey: "test-key",
        userId: "user-1",
        customContext: { email: "test@example.com" }
      });

      expect(result.value).toBe(true);
    });

    it("should return false if email domain does not match rule", async () => {
      const feature: Feature = { id: 1, key: "targeting-feature", name: "Targeting", type: "boolean", default_value: "false", space_id: 1, created_at: "", updated_at: "" };
      const flag: FeatureFlag = { id: 1, feature_id: 1, environment_id: 1, is_enabled: true, rollout_percentage: 100, created_at: "", updated_at: "" };
      
      const targetingRule = {
        id: 1,
        feature_flag_id: 1,
        rule_type: "email_domain",
        rule_value: "other.com",
        operator: "equals",
        created_at: "",
      };

      mockFeatureRepo.findByKey.mockResolvedValue(feature);
      mockFlagRepo.findByFeatureAndEnvironment.mockResolvedValue(flag);
      mockAdvancedConfigRepo.findByFeatureFlagId.mockResolvedValue({ 
        id: 1, 
        feature_flag_id: 1, 
        rollout_percentage: 100, 
        scheduling_enabled: false,
        created_at: "",
        updated_at: "",
        default_value: "true",
      });
      mockTargetingRuleRepo.findByFeatureFlagId.mockResolvedValue([targetingRule]);

      const result = await service.evaluateFlag("targeting-feature", { 
        spaceId: 1, 
        environmentId: 1, 
        apiKey: "test-key",
        userId: "user-1",
        customContext: { email: "test@example.com" }
      });

      expect(result.value).toBe(false);
    });

    it("should match user_id with contains operator", async () => {
      const targetingRule = {
        id: 1,
        feature_flag_id: 1,
        rule_type: "user_id",
        rule_value: "vip",
        operator: "contains",
        created_at: "",
      };

      mockFeatureRepo.findByKey.mockResolvedValue({ id: 1, key: "targeting-feature", space_id: 1 });
      mockFlagRepo.findByFeatureAndEnvironment.mockResolvedValue({ id: 1, is_enabled: true, rollout_percentage: 100 });
      mockAdvancedConfigRepo.findByFeatureFlagId.mockResolvedValue(null);
      mockTargetingRuleRepo.findByFeatureFlagId.mockResolvedValue([targetingRule]);

      const result = await service.evaluateFlag("targeting-feature", { 
        spaceId: 1, 
        environmentId: 1, 
        apiKey: "test-key",
        userId: "user-vip-123"
      });

      expect(result.value).toBe(true);
    });

    it("should match user_segment with equals operator", async () => {
      const targetingRule = {
        id: 1,
        feature_flag_id: 1,
        rule_type: "user_segment",
        rule_value: "beta-testers",
        operator: "equals",
        created_at: "",
      };

      mockFeatureRepo.findByKey.mockResolvedValue({ id: 1, key: "targeting-feature", space_id: 1 });
      mockFlagRepo.findByFeatureAndEnvironment.mockResolvedValue({ id: 1, is_enabled: true, rollout_percentage: 100 });
      mockAdvancedConfigRepo.findByFeatureFlagId.mockResolvedValue(null);
      mockTargetingRuleRepo.findByFeatureFlagId.mockResolvedValue([targetingRule]);

      const result = await service.evaluateFlag("targeting-feature", { 
        spaceId: 1, 
        environmentId: 1, 
        apiKey: "test-key",
        userId: "user-1",
        customContext: { segment: "beta-testers" }
      });

      expect(result.value).toBe(true);
    });
  });
});
