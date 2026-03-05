/**
 * EasyFlags - Feature Flags API Library
 *
 * A centralized library to consume the Feature Flags API endpoints.
 * Provides methods to manage features and flags with built-in error handling
 * and authentication support.
 *
 * @module EasyFlags
 */

/**
 * Feature Flags API Client Configuration
 * @typedef {Object} ApiConfig
 * @property {string} [baseUrl] - The base URL for API requests (defaults to "{origin}/api")
 * @property {string} [token] - Optional authentication token for Bearer auth
 * @property {Function} [fetchFn] - Custom fetch function (defaults to global fetch)
 */

/**
 * Feature object
 * @typedef {Object} Feature
 * @property {number} id - The feature ID
 * @property {string} key - The feature key (unique identifier)
 * @property {string} [description] - Feature description
 * @property {Date} [createdAt] - When the feature was created
 * @property {Date} [updatedAt] - When the feature was last updated
 */

/**
 * Feature Value object
 * @typedef {Object} FeatureValue
 * @property {number} id - The feature value ID
 * @property {number} featureId - The associated feature ID
 * @property {number} environmentId - The associated environment ID
 * @property {boolean} value - The boolean flag value
 * @property {Date} [createdAt] - When the value was created
 * @property {Date} [updatedAt] - When the value was last updated
 */

/**
 * Flag object with environment context
 * @typedef {Object} Flag
 * @property {number} id - The flag ID
 * @property {string} key - The feature key
 * @property {string} [description] - Feature description
 * @property {boolean} value - The flag value
 * @property {number} environmentId - The environment ID
 */

/**
 * Flags Response object
 * @typedef {Object} FlagsResponse
 * @property {Object} environment - The environment details
 * @property {Array<Flag>} flags - Array of flags for the environment
 */

/**
 * API Response Error object
 * @typedef {Object} ApiError
 * @property {string} code - Error code
 * @property {string} message - Error message
 */

class EasyFlags {
  /**
   * Creates an instance of the Feature Flags API client
   * @param {ApiConfig} [config={}] - Configuration object
   * @example
   * // Default: Uses current origin + /api
   * const api = new EasyFlags();
   *
   * @example
   * // With token for Bearer authentication
   * const api = new EasyFlags({
   *   token: 'your-jwt-token-here'
   * });
   *
   * @example
   * // Custom base URL and token
   * const api = new EasyFlags({
   *   baseUrl: 'https://api.example.com/v1',
   *   token: 'your-jwt-token-here'
   * });
   */
  constructor(config = {}) {
    // Determine base URL: use provided, or construct from origin
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    } else {
      // Get origin from window.location if available
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      this.baseUrl = origin ? `${origin}/api` : "/api";
    }

    // Store optional token for Bearer authentication
    this.token = config.token || null;

    // Use provided fetch or default to global fetch
    this.fetchFn = config.fetchFn || fetch.bind(window);
  }

  /**
   * Make an authenticated API request
   * Handles JSON serialization, authentication headers, and response parsing
   *
   * @private
   * @param {string} endpoint - The API endpoint (without base URL)
   * @param {object} [options={}] - Fetch options
   * @param {string} [options.method="GET"] - HTTP method
   * @param {object} [options.body] - Request body (will be JSON stringified)
   * @param {object} [options.headers] - Additional headers
   * @returns {Promise<object>} The parsed response data
   * @throws {Error} Throws error if request fails or returns error response
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || "GET";

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add Bearer token if configured
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const fetchOptions = {
      method,
      headers,
      credentials: "include", // Include cookies in request
      ...options,
    };

    // Stringify body if it's an object
    if (options.body && typeof options.body === "object") {
      fetchOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await this.fetchFn(url, fetchOptions);
      const data = await response.json();

      // Handle API response wrapper
      if (data && data.success) {
        return data.data !== undefined ? data.data : data;
      } else if (data && data.error) {
        const error = new Error(data.error);
        error.code = data.code;
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * List all features
   * @returns {Promise<Array<Feature>>} Array of all features
   * @throws {Error} If the request fails
   * @example
   * try {
   *   const features = await api.listFeatures();
   *   console.log(features);
   * } catch (error) {
   *   console.error('Failed to load features:', error);
   * }
   */
  async listFeatures() {
    return this.request("/features");
  }

  /**
   * Create a new feature
   * @param {string} key - The feature key (unique identifier)
   * @param {string} [description] - Feature description
   * @returns {Promise<Feature>} The created feature object
   * @throws {Error} If the request fails or validation fails
   * @example
   * try {
   *   const feature = await api.createFeature('new-feature', 'My new feature');
   *   console.log('Feature created:', feature);
   * } catch (error) {
   *   console.error('Failed to create feature:', error);
   * }
   */
  async createFeature(key, description) {
    return this.request("/features", {
      method: "POST",
      body: {
        key,
        description,
      },
    });
  }

  /**
   * Delete a feature (also deletes all its associated values)
   * @param {number} id - The feature ID
   * @returns {Promise<object>} Empty object on success
   * @throws {Error} If the request fails or feature not found
   * @example
   * try {
   *   await api.deleteFeature(123);
   *   console.log('Feature deleted');
   * } catch (error) {
   *   console.error('Failed to delete feature:', error);
   * }
   */
  async deleteFeature(id) {
    return this.request(`/features/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Set a feature value for a specific environment
   * Creates a new value if it doesn't exist, updates if it does
   * @param {number} featureId - The feature ID
   * @param {number} environmentId - The environment ID
   * @param {boolean} value - The boolean flag value
   * @returns {Promise<FeatureValue>} The feature value object
   * @throws {Error} If the request fails
   * @example
   * try {
   *   const value = await api.setFeatureValue(123, 456, true);
   *   console.log('Feature value set:', value);
   * } catch (error) {
   *   console.error('Failed to set feature value:', error);
   * }
   */
  async setFeatureValue(featureId, environmentId, value) {
    return this.request(`/features/${featureId}/value`, {
      method: "PUT",
      body: {
        environmentId,
        value,
      },
    });
  }

  /**
   * Get all flags for a specific environment
   * @param {string} environmentName - The environment name
   * @returns {Promise<FlagsResponse>} Object containing environment and flags array
   * @throws {Error} If the request fails or environment not found
   * @example
   * try {
   *   const { environment, flags } = await api.getFlags('production');
   *   console.log(`Environment: ${environment.name}`);
   *   flags.forEach(flag => {
   *     console.log(`${flag.key}: ${flag.value}`);
   *   });
   * } catch (error) {
   *   console.error('Failed to get flags:', error);
   * }
   */
  async getFlags(environmentName) {
    return this.request(`/flags?env=${encodeURIComponent(environmentName)}`);
  }

  /**
   * Get a specific flag value by environment and feature key
   * @param {string} environmentName - The environment name
   * @param {string} featureKey - The feature key
   * @returns {Promise<boolean>} The flag value (true or false)
   * @throws {Error} If the request fails or flag not found
   * @example
   * try {
   *   const isEnabled = await api.getFlag('production', 'new-feature');
   *   if (isEnabled) {
   *     console.log('Feature is enabled');
   *   }
   * } catch (error) {
   *   console.error('Failed to get flag:', error);
   * }
   */
  async getFlag(environmentName, featureKey) {
    return this.request(
      `/flags/${encodeURIComponent(environmentName)}/${encodeURIComponent(featureKey)}`,
    );
  }
}

// Export for use in different module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = EasyFlags;
}
