"use client";

import { History, Settings } from "lucide-react";

import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

import { SettingsPanelHistory } from "./settings-panel-history";
import { SettingsPanelSettings } from "./settings-panel-settings";

const tabTriggerClassName = 
  "flex-1 h-full gap-2 bg-transparent rounded-none border-x-0 border-t-0 border-b-2 border-b-transparent shadow-none data-[state=active]:border-b-primary data-[state=active]:text-foreground font-medium text-muted-foreground group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none transition-all cursor-pointer";

export function SettingsPanel() {
  const trpc = useTRPC();
  const { data: generations } = useQuery(trpc.generations.getAll.queryOptions());
  const count = generations?.length ?? 0;

  return (
    <div className="hidden w-105 min-h-0 flex-col border-l lg:flex bg-card/20">
      <Tabs
        defaultValue="settings"
        className="flex h-full min-h-0 flex-col gap-y-0"
      >
        <TabsList className="w-full bg-background border-b h-12 group-data-[orientation=horizontal]/tabs:h-12 p-0">
          <TabsTrigger value="settings" className={tabTriggerClassName}>
            <Settings className="size-4" />
            Voice Settings
          </TabsTrigger>
          <TabsTrigger value="history" className={tabTriggerClassName}>
            <History className="size-4" />
            History
            {count > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground font-semibold">
                {count}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="settings"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          <SettingsPanelSettings />
        </TabsContent>
        <TabsContent
          value="history"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          <SettingsPanelHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};