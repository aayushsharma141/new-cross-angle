import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/primitives/resizable";
import { AssetSidebar } from "./AssetSidebar";
import { AssetInspector } from "./AssetInspector";
import { cn } from "@/lib/utils";

export function AssetWorkspaceLayout() {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedAssetId = searchParams.get("asset");

    // Collection filter state — tracked alongside URL but not URL-driven (sidebar-local)
    const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

    const handleSelectAsset = (id: string | null) => {
        if (id) {
            setSearchParams({ asset: id }, { replace: true });
        } else {
            setSearchParams({}, { replace: true });
        }
    };

    const handleCollectionFilter = (collectionId: string | null) => {
        setActiveCollectionId(collectionId);
        // Clear selected asset when switching collection context
        setSearchParams({}, { replace: true });
    };

    return (
        <div className="h-full w-full flex flex-col bg-background text-foreground">
            {/* Split pane layout */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup
                    direction="horizontal"
                    className="h-full w-full rounded-none"
                >
                    {/* Sidebar / Asset List */}
                    <ResizablePanel
                        defaultSize={20}
                        minSize={15}
                        maxSize={40}
                        className={cn(
                            "bg-muted/10 border-r transition-all",
                            selectedAssetId ? "hidden md:block" : "block"
                        )}
                    >
                        <AssetSidebar
                            selectedAssetId={selectedAssetId}
                            onSelect={handleSelectAsset}
                            activeCollectionId={activeCollectionId}
                            onCollectionFilter={handleCollectionFilter}
                        />
                    </ResizablePanel>

                    <ResizableHandle withHandle className="hidden md:flex" />

                    <ResizablePanel 
                        defaultSize={80} 
                        className={cn(
                            "bg-background relative transition-all",
                            selectedAssetId ? "block" : "hidden md:block"
                        )}
                    >
                        <AssetInspector
                            selectedAssetId={selectedAssetId}
                            activeCollectionId={activeCollectionId}
                            onCollectionFilter={handleCollectionFilter}
                        />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
