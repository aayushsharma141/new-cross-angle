import * as React from "react"
import { Container } from "@/components/ui/foundation/Container"
import { Section } from "@/components/ui/foundation/Section"
import { Heading } from "@/components/ui/foundation/Heading"
import { Text } from "@/components/ui/foundation/Text"
import { Button } from "@/components/ui/interactive/Button"
import { Input } from "@/components/ui/interactive/Input"
import { Mail, MapPin, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { ContactContent } from "@/types/content/patterns"

export interface ContactPatternProps extends ContactContent {
  subtitle?: string
  onSubmitForm?: (data: { name: string; email: string; message: string }) => void
  className?: string
}

export function ContactPattern({
  headline,
  subtitle,
  email: contactEmail,
  phone,
  address,
  onSubmitForm,
  className,
}: ContactPatternProps) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [message, setMessage] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmitForm?.({ name, email, message })
  }

  return (
    <Section spacing="loose" className={cn("py-24 bg-canvas-primary border-b border-subtle", className)}>
      <Container size="standard">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Studio Info */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <Text size="micro" className="text-copper font-mono uppercase tracking-widest font-bold mb-2">
                DIRECT CONTACT
              </Text>
              <Heading size="display-md" className="mb-4">{headline}</Heading>
              {subtitle && <Text size="body-lg" variant="secondary" className="leading-relaxed">{subtitle}</Text>}
            </div>

            <div className="space-y-6 pt-4 font-mono text-sm">
              <div className="flex items-start gap-4">
                <MapPin className="text-copper mt-1" size={20} />
                <div>
                  <Text size="caption" className="font-semibold">Studio Location</Text>
                  <Text size="caption" variant="secondary">{address}</Text>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="text-copper mt-1" size={20} />
                <div>
                  <Text size="caption" className="font-semibold">Email Inquiry</Text>
                  <Text size="caption" variant="secondary">{contactEmail}</Text>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="text-copper mt-1" size={20} />
                <div>
                  <Text size="caption" className="font-semibold">Direct Telephone</Text>
                  <Text size="caption" variant="secondary">{phone}</Text>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 p-8 bg-surface-card border border-subtle rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Full Name"
                placeholder="Aayush Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="aayush@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="space-y-2">
                <label
                  htmlFor="contact-project-description"
                  className="text-xs font-mono font-medium text-content-secondary uppercase tracking-wider block"
                >
                  Project Description & Requirements
                </label>
                <textarea
                  id="contact-project-description"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your residential, commercial, or acoustic studio design requirements..."
                  className="w-full p-4 bg-canvas-primary border border-subtle rounded-xl text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-copper"
                  required
                />
              </div>

              <Button type="submit" intent="primary" size="lg" className="w-full">
                Submit Architectural Inquiry
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </Section>
  )
}
