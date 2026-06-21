import { useSearchParams } from "react-router-dom";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/primitives/resizable";
import { AssetSidebar } from "./AssetSidebar";
import { AssetInspector } from "./AssetInspector";

export function AssetWorkspaceLayout() {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedAssetId = searchParams.get("asset");

    const handleSelectAsset = (id: string | null) => {
        if (id) {
            setSearchParams({ asset: id }, { replace: true });
        } else {
            setSearchParams({}, { replace: true });
        }
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
                        defaultSize={35}
                        minSize={25}
                        maxSize={50}
                        className="bg-muted/10 border-r"
                    >
                        <AssetSidebar 
                            selectedAssetId={selectedAssetId} 
                            onSelect={handleSelectAsset} 
                        />
                    </ResizablePanel>
                    
                    <ResizableHandle withHandle />
                    
                    <ResizablePanel defaultSize={65} className="bg-background relative">
                        <AssetInspector selectedAssetId={selectedAssetId} />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
