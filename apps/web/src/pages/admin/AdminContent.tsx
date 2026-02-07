import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Loader2,
  Plus,
  ChevronDown,
  Image,
  Trash2,
  GripVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

interface SiteContentSection {
  id: string;
  section: string;
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    image_url?: string;
    cta_text?: string;
    cta_link?: string;
    [key: string]: any;
  };
  updated_at: string;
}

const DEFAULT_SECTIONS = [
  {
    section: "hero",
    content: {
      title: "Welcome to Cross Angle Interior",
      subtitle: "Transform Your Space",
      description: "Premium interior design services for residential and commercial spaces.",
      cta_text: "Get Started",
      cta_link: "/contact-us"
    }
  },
  {
    section: "about",
    content: {
      title: "About Us",
      subtitle: "Your Trusted Design Partner",
      description: "With years of experience in interior design, we transform spaces into beautiful, functional environments."
    }
  },
  {
    section: "services",
    content: {
      title: "Our Services",
      subtitle: "What We Offer",
      description: "From residential to commercial projects, we provide comprehensive interior design solutions."
    }
  },
  {
    section: "portfolio",
    content: {
      title: "Our Work",
      subtitle: "Featured Projects",
      description: "Explore our latest interior design projects and transformations."
    }
  },
  {
    section: "contact",
    content: {
      title: "Get In Touch",
      subtitle: "Contact Us",
      description: "Ready to transform your space? Let's discuss your project."
    }
  },
  {
    section: "footer",
    content: {
      title: "Cross Angle Interior",
      description: "Premium Interior Design Studio",
      address: "Your Address Here",
      phone: "+91 XXXX XXXXXX",
      email: "contact@crossangleinterior.com"
    }
  }
];

const AdminContent = () => {
  const [sections, setSections] = useState<SiteContentSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [newSectionDialogOpen, setNewSectionDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<SiteContentSection | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [activeImageField, setActiveImageField] = useState<{ sectionId: string; field: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('section');

    if (error) {
      console.error('Error fetching content:', error);
    }

    if (data) {
      setSections(data as SiteContentSection[]);
    }
    setIsLoading(false);
  };

  const seedDefaultSections = async () => {
    setIsSeeding(true);
    try {
      for (const section of DEFAULT_SECTIONS) {
        const { error } = await supabase
          .from('site_content')
          .upsert({
            section: section.section,
            content: section.content,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'section'
          });

        if (error) throw error;
      }

      toast({
        title: "Default sections created!",
        description: "You can now edit the content for each section.",
      });

      fetchContent();
    } catch (error: any) {
      toast({
        title: "Error creating sections",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleContentChange = (sectionId: string, field: string, value: string) => {
    setSections(prev =>
      prev.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            content: { ...section.content, [field]: value }
          };
        }
        return section;
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const section of sections) {
        const { error } = await supabase
          .from('site_content')
          .update({
            content: section.content,
            updated_at: new Date().toISOString()
          })
          .eq('id', section.id);

        if (error) throw error;
      }

      toast({
        title: "Content saved!",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('site_content')
        .insert({
          section: newSectionName.toLowerCase().replace(/\s+/g, '_'),
          content: { title: newSectionName, description: '' }
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Section created!" });
      setNewSectionDialogOpen(false);
      setNewSectionName("");
      fetchContent();
    } catch (error: any) {
      toast({
        title: "Error creating section",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSection = async () => {
    if (!sectionToDelete) return;

    const { error } = await supabase
      .from('site_content')
      .delete()
      .eq('id', sectionToDelete.id);

    if (error) {
      toast({
        title: "Error deleting section",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Section deleted" });
      setSections(prev => prev.filter(s => s.id !== sectionToDelete.id));
    }
  };

  const openMediaPicker = (sectionId: string, field: string) => {
    setActiveImageField({ sectionId, field });
    setMediaPickerOpen(true);
  };

  const handleImageSelect = (url: string) => {
    if (activeImageField) {
      handleContentChange(activeImageField.sectionId, activeImageField.field, url);
    }
    setMediaPickerOpen(false);
    setActiveImageField(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show seed prompt if no sections exist
  if (sections.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Site Content</h1>
            <p className="text-muted-foreground mt-1">Update your website content</p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Content Sections Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating default content sections for your website, or add custom sections one at a time.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="gold" onClick={seedDefaultSections} disabled={isSeeding}>
                {isSeeding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Default Sections
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setNewSectionDialogOpen(true)}>
                Add Custom Section
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Site Content</h1>
          <p className="text-muted-foreground mt-1">Update your website content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setNewSectionDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
          <Button variant="gold" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Sections Accordion */}
      <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="space-y-4">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AccordionItem value={section.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold uppercase">
                      {section.section.charAt(0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold capitalize">
                      {section.section.replace(/_/g, ' ')} Section
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(section.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  {/* Title Field */}
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={section.content.title || ''}
                      onChange={(e) => handleContentChange(section.id, 'title', e.target.value)}
                      placeholder="Section title"
                    />
                  </div>

                  {/* Subtitle Field */}
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input
                      value={section.content.subtitle || ''}
                      onChange={(e) => handleContentChange(section.id, 'subtitle', e.target.value)}
                      placeholder="Section subtitle"
                    />
                  </div>

                  {/* Description Field */}
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={section.content.description || ''}
                      onChange={(e) => handleContentChange(section.id, 'description', e.target.value)}
                      placeholder="Section description"
                      rows={4}
                    />
                  </div>

                  {/* Image URL Field */}
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={section.content.image_url || ''}
                        onChange={(e) => handleContentChange(section.id, 'image_url', e.target.value)}
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => openMediaPicker(section.id, 'image_url')}
                      >
                        <Image className="w-4 h-4" />
                      </Button>
                    </div>
                    {section.content.image_url && (
                      <img
                        src={section.content.image_url}
                        alt="Preview"
                        className="w-40 h-24 object-cover rounded-lg mt-2"
                      />
                    )}
                  </div>

                  {/* CTA Fields (for hero-like sections) */}
                  {(section.section === 'hero' || section.section === 'contact') && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>CTA Button Text</Label>
                        <Input
                          value={section.content.cta_text || ''}
                          onChange={(e) => handleContentChange(section.id, 'cta_text', e.target.value)}
                          placeholder="Get Started"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA Button Link</Label>
                        <Input
                          value={section.content.cta_link || ''}
                          onChange={(e) => handleContentChange(section.id, 'cta_link', e.target.value)}
                          placeholder="/contact-us"
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer-specific fields */}
                  {section.section === 'footer' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={section.content.phone || ''}
                          onChange={(e) => handleContentChange(section.id, 'phone', e.target.value)}
                          placeholder="+91 XXXX XXXXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={section.content.email || ''}
                          onChange={(e) => handleContentChange(section.id, 'email', e.target.value)}
                          placeholder="contact@example.com"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Address</Label>
                        <Textarea
                          value={section.content.address || ''}
                          onChange={(e) => handleContentChange(section.id, 'address', e.target.value)}
                          placeholder="Your business address"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  {/* Delete Section */}
                  <div className="pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setSectionToDelete(section);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Section
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>

      {/* Create Section Dialog */}
      <Dialog open={newSectionDialogOpen} onOpenChange={setNewSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Section Name</Label>
              <Input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="e.g., testimonials, team, faq"
              />
              <p className="text-xs text-muted-foreground">
                This will be used as the section identifier
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewSectionDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" onClick={handleCreateSection}>
                Create Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Section"
        description={`Are you sure you want to delete the "${sectionToDelete?.section}" section? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteSection}
      />

      {/* Media Picker */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={handleImageSelect}
      />
    </div>
  );
};

export default AdminContent;