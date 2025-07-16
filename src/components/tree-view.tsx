import { TreeItem } from '@/types'
import React, { useState } from 'react'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarProvider, SidebarRail } from "./ui/sidebar"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react"
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

type TreeProps = {
  item: TreeItem;
  selectedValue: string | null;
  onSelect: (path: string) => void;
  parentPath?: string;
}

const Tree = ({ item, selectedValue, onSelect, parentPath = "" }: TreeProps) => {
  const [name, ...items] = Array.isArray(item) ? item : [item];
  const currentPath = parentPath ? `${parentPath}/${name}` : name;
  const [isOpen, setIsOpen] = useState(true);

  if (!items.length) {
    // It's a file
    const isSelected = selectedValue === currentPath;
    return (
      <SidebarMenuButton
        isActive={isSelected}
        className={cn("gap-2 data-[active=true]:bg-transparent")}
        onClick={() => onSelect?.(currentPath)}
      >
        <FileIcon className="h-4 w-4" />
        <span className="truncate">{name}</span>
      </SidebarMenuButton>
    );
  }

  // It's a directory
  return (
    <SidebarMenuItem>
      <Collapsible defaultOpen={true} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <SidebarMenuSubButton>
            <ChevronRightIcon
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "rotate-90"
              )}
            />
            <FolderIcon className="h-4 w-4" />
            <span className="truncate">{name}</span>
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((item, index) => (
              <Tree
                key={index}
                item={item}
                selectedValue={selectedValue}
                onSelect={onSelect}
                parentPath={currentPath}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};

export const TreeView = ({
  data,
  value,
  onSelect
}: {
  data: TreeItem[];
  value: string | null;
  onSelect: (path: string) => void;
}) => {
  return (
    <SidebarProvider>
      <Sidebar collapsible="none" className="w-full">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.map((item, index) => (
                  <Tree
                    key={index}
                    item={item}
                    selectedValue={value}
                    onSelect={onSelect}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
};