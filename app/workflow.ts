export type Competition = {
  id: string;
  name: string;
  team: string;
  roles: string[];
  roleOther: string;
  strengths: string;
  improvements: string;
  review: string;
};

export type Award = {
  id: string;
  competition: string;
  result: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  technologies: string;
  imageDirection: string;
  link: string;
};

export type PortfolioData = {
  studentName: string;
  portfolioName: string;
  logoName: string;
  language: string;
  purpose: string;
  audience: string;
  portfolioIntro: string;
  textPolicy: string;
  sections: string[];
  sectionOther: string;
  heroTitle: string;
  heroIntro: string;
  bio: string;
  goal: string;
  competitions: Competition[];
  skills: string[];
  skillOther: string;
  skillLevels: Record<string, number>;
  awards: Award[];
  projects: Project[];
  theme: string;
  moods: string[];
  moodOther: string;
  palette: string;
  customColors: string;
  backgrounds: string[];
  backgroundOther: string;
  competitionLayout: string;
  skillLayout: string;
  portfolioColumns: string;
  projectAction: string;
  footerText: string;
  email: string;
  githubUrl: string;
  portfolioUrl: string;
};

export type Step = {
  number: number;
  phase: string;
  title: string;
  summary: string;
  tip: string;
  icon: string;
  color: "yellow" | "mint" | "blue" | "purple" | "coral";
  x: number;
  y: number;
};

const competitionId = "competition-1";
const awardId = "award-1";
const projectId = "project-1";

export const EMPTY_COMPETITION: Competition = {
  id: competitionId,
  name: "",
  team: "",
  roles: [],
  roleOther: "",
  strengths: "",
  improvements: "",
  review: "",
};

export const EMPTY_AWARD: Award = {
  id: awardId,
  competition: "",
  result: "",
};

export const EMPTY_PROJECT: Project = {
  id: projectId,
  title: "",
  description: "",
  technologies: "",
  imageDirection: "",
  link: "",
};

export const INITIAL_DATA: PortfolioData = {
  studentName: "",
  portfolioName: "",
  logoName: "",
  language: "",
  purpose: "",
  audience: "",
  portfolioIntro: "",
  textPolicy: "",
  sections: ["Competition Journey"],
  sectionOther: "",
  heroTitle: "",
  heroIntro: "",
  bio: "",
  goal: "",
  competitions: [{ ...EMPTY_COMPETITION }],
  skills: [],
  skillOther: "",
  skillLevels: {},
  awards: [{ ...EMPTY_AWARD }],
  projects: [{ ...EMPTY_PROJECT }],
  theme: "",
  moods: [],
  moodOther: "",
  palette: "",
  customColors: "",
  backgrounds: [],
  backgroundOther: "",
  competitionLayout: "",
  skillLayout: "",
  portfolioColumns: "",
  projectAction: "",
  footerText: "",
  email: "",
  githubUrl: "",
  portfolioUrl: "",
};

export const SECTION_OPTIONS = [
  "About",
  "Experience",
  "Competition Journey",
  "Skills",
  "Certifications & Awards",
  "Education",
  "Portfolio",
  "Contact",
];

export function normalizeSections(values: string[] | undefined) {
  const source = Array.isArray(values) ? values : INITIAL_DATA.sections;
  const sections = source.reduce<string[]>((result, value) => {
    const section = typeof value === "string" ? value.trim() : "";
    if (SECTION_OPTIONS.includes(section) && !result.includes(section)) result.push(section);
    return result;
  }, []);

  if (!sections.includes("Competition Journey")) {
    const aboutIndex = sections.indexOf("About");
    sections.splice(aboutIndex >= 0 ? aboutIndex + 1 : 0, 0, "Competition Journey");
  }

  return sections;
}

export function resolvePortfolioSections(data: Pick<PortfolioData, "sections" | "sectionOther" | "awards">) {
  const normalized = normalizeSections(data.sections);
  const hasAwards = data.awards.some((award) => award.competition.trim() || award.result.trim());
  const sections = hasAwards && !normalized.includes("Certifications & Awards")
    ? [...normalized, "Certifications & Awards"]
    : normalized;

  return [...sections, data.sectionOther.trim()]
    .filter((section, index, values) => Boolean(section) && values.indexOf(section) === index);
}

export function reorderSections(values: string[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= values.length || to >= values.length) return values;
  const reordered = [...values];
  const [moved] = reordered.splice(from, 1);
  reordered.splice(to, 0, moved);
  return reordered;
}

export const ROLE_OPTIONS = [
  "로봇 제작",
  "프로그래밍",
  "전략 수립",
  "주행 테스트",
  "문제 해결",
  "자료 제작",
  "발표",
  "팀 리더",
  "팀원 지원",
];

export const SKILL_OPTIONS = [
  "Block Coding",
  "C Coding",
  "Python",
  "MicroPython",
  "Robot Building",
  "Motor Control",
  "Sensor Control",
  "Problem Solving",
  "Teamwork",
  "PPT Presentation",
  "Instruction Making",
  "Web Design",
  "AI Tools",
];

export const MOOD_OPTIONS = [
  "미래 기술형",
  "밝은 학생형",
  "깔끔 전문형",
  "역동 프로젝트형",
];

const LEGACY_MOOD_GROUPS: Record<string, string[]> = {
  "미래 기술형": ["미래적인", "기술적인"],
  "밝은 학생형": ["학생다운", "친근한"],
  "깔끔 전문형": ["깔끔한", "전문적인", "미니멀한"],
  "역동 프로젝트형": ["역동적인"],
};

const MOOD_KEYWORDS: Record<string, RegExp> = {
  "미래 기술형": /미래|기술|사이버|네온|로봇|테크/i,
  "밝은 학생형": /학생|친근|밝은|재미|귀여|놀이/i,
  "깔끔 전문형": /깔끔|전문|미니멀|정돈|단정|심플/i,
  "역동 프로젝트형": /역동|활동|움직|강렬|프로젝트/i,
};

export function resolveMoodPreset(values: string[] | undefined, other = "") {
  const selected = values ?? [];
  const existingPreset = selected.find((value) => MOOD_OPTIONS.includes(value));
  if (existingPreset) return existingPreset;

  let bestPreset = "밝은 학생형";
  let bestScore = 0;
  for (const preset of MOOD_OPTIONS) {
    const legacyScore = LEGACY_MOOD_GROUPS[preset].filter((value) => selected.includes(value)).length;
    const customScore = other.trim() && MOOD_KEYWORDS[preset].test(other) ? 1 : 0;
    const score = legacyScore + customScore;
    if (score > bestScore) {
      bestPreset = preset;
      bestScore = score;
    }
  }
  return bestPreset;
}

export const BACKGROUND_OPTIONS = [
  "은은한 회로 패턴",
  "그라데이션",
  "빛나는 포인트",
  "격자 패턴",
  "배경 효과 없음",
];

export const STEPS: Step[] = [
  { number: 1, phase: "기본", title: "포트폴리오 정보", summary: "학생과 웹앱의 이름을 정해요.", tip: "웹앱 전체에서 사용할 이름을 먼저 정하면 문구가 일관돼요.", icon: "/tool-brain.png", color: "yellow", x: 55, y: 110 },
  { number: 2, phase: "목적", title: "목적과 소개", summary: "무엇을 보여줄지 설명해요.", tip: "결과뿐 아니라 배우고 개선한 과정이 드러나게 적어 보세요.", icon: "/step-purpose.png", color: "yellow", x: 335, y: 110 },
  { number: 3, phase: "구성", title: "영역 선택", summary: "포트폴리오에 넣을 영역을 골라요.", tip: "대회 기록은 성장 과정을 보여주는 필수 영역으로 유지돼요.", icon: "/step-sections.png", color: "mint", x: 615, y: 110 },
  { number: 4, phase: "소개", title: "About 작성", summary: "첫 화면의 고정 문구를 작성해요.", tip: "Stitch가 임의로 바꾸지 않도록 실제 표시할 문장을 적어 주세요.", icon: "/tool-pencil.png", color: "mint", x: 895, y: 110 },
  { number: 5, phase: "대회", title: "대회 기록", summary: "역할과 성장 과정을 기록해요.", tip: "대회 결과보다 내가 한 일과 다음에 개선할 점이 중요해요.", icon: "/step-competition.png", color: "purple", x: 1175, y: 110 },
  { number: 6, phase: "역량", title: "기술과 수상", summary: "기술은 선택하고 수상은 추가해요.", tip: "기술은 여러 개 선택할 수 있고 목록에 없으면 직접 추가할 수 있어요.", icon: "/tool-gear.png", color: "purple", x: 1175, y: 410 },
  { number: 7, phase: "프로젝트", title: "작품 추가", summary: "로봇 프로젝트를 카드로 정리해요.", tip: "무엇을 만들었는지와 어떤 기술을 사용했는지를 구체적으로 적어요.", icon: "/step-sections.png", color: "blue", x: 895, y: 410 },
  { number: 8, phase: "디자인", title: "스타일 선택", summary: "분위기·색상·배경을 골라요.", tip: "서로 겹치지 않는 대표 분위기 하나를 고르면 전체 디자인에 일관되게 적용돼요.", icon: "/tool-paint.png", color: "blue", x: 615, y: 410 },
  { number: 9, phase: "레이아웃", title: "화면과 Footer", summary: "표시 방식과 마지막 문구를 정해요.", tip: "반응형·고정 메뉴·부드러운 이동은 자동으로 프롬프트에 포함돼요.", icon: "/step-sections.png", color: "blue", x: 335, y: 410 },
  { number: 10, phase: "완성", title: "Stitch 프롬프트", summary: "입력 내용을 하나로 완성해요.", tip: "내용을 확인한 뒤 복사해 Google Stitch에 붙여넣으세요.", icon: "/tool-gear.png", color: "coral", x: 55, y: 410 },
];

const hasText = (value: string) => Boolean(value?.trim());

export function competitionComplete(item: Competition) {
  return hasText(item.name)
    && hasText(item.team)
    && (item.roles.length > 0 || hasText(item.roleOther))
    && hasText(item.strengths)
    && hasText(item.improvements)
    && hasText(item.review);
}

export function projectComplete(item: Project) {
  return hasText(item.title) && hasText(item.description) && hasText(item.technologies);
}

export function stepComplete(stepNumber: number, data: PortfolioData): boolean {
  switch (stepNumber) {
    case 1:
      return hasText(data.studentName) && hasText(data.portfolioName) && hasText(data.logoName) && hasText(data.language);
    case 2:
      return hasText(data.purpose) && hasText(data.audience) && hasText(data.portfolioIntro) && hasText(data.textPolicy);
    case 3:
      return data.sections.includes("Competition Journey") && (data.sections.length > 1 || hasText(data.sectionOther));
    case 4:
      return hasText(data.heroTitle) && hasText(data.heroIntro) && hasText(data.bio) && hasText(data.goal);
    case 5:
      return data.competitions.length > 0 && data.competitions.every(competitionComplete);
    case 6:
      return data.skills.length > 0 || hasText(data.skillOther);
    case 7:
      return data.projects.length > 0 && data.projects.every(projectComplete);
    case 8:
      return hasText(data.theme) && hasText(data.palette) && data.moods.length > 0;
    case 9:
      return hasText(data.competitionLayout) && hasText(data.skillLayout) && hasText(data.portfolioColumns) && hasText(data.projectAction) && hasText(data.footerText);
    case 10:
      return STEPS.slice(0, 9).every((step) => stepComplete(step.number, data));
    default:
      return false;
  }
}

const joinWithOther = (values: string[], other: string) => [...values, other.trim()].filter(Boolean).join(", ");

function competitionBlock(items: Competition[]) {
  return items.map((item, index) => `대회 기록 ${index + 1}
- 대회명: “${item.name}”
- 팀명: “${item.team}”
- 자신의 역할: “${joinWithOther(item.roles, item.roleOther)}”
- 잘한 점: “${item.strengths}”
- 아쉬운 점 및 보완할 점: “${item.improvements}”
- 이번 대회 한줄평: “${item.review}”`).join("\n\n");
}

function awardBlock(items: Award[]) {
  const filled = items.filter((item) => hasText(item.competition) || hasText(item.result));
  if (!filled.length) return "- 입력한 수상 내역 없음";
  return filled.map((item) => `- ${item.competition}: ${item.result}`).join("\n");
}

function projectBlock(items: Project[]) {
  return items.map((item, index) => `Portfolio 카드 ${index + 1}
- 제목: “${item.title}”
- 내용: “${item.description}”
- 사용 기술: “${item.technologies}”
- 이미지 방향: “${item.imageDirection || "프로젝트에 어울리는 로봇 또는 코딩 이미지 영역"}”
- 연결 링크: “${item.link || "링크 없음"}”`).join("\n\n");
}

export function createStitchPrompt(data: PortfolioData) {
  const orderedSections = resolvePortfolioSections(data);
  const sections = orderedSections.map((section, index) => `${index + 1}. ${section}`).join(" → ");
  const skills = joinWithOther(data.skills, data.skillOther);
  const skillNames = [...data.skills, data.skillOther.trim()].filter(Boolean);
  const skillLevels = skillNames.map((skill) => {
    const level = Math.min(5, Math.max(1, Math.round(data.skillLevels?.[skill] ?? 3)));
    return `- ${skill}: ${level}/5단계`;
  }).join("\n");
  const mood = resolveMoodPreset(data.moods, data.moodOther);
  const backgrounds = joinWithOther(data.backgrounds, data.backgroundOther);
  const palette = data.palette === "직접 색상 입력" ? data.customColors : data.palette;
  const textRule = data.textPolicy === "입력한 문구를 그대로 사용"
    ? `아래에 입력된 제목, 메뉴명, 버튼명과 본문 문장은 반드시 그대로 사용해 주세요.
- 문구를 요약하거나 비슷한 표현으로 바꾸지 마세요.
- 한국어와 영어를 임의로 번역하지 마세요.
- 맞춤법이나 대소문자를 임의로 수정하지 마세요.
- 임의의 예시 문구나 Lorem ipsum으로 대체하지 마세요.`
    : data.textPolicy === "맞춤법만 수정 허용"
      ? "입력 문장의 의미와 언어는 유지하고, 명백한 맞춤법과 띄어쓰기만 수정해 주세요."
      : "입력한 핵심 의미와 고유명사는 유지하면서 화면에 자연스럽게 읽히도록 문장을 다듬어 주세요.";

  return `Google Stitch에서 아래 요구사항을 바탕으로 학생 개인 로봇 포트폴리오 웹앱의 완성도 높은 UI/UX 디자인과 인터랙티브 프로토타입을 제작해 주세요.

## 1. 웹앱의 목적
- 학생 이름: “${data.studentName}”
- 포트폴리오 이름: “${data.portfolioName}”
- 웹앱 로고 이름: “${data.logoName}”
- 사용 언어: “${data.language}”
- 웹앱의 목적: “${data.purpose}”
- 주요 사용자: “${data.audience}”
- 포트폴리오 소개: “${data.portfolioIntro}”

이 웹앱은 단순한 자기소개 페이지가 아니라, 로봇을 만들고 코딩하며 문제를 해결하고 개선해 온 학생의 성장 과정을 보여주는 포트폴리오여야 합니다.

## 2. 고정 텍스트 규칙
${textRule}

## 3. 메뉴 및 영역 구성
- 표시할 영역 및 생성 순서: ${sections}
- 상단에는 고정형 내비게이션 바를 만들고 왼쪽에 “${data.logoName}” 로고와 작은 로봇 아이콘을 넣어 주세요.
- 위에 적힌 순서를 바꾸지 말고 상단 메뉴와 본문 섹션 양쪽에 동일하게 적용해 주세요.
- 선택한 영역 이름을 상단 메뉴로 사용하고, 각 메뉴를 클릭하면 페이지 안의 해당 영역으로 부드럽게 이동하게 해 주세요.
- Competition Journey 영역은 대회 결과만 나열하지 말고 역할·성찰·성장 과정이 드러나도록 구성해 주세요.

## 4. 첫 화면 / About 고정 문구
- 제목: “${data.heroTitle}”
- 소개 문장: “${data.heroIntro}”
- 자기소개: “${data.bio}”
- 목표 문장: “${data.goal}”
- 데스크톱에서는 좌우 2단으로 구성하고, 오른쪽에는 로봇 또는 코딩 관련 대표 이미지나 카드 UI를 배치해 주세요.

## 5. Competition Journey 대회 기록
대회 결과뿐 아니라 학생이 준비하고 참여하며 배운 점과 다음 개선 계획이 드러나게 해 주세요.
표시 방식: ${data.competitionLayout}

${competitionBlock(data.competitions)}

## 6. Skills
- 표시 방식: ${data.skillLayout}
- 기술과 역량: ${skills}
- 아이콘, 태그, 카드 또는 배지를 활용해 한눈에 알아볼 수 있게 해 주세요.
${data.skillLayout === "진행도 표시" ? `- 기술별 숙련도는 아래 입력값을 그대로 사용해 주세요. 임의의 수치로 바꾸지 마세요.\n${skillLevels || "- 입력한 기술 없음"}` : ""}

## 7. Certifications & Awards
${awardBlock(data.awards)}

## 8. Portfolio 프로젝트
- 프로젝트 카드 배치: ${data.portfolioColumns}
- ‘자세히 보기’ 동작: ${data.projectAction}

${projectBlock(data.projects)}

각 카드에는 프로젝트 제목, 설명, 이미지 영역, 사용 기술과 선택한 자세히 보기 동작을 포함해 주세요.

## 9. 디자인 의도
- 테마: ${data.theme}
- 디자인 분위기 프리셋: ${mood}
- 색상: ${palette}
- 배경 효과: ${backgrounds || "배경 효과 없음"}
- 로봇, 코딩, 미래 기술과 창의적인 프로젝트의 느낌을 주되 너무 복잡하거나 어렵게 보이지 않게 해 주세요.
- 넓은 여백, 읽기 쉬운 글자 크기, 둥근 카드와 버튼을 사용해 학생 프로젝트에 어울리는 깔끔하고 성실한 인상을 주세요.

## 10. Footer
- Footer 문구: “${data.footerText}”
- 이메일: “${data.email || "표시하지 않음"}”
- GitHub: “${data.githubUrl || "표시하지 않음"}”
- 포트폴리오 링크: “${data.portfolioUrl || "표시하지 않음"}”

## 11. 반응형 및 상호작용 조건
- 원페이지 스크롤 구조로 제작해 주세요.
- 데스크톱과 모바일 화면에 맞게 자동으로 바뀌는 반응형 디자인을 적용해 주세요.
- 모바일에서는 모든 영역을 세로로 쌓고 상단 메뉴를 햄버거 메뉴로 바꿔 주세요.
- 모바일 메뉴에서도 각 항목을 누르면 해당 영역으로 부드럽게 이동하게 해 주세요.
- Flexbox 또는 Grid를 사용하고 텍스트, 이미지, 버튼과 카드가 화면 밖으로 넘치지 않게 해 주세요.
- 아이콘만으로 의미가 불분명한 기능에는 짧은 글자 라벨을 함께 표시해 주세요.

## 12. 최종 결과 요청
1. 먼저 전체 디자인 방향과 정보 구조를 짧게 설명해 주세요.
2. 선택한 모든 영역을 하나의 일관된 디자인 시스템으로 제작해 주세요.
3. 학생이 입력한 고정 문구와 대회·프로젝트 내용을 빠뜨리지 마세요.
4. 데스크톱과 모바일 화면을 모두 제작해 주세요.
5. 메뉴 이동과 자세히 보기 동작을 클릭 가능한 프로토타입으로 연결해 주세요.
6. 시각적으로 멋진 것뿐 아니라 처음 보는 사람도 학생의 경험과 성장 과정을 쉽게 이해할 수 있는 디자인을 우선해 주세요.`;
}
