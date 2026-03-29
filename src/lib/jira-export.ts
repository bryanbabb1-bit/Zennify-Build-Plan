import type { Epic, Story, AcceptanceCriterion } from "@/types"

type EpicWithStories = Epic & { stories: Story[] }

export function generateJiraJSON(epics: EpicWithStories[]) {
  return {
    epics: epics.map((e) => ({
      key: e.jiraKey || e.id,
      title: e.title,
      description: e.description,
      sfClouds: e.sfClouds,
      priority: e.priority,
    })),
    stories: epics.flatMap((e) =>
      e.stories.map((s) => ({
        epicKey: e.jiraKey || e.id,
        epicTitle: e.title,
        title: s.title,
        userRole: s.userRole,
        action: s.action,
        benefit: s.benefit,
        acceptanceCriteria: (s.acceptanceCriteria as AcceptanceCriterion[]).map((ac) => ac.criterion),
        type: s.type,
        priority: s.priority,
        storyPoints: s.storyPoints,
        sfObjects: s.sfObjects,
        sfFeatures: s.sfFeatures,
        labels: [...s.sfObjects, ...s.sfFeatures].slice(0, 5),
      }))
    ),
  }
}

export async function generateJiraCSV(epics: EpicWithStories[]): Promise<string> {
  const { stringify } = await import("csv-stringify/sync")

  const rows: string[][] = []
  const headers = [
    "Summary",
    "Issue Type",
    "Description",
    "Acceptance Criteria",
    "Story Points",
    "Epic Name",
    "Epic Link",
    "Priority",
    "Labels",
    "Salesforce Objects",
    "Salesforce Features",
  ]
  rows.push(headers)

  // Epics first
  for (const epic of epics) {
    rows.push([
      epic.title,
      "Epic",
      epic.description,
      "",
      "",
      epic.title,
      epic.jiraKey || "",
      epic.priority,
      epic.sfClouds.join(" "),
      "",
      "",
    ])

    // Then stories under each epic
    for (const story of epic.stories) {
      const ac = (story.acceptanceCriteria as AcceptanceCriterion[])
        .map((c, i) => `${i + 1}. ${c.criterion}`)
        .join("\n")

      const labels = [...story.sfObjects, ...story.sfFeatures].join(" ").replace(/\s+/g, "_")

      rows.push([
        story.title,
        story.type === "FEATURE" ? "Story" : story.type === "TASK" ? "Task" : "Spike",
        `As a ${story.userRole}, I want ${story.action}, so that ${story.benefit}`,
        ac,
        story.storyPoints?.toString() || "",
        epic.title,
        epic.jiraKey || "",
        story.priority,
        labels,
        story.sfObjects.join(", "),
        story.sfFeatures.join(", "),
      ])
    }
  }

  return stringify(rows)
}
