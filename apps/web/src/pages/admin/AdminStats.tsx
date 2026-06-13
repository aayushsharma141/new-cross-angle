import React from 'react';
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Label } from "@/components/ui/primitives/label";
import { Loader2, Award, Users, Clock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function AdminStats() {
    const { settings, loading: isLoading } = useSiteSettings();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [stats, setStats] = useState({
        yearsExperience: 15,
        happyClients: 500,
        projectsCompleted: 750,
        awardsWon: 25,
    });

    useEffect(() => {
        if (settings?.studio_stats) {
            setStats(settings.studio_stats as typeof stats);
        }
    }, [settings]);

    const updateMutation = useMutation({
        mutationFn: async (newStats: typeof stats) => {
            const { error } = await supabase
                .from("site_settings")
                .update({ studio_stats: newStats })
                .eq("id", settings?.id || "");
            if (error) throw error;
            return newStats;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
            toast({
                title: "Stats Updated",
                description: "Studio statistics have been updated successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update stats.",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateMutation.mutate(stats);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="yearsExperience" className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-primary" />
                                Years Experience
                            </Label>
                            <Input
                                id="yearsExperience"
                                type="number"
                                value={stats.yearsExperience}
                                onChange={(e) => setStats(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || 0 }))}
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="happyClients" className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                Happy Clients
                            </Label>
                            <Input
                                id="happyClients"
                                type="number"
                                value={stats.happyClients}
                                onChange={(e) => setStats(prev => ({ ...prev, happyClients: parseInt(e.target.value) || 0 }))}
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="projectsCompleted" className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                Projects Completed
                            </Label>
                            <Input
                                id="projectsCompleted"
                                type="number"
                                value={stats.projectsCompleted}
                                onChange={(e) => setStats(prev => ({ ...prev, projectsCompleted: parseInt(e.target.value) || 0 }))}
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="awardsWon" className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Design Awards
                            </Label>
                            <Input
                                id="awardsWon"
                                type="number"
                                value={stats.awardsWon}
                                onChange={(e) => setStats(prev => ({ ...prev, awardsWon: parseInt(e.target.value) || 0 }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border">
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
