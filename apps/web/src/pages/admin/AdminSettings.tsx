import { GeneralSettingsForm } from "@/components/admin/settings/GeneralSettingsForm";
import { Button } from "@/components/ui/primitives/button";
import { Save } from "lucide-react";

const AdminSettings = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif text-white tracking-tight">Settings</h1>
          <p className="text-sm text-zinc-500 font-sans max-w-sm">
            Manage global site configuration, integrations, and system preferences.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="bg-site-crimson hover:bg-[#A30E28] text-white font-semibold shadow-lg"
          onClick={() => {
            const form = document.querySelector<HTMLFormElement>("#general-settings-form");
            if (form) form.requestSubmit();
          }}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <GeneralSettingsForm />
    </div>
  );
};

export default AdminSettings;
