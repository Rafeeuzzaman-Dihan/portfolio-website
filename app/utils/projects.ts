import projectsData from '~~/content/projects.json'
import skillGroups from '~~/content/skills.json'
import { formatMonthYear } from './date'

export interface ProjectRelease {
  version: string
  date: string | null
  inProgress?: boolean
}

export interface Project {
  slug: string
  title: string
  category: string
  summary: string
  image: string
  status: 'live' | 'classified' | 'private'
  liveUrl: string | null
  lockLabel: string | null
  started: string | null
  releases: ProjectRelease[]
  tech: string[]
  caseStudy: {
    client: string
    role: string
    overview: string
    challenge: string
    built: string[]
    underTheHood: string[]
    outcome: string
  }
}

export const projects = projectsData as Project[]

// Tech is named in projects.json; the logo and brand colour come from skills.json.
const skillsByName = new Map(skillGroups.flatMap(group => group.skills).map(skill => [skill.name, skill]))

export function projectTech(project: Project) {
  return project.tech.map((name) => {
    const skill = skillsByName.get(name)
    if (!skill) throw new Error(`projects.json: "${name}" (${project.slug}) is not in skills.json`)
    return skill
  })
}

export const STATUS_LABEL: Record<Project['status'], string> = {
  live: 'Live',
  classified: 'Classified',
  private: 'Private'
}

// "v2 · Sep 2026", "v2 · In progress" or just "v1" when the date isn't recorded.
export function releaseLabel(release: ProjectRelease) {
  if (release.inProgress) return `${release.version} · In progress`
  return release.date ? `${release.version} · ${formatMonthYear(release.date)}` : release.version
}

export function latestRelease(project: Project) {
  return project.releases[project.releases.length - 1]!
}
