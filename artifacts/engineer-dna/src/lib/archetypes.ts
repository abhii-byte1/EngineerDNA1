export interface ArchetypeMeta {
  key: string;
  name: string;
  tagline: string;
  gradient: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  iconName: string;
}

export const ARCHETYPES_META: Record<string, ArchetypeMeta> = {
  night_owl_architect: {
    key: "night_owl_architect",
    name: "Night Owl Architect",
    tagline: "Crafting elegant system architectures during midnight flow states.",
    gradient: "from-indigo-600 via-purple-600 to-pink-500",
    borderColor: "border-indigo-500/30",
    textColor: "text-indigo-400",
    badgeBg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    iconName: "Moon",
  },
  speedrun_scripter: {
    key: "speedrun_scripter",
    name: "Speedrun Scripter",
    tagline: "Delivering high-velocity code and rapid prototyping with surgical efficiency.",
    gradient: "from-amber-500 via-orange-600 to-red-600",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    iconName: "Zap",
  },
  documentation_guardian: {
    key: "documentation_guardian",
    name: "Documentation Guardian",
    tagline: "Sustaining project clarity, clean READMEs, and pristine API specs.",
    gradient: "from-emerald-500 via-teal-600 to-cyan-600",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    iconName: "Shield",
  },
  open_source_nomad: {
    key: "open_source_nomad",
    name: "Open Source Nomad",
    tagline: "Navigating ecosystem repos, crafting pull requests across distributed communities.",
    gradient: "from-blue-500 via-cyan-500 to-teal-400",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
    badgeBg: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    iconName: "Globe",
  },
  full_stack_chameleon: {
    key: "full_stack_chameleon",
    name: "Full Stack Chameleon",
    tagline: "Seamlessly blending responsive front-end UIs with robust back-end systems.",
    gradient: "from-purple-500 via-violet-600 to-indigo-700",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400",
    badgeBg: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    iconName: "Layers",
  },
  refactoring_monk: {
    key: "refactoring_monk",
    name: "Refactoring Monk",
    tagline: "Pursuing code purity, zero technical debt, and elegant modular design.",
    gradient: "from-sky-500 via-blue-600 to-indigo-600",
    borderColor: "border-sky-500/30",
    textColor: "text-sky-400",
    badgeBg: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    iconName: "Sparkles",
  },
  test_driven_fanatic: {
    key: "test_driven_fanatic",
    name: "Test Driven Fanatic",
    tagline: "Forging indestructible test suites and bulletproof continuous integration.",
    gradient: "from-emerald-400 via-green-600 to-emerald-800",
    borderColor: "border-green-500/30",
    textColor: "text-green-400",
    badgeBg: "bg-green-500/10 text-green-300 border-green-500/30",
    iconName: "CheckCircle",
  },
  devops_magician: {
    key: "devops_magician",
    name: "DevOps Magician",
    tagline: "Orchestrating automated deployments, containerized clusters, and zero-downtime infra.",
    gradient: "from-rose-500 via-pink-600 to-purple-600",
    borderColor: "border-rose-500/30",
    textColor: "text-rose-400",
    badgeBg: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    iconName: "Cpu",
  },
  algorithm_artisan: {
    key: "algorithm_artisan",
    name: "Algorithm Artisan",
    tagline: "Optimizing data structures, algorithmic complexity, and high-throughput logic.",
    gradient: "from-amber-400 via-yellow-500 to-orange-500",
    borderColor: "border-yellow-500/30",
    textColor: "text-yellow-400",
    badgeBg: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    iconName: "Code",
  },
};

export function getArchetypeMeta(key?: string | null): ArchetypeMeta {
  if (key && ARCHETYPES_META[key]) {
    return ARCHETYPES_META[key];
  }
  return ARCHETYPES_META.full_stack_chameleon;
}
