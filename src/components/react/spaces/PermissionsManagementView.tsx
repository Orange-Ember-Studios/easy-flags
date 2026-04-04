import { useState } from "react";
import SpaceNavigationWithTabs from "@/components/react/shared/SpaceNavigationWithTabs";
import PermissionsView from "./PermissionsView";
import FeaturesPermissionsView from "./FeaturesPermissionsView";
import type { AvailableLanguages } from "@/infrastructure/i18n/locales";

interface PermissionsManagementViewProps {
  spaceId: string | undefined;
  spaceName?: string;
  canManageFeaturePermissions: boolean;
  initialLocale?: AvailableLanguages;
}

export default function PermissionsManagementView({
  spaceId,
  spaceName,
  canManageFeaturePermissions,
  initialLocale,
}: PermissionsManagementViewProps) {
  const [activeTab, setActiveTab] = useState<"space" | "features">("space");

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto pt-12 pb-24 px-6 animate-in fade-in duration-700">
        <SpaceNavigationWithTabs
          spaceId={spaceId}
          spaceName={spaceName}
          currentTab="permissions"
          permissionSubTab={activeTab}
          onPermissionSubTabChange={setActiveTab}
          canManageFeaturePermissions={canManageFeaturePermissions}
          initialLocale={initialLocale}
        />

        <div className="relative z-10">
          {/* Content based on active tab */}
          {activeTab === "space" && (
            <PermissionsView
              spaceId={spaceId}
              canManageFeaturePermissions={canManageFeaturePermissions}
              initialLocale={initialLocale}
            />
          )}
          {activeTab === "features" && canManageFeaturePermissions && (
            <FeaturesPermissionsView spaceId={spaceId} initialLocale={initialLocale} />
          )}
        </div>
      </div>
    </div>
  );
}

