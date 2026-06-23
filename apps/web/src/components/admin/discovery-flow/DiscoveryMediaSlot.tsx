import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ImageIcon, Link as LinkIcon, Replace } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDiscoveryAsset } from '@/hooks/useDiscoveryAsset';
import { UniversalAssetPicker } from '@/components/admin/media/UniversalAssetPicker';
import { AssetUsageService } from '@/services/AssetUsageService';

interface DiscoveryMediaSlotProps {
  label: string;
  entityType: string;
  entityId: string;
  role: string;
  description?: string;
}

export function DiscoveryMediaSlot({
  label,
  entityType,
  entityId,
  role,
  description,
}: DiscoveryMediaSlotProps) {
  const queryClient = useQueryClient();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { url, isLoading } = useDiscoveryAsset(entityType, entityId, role);

  const handleReplace = async (asset: any) => {
    await AssetUsageService.replaceUsage({
      assetId: asset.id,
      entityType,
      entityId,
      role,
    });
    // Invalidate the specific discovery asset query
    queryClient.invalidateQueries({
      queryKey: ['dam', 'discovery-asset', entityType, entityId, role],
    });
    setPickerOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-sm font-semibold text-[hsl(var(--admin-text))]">
            {label}
          </h4>
          {description && (
            <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="relative aspect-video bg-neutral-900 rounded overflow-hidden group">
        {isLoading ? (
          <div className="w-full h-full animate-pulse bg-neutral-800" />
        ) : url ? (
          <img
            src={url}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800 text-neutral-500">
            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs">No asset assigned</span>
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-xs font-medium rounded hover:bg-neutral-200 transition-colors"
          >
            <Replace className="w-3.5 h-3.5" />
            Replace
          </button>
          {url && (
            <Link
              to="/admin/media"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800/80 text-white text-xs font-medium rounded hover:bg-neutral-700 transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Library
            </Link>
          )}
        </div>
      </div>

      {pickerOpen && (
        <UniversalAssetPicker
          domain="discovery"
          entityType={entityType}
          role={role}
          defaultCollectionFilter="discovery"
          onSelect={handleReplace}
          onOpenChange={(isOpen) => setPickerOpen(isOpen)}
        />
      )}
    </div>
  );
}
