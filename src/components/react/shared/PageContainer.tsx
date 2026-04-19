import SpaceNavigation from "@/components/react/shared/SpaceNavigation";
import type { AvailableLanguages } from "@/infrastructure/i18n/locales";

interface PageContainerProps {
  children: React.ReactNode;
  spaceId: string | undefined;
  spaceName?: string;
  currentTab?: "overview" | "environments" | "features" | "permissions";
  subPage?: {
    name: string;
    path?: string;
  };
  initialLocale?: AvailableLanguages;
}

export default function PageContainer({
  children,
  spaceId,
  spaceName,
  currentTab,
  subPage,
  initialLocale,
}: PageContainerProps) {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto pt-12 pb-24 px-6 animate-in fade-in duration-700">
        {spaceId && (
          <SpaceNavigation
            spaceId={spaceId}
            spaceName={spaceName}
            currentTab={currentTab}
            subPage={subPage}
            initialLocale={initialLocale}
          />
        )}
        {children}
      </div>
    </div>
  );
}
