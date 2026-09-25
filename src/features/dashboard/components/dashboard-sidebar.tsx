"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  OrganizationSwitcher,
  useClerk,
  useUser
} from "@clerk/nextjs";
import {
  type LucideIcon,
  Home,
  LayoutGrid,
  AudioLines,
  Volume2,
  Settings,
  Headphones,
  CreditCard,
  Music,
  Mic2,
  Sparkles,
  Clapperboard,
  Scissors,
  Activity,
  LogOut,
  Bot,
  Radio,
  ShieldCheck,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import Link from "next/link";
import { UsageContainer } from "@/features/billing/components/usage-container";

interface MenuItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  badge?: string;
  onClick?: () => void;
};

interface NavSectionProps {
  label?: string;
  items: MenuItem[];
  pathname: string;
};

function NavSection({ label, items, pathname }: NavSectionProps) {
  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-[13px] uppercase text-muted-foreground">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild={!!item.url}
                isActive={
                  item.url
                    ? item.url === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.url)
                    : false
                }
                onClick={item.onClick}
                tooltip={item.title}
                className="h-9 px-3 py-2 text-[13px] tracking-tight font-medium border border-transparent data-[active=true]:border-border data-[active=true]:shadow-[0px_1px_1px_0px_rgba(44,54,53,0.03),inset_0px_0px_0px_2px_white]"
              >
                {item.url ? (
                  <Link href={item.url} className="flex items-center w-full">
                    <item.icon />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto text-[9px] font-medium tracking-normal px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60 group-data-[collapsible=icon]:hidden">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <>
                    <item.icon />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto text-[9px] font-medium tracking-normal px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60 group-data-[collapsible=icon]:hidden">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const clerk = useClerk();

  const mainMenuItems: MenuItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Explore voices",
      url: "/voices",
      icon: LayoutGrid,
    },
    {
      title: "Text to speech",
      url: "/text-to-speech",
      icon: AudioLines,
    },
    {
      title: "Speech to text",
      url: "/transcribe",
      icon: Headphones,
    },
    {
      title: "Voice cloning",
      url: "/voice-clone",
      icon: Volume2,
    },
    {
      title: "Music studio",
      url: "/music",
      icon: Music,
    },
    {
      title: "Voice changer",
      url: "/voice-changer",
      icon: Mic2,
    },
    {
      title: "Visuals & Video",
      url: "/media",
      icon: Clapperboard,
    },
    {
      title: "Viral Clipper",
      url: "/clipper",
      icon: Scissors,
    },
    {
      title: "Voice Agent",
      url: "/agent",
      icon: Bot,
    },
  ];


  const { user } = useUser();
  const trpc = useTRPC();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const { data: adminData } = useQuery(
    trpc.admin.getIsAdmin.queryOptions(
      { email: userEmail, username: user?.username ?? undefined },
      { enabled: !!user }
    )
  );
  const isAdmin = adminData?.isAdmin ?? false;

  const othersMenuItems: MenuItem[] = [
    {
      title: "Usage & Analytics",
      url: "/usage",
      icon: Activity,
    },
    {
      title: "Billing & Credits",
      url: "/billing",
      icon: CreditCard,
    },
    ...(isAdmin
      ? [
          {
            title: "Observability",
            url: "/observability",
            icon: ShieldCheck,
            badge: "Admin",
          },
        ]
      : []),
    {
      title: "Settings",
      icon: Settings,
      onClick: () => clerk.openOrganizationProfile(),
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-col gap-4 pt-4">
        <div 
        className="flex items-center gap-2 pl-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
          <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500/10 via-indigo-500/10 to-transparent p-1 border border-cyan-200/50 shadow-xs">
            <Image
              src="/logo.svg"
              alt="Cadence"
              width={28}
              height={28}
              className="size-7 object-contain"
            />
          </div>
          <span className="group-data-[collapsible=icon]:hidden font-bold text-xl tracking-tight text-foreground">
            Cadence
          </span>
          <SidebarTrigger className="ml-auto lg:hidden" />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <OrganizationSwitcher
              hidePersonal
              fallback={
                <Skeleton
                  className="h-8.5 w-full group-data-[collapsible=icon]:size-8 rounded-md border bg-white"
                />
              }
              appearance={{
                elements: {
                  rootBox: 
                    "w-full! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:flex! group-data-[collapsible=icon]:justify-center!",
                  organizationSwitcherTrigger:
                    "w-full! justify-between! bg-white! border! border-border! rounded-md! pl-1! pr-2! py-1! gap-3! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:p-1! shadow-[0px_1px_1.5px_0px_rgba(44,54,53,0.03)]!",
                  organizationPreview: "gap-2!",
                  organizationPreviewAvatarBox: "size-6! rounded-sm!",
                  organizationPreviewTextContainer: 
                    "text-xs! tracking-tight! font-medium! text-foreground! group-data-[collapsible=icon]:hidden!",
                  organizationPreviewMainIdentifier: "text-[13px]!",
                  organizationSwitcherTriggerIcon:
                    "size-4! text-sidebar-foreground! group-data-[collapsible=icon]:hidden!",
                },
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <div className="border-b border-dashed border-border" />
      <SidebarContent>
        <NavSection items={mainMenuItems} pathname={pathname} />
        <NavSection
          label="Others"
          items={othersMenuItems}
          pathname={pathname}
        />
      </SidebarContent>
      <div className="border-b border-dashed border-border" />
      <SidebarFooter className="p-3 gap-2">
        <UsageContainer />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => clerk.signOut({ redirectUrl: "/" })}
              tooltip="Log out"
              className="h-9 px-3 py-2 text-[13px] tracking-tight font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full justify-start"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}