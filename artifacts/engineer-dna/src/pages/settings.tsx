import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useGetUserProfile, useUpdateUserProfile, getGetUserProfileQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Settings2 } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(2, "Name required"),
  githubUsername: z.string().optional(),
  bio: z.string().optional(),
  targetRole: z.string().optional(),
  experienceLevel: z.string().optional(),
  primaryTrack: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0).optional()
})

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useGetUserProfile()
  const updateProfile = useUpdateUserProfile()
  
  const [skills, setSkills] = React.useState<string[]>([])
  const [skillInput, setSkillInput] = React.useState("")

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "", githubUsername: "", bio: "", targetRole: "", experienceLevel: "", primaryTrack: "", yearsOfExperience: 0
    }
  })

  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        githubUsername: profile.githubUsername || "",
        bio: profile.bio || "",
        targetRole: profile.targetRole || "",
        experienceLevel: profile.experienceLevel || "",
        primaryTrack: profile.primaryTrack || "",
        yearsOfExperience: profile.yearsOfExperience || 0
      })
      setSkills(profile.skills || [])
    }
  }, [profile, form])

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateProfile.mutate({ 
      data: { ...values, skills } 
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() })
      }
    })
  }

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()])
      }
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  if (isLoading) return <div className="animate-pulse h-96 bg-muted rounded-xl"></div>

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-muted border border-border rounded-xl">
          <Settings2 className="w-8 h-8 text-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Identity</h1>
          <p className="text-muted-foreground">Configure your baseline parameters for analysis context.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Data</CardTitle>
          <CardDescription>This context informs AI mentorship and roadmap generation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <Input {...form.register("name")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">GitHub Username</label>
                <Input placeholder="e.g. octocat" {...form.register("githubUsername")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Years of Experience</label>
                <Input type="number" {...form.register("yearsOfExperience")} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea placeholder="Brief summary of your background..." {...form.register("bio")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Role</label>
                <Input placeholder="e.g. Staff Engineer" {...form.register("targetRole")} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Experience Level</label>
                <Select onValueChange={v => form.setValue("experienceLevel", v)} value={form.watch("experienceLevel")}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid-Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Track</label>
                <Select onValueChange={v => form.setValue("primaryTrack", v)} value={form.watch("primaryTrack")}>
                  <SelectTrigger><SelectValue placeholder="Select track" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="fullstack">Fullstack</SelectItem>
                    <SelectItem value="ai">AI/ML</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="cloud">Cloud</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Core Skills Array</label>
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md border border-input min-h-[42px]">
                {skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-destructive shrink-0">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <input 
                  type="text"
                  className="bg-transparent outline-none flex-1 min-w-[120px] text-sm"
                  placeholder="Type skill & press Enter..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save Identity Parameters"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
