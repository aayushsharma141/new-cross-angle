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
        <div className="h-full w-full bg-background overflow-hidden flex flex-col font-inter">
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel 
                    defaultSize={20} 
                    minSize={15} 
                    maxSize={30}
                    className="border-r border-border bg-background"
                >
                    <AssetSidebar 
                        selectedAssetId={selectedAssetId} 
                        onSelect={handleSelectAsset} 
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={80} className="bg-muted relative">
                    <AssetInspector selectedAssetId={selectedAssetId} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
