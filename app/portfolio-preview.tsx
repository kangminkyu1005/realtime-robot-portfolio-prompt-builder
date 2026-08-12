import type { CSSProperties, ReactNode } from "react";
import type { PortfolioData } from "./workflow";

type PreviewProps = {
  data: PortfolioData;
  currentStep: number;
};

type PreviewTheme = CSSProperties & {
  "--preview-accent": string;
  "--preview-accent-soft": string;
  "--preview-secondary": string;
};

const LOCATION_LABELS = [
  "헤더 · 브랜드",
  "히어로 · 소개",
  "내비게이션 · 섹션",
  "히어로 · About",
  "Competition Journey",
  "Skills · Awards",
  "Portfolio 프로젝트",
  "전체 디자인 시스템",
  "레이아웃 · Footer",
  "전체 포트폴리오",
];

const HEX_COLORS_PATTERN = /#[0-9a-fA-F]{6}/g;
const PALETTE_VALUES: Record<string, [string, string, string]> = {
  "네온 블루 + 다크 네이비": ["#36c9ff", "rgba(54, 201, 255, .16)", "#6477ff"],
  "민트 + 네이비": ["#55e6c1", "rgba(85, 230, 193, .16)", "#5c8dff"],
  "퍼플 + 블루": ["#a875ff", "rgba(168, 117, 255, .17)", "#4da6ff"],
  "레드 + 블랙": ["#ff625f", "rgba(255, 98, 95, .16)", "#ffb44d"],
};

function text(value: string, fallback: string) {
  return value.trim() || fallback;
}

function compact(value: string, fallback: string, maxLength = 90) {
  const resolved = text(value, fallback);
  return resolved.length > maxLength ? `${resolved.slice(0, maxLength)}…` : resolved;
}

function previewTheme(data: PortfolioData): PreviewTheme {
  const customColors = data.customColors.match(HEX_COLORS_PATTERN) ?? [];
  const fallback = PALETTE_VALUES[data.palette] ?? PALETTE_VALUES["네온 블루 + 다크 네이비"];
  const accent = customColors[0] ?? fallback[0];
  const secondary = customColors[1] ?? fallback[2];

  return {
    "--preview-accent": accent,
    "--preview-accent-soft": customColors[0] ? `${accent}26` : fallback[1],
    "--preview-secondary": secondary,
  };
}

function EmptyValue({ children }: { children: ReactNode }) {
  return <span className="preview-empty">{children}</span>;
}

function HeroScene({ data, mode = "intro" }: { data: PortfolioData; mode?: "brand" | "intro" | "about" }) {
  const brandMode = mode === "brand";
  const aboutMode = mode === "about";

  return (
    <section className={`portfolio-hero ${brandMode ? "brand-focus" : ""}`}>
      <div className="hero-copy">
        <span className="hero-kicker">{brandMode ? text(data.portfolioName, "MY ROBOT PORTFOLIO") : "ROBOT · CODE · GROWTH"}</span>
        <h3>{text(data.heroTitle, brandMode ? "나의 로봇 포트폴리오" : "My Robot and Code Portfolio")}</h3>
        <p>{compact(aboutMode ? data.bio : data.heroIntro || data.portfolioIntro, aboutMode ? "로봇을 만들고 코딩하며 배운 나의 이야기가 여기에 표시됩니다." : "도전하고, 만들고, 개선하며 성장한 과정을 소개합니다.")}</p>
        <div className="hero-actions">
          <span>프로젝트 보기</span>
          <span className="ghost-action">성장 기록</span>
        </div>
        {aboutMode && <div className="goal-note"><b>MY NEXT GOAL</b><span>{compact(data.goal, "앞으로 도전할 목표가 이곳에 표시됩니다.", 65)}</span></div>}
      </div>
      <div className="robot-visual" aria-hidden="true">
        <span className="orbit orbit-one" />
        <span className="orbit orbit-two" />
        <div className="robot-head"><i /><i /><b /></div>
        <div className="robot-body"><span>01</span><span>AI</span></div>
        <div className="code-card">&lt;build /&gt;<br /><b>robot.portfolio</b></div>
      </div>
    </section>
  );
}

function NavigationScene({ data }: { data: PortfolioData }) {
  const sections = [...data.sections, data.sectionOther].filter(Boolean);
  return (
    <section className="navigation-scene">
      <div className="scene-heading"><span>PAGE STRUCTURE</span><h3>선택한 영역이 메뉴와 본문에 연결됩니다</h3></div>
      <div className="site-map">
        <div className="site-map-root"><b>HOME</b><span>{text(data.logoName, "Portfolio Logo")}</span></div>
        <div className="site-map-line" />
        <div className="site-map-items">
          {sections.map((section, index) => <div key={`${section}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><b>{section}</b><small>메뉴 + 본문 섹션</small></div>)}
        </div>
      </div>
    </section>
  );
}

function CompetitionScene({ data }: { data: PortfolioData }) {
  return (
    <section className="journey-scene">
      <div className="scene-heading"><span>COMPETITION JOURNEY</span><h3>결과보다 성장의 과정을 기록합니다</h3></div>
      <div className="timeline-preview">
        {data.competitions.slice(0, 3).map((competition, index) => (
          <article key={competition.id}>
            <div className="timeline-dot">{index + 1}</div>
            <div className="journey-card">
              <span>{text(competition.team, `TEAM ${String(index + 1).padStart(2, "0")}`)}</span>
              <h4>{text(competition.name, "대회명이 여기에 표시됩니다")}</h4>
              <div className="role-tags">{competition.roles.length ? competition.roles.slice(0, 3).map((role) => <i key={role}>{role}</i>) : <EmptyValue>역할 태그</EmptyValue>}</div>
              <p>{compact(competition.review || competition.strengths, "대회 한줄평과 성장 기록이 카드에 반영됩니다.", 70)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SkillsScene({ data }: { data: PortfolioData }) {
  const skills = [...data.skills, data.skillOther].filter(Boolean);
  const awards = data.awards.filter((award) => award.competition.trim() || award.result.trim());
  return (
    <section className="skills-scene">
      <div className="scene-heading"><span>SKILLS & AWARDS</span><h3>배운 기술과 결과를 한눈에</h3></div>
      <div className="skills-layout">
        <div className="skill-cloud">
          {(skills.length ? skills : ["Robot Building", "Coding", "Problem Solving", "Teamwork"]).slice(0, 10).map((skill, index) => <span key={`${skill}-${index}`} className={!skills.length ? "is-placeholder" : ""}><i>{String(index + 1).padStart(2, "0")}</i>{skill}</span>)}
        </div>
        <div className="award-stack">
          <span className="award-icon">★</span>
          <h4>Certifications<br />& Awards</h4>
          {(awards.length ? awards : [{ id: "preview", competition: "대회명", result: "수상 결과" }]).slice(0, 3).map((award) => <div key={award.id} className={!awards.length ? "is-placeholder" : ""}><b>{award.result}</b><small>{award.competition}</small></div>)}
        </div>
      </div>
    </section>
  );
}

function ProjectsScene({ data }: { data: PortfolioData }) {
  return (
    <section className="projects-scene">
      <div className="scene-heading"><span>SELECTED PROJECTS</span><h3>직접 만든 프로젝트</h3></div>
      <div className="project-preview-grid">
        {data.projects.slice(0, 4).map((project, index) => (
          <article key={project.id}>
            <div className={`project-art art-${(index % 3) + 1}`}><span>0{index + 1}</span><i /><i /><b /></div>
            <div className="project-copy">
              <span>{text(project.technologies, "ROBOT · CODE")}</span>
              <h4>{text(project.title, "프로젝트 제목")}</h4>
              <p>{compact(project.description, "프로젝트 설명이 이 카드에 실시간으로 표시됩니다.", 62)}</p>
              <b>{data.projectAction === "버튼 표시 안 함" ? "" : text(data.projectAction, "자세히 보기")} {data.projectAction === "버튼 표시 안 함" ? "" : "→"}</b>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DesignScene({ data }: { data: PortfolioData }) {
  const moods = [...data.moods, data.moodOther].filter(Boolean);
  return (
    <section className="design-scene">
      <div className="scene-heading"><span>VISUAL SYSTEM</span><h3>선택한 디자인이 미리보기 전체에 적용됩니다</h3></div>
      <div className="design-demo">
        <div className="type-demo"><span>TYPOGRAPHY</span><b>Aa</b><h4>{text(data.heroTitle, "Future makers")}</h4><p>{text(data.portfolioIntro, "로봇과 코딩으로 만드는 나의 이야기")}</p></div>
        <div className="palette-demo"><span>COLOR PALETTE</span><div><i /><i /><i /><i /></div><p>{data.palette === "직접 색상 입력" ? text(data.customColors, "색상 코드를 입력해 주세요") : data.palette}</p></div>
        <div className="mood-demo"><span>MOOD</span><div>{moods.slice(0, 6).map((mood) => <i key={mood}>{mood}</i>)}</div><p>{data.backgrounds.join(" · ") || "배경 효과 없음"}</p></div>
      </div>
    </section>
  );
}

function LayoutScene({ data }: { data: PortfolioData }) {
  return (
    <section className="layout-scene">
      <div className="scene-heading"><span>RESPONSIVE LAYOUT</span><h3>콘텐츠 배치와 Footer</h3></div>
      <div className="layout-demo">
        <div className="desktop-wireframe"><span className="wire-nav" /><span className="wire-hero" /><span className="wire-card a" /><span className="wire-card b" /><span className="wire-card c" /><span className="wire-footer" /></div>
        <div className="layout-notes">
          <div><span>COMPETITION</span><b>{data.competitionLayout}</b></div>
          <div><span>SKILLS</span><b>{data.skillLayout}</b></div>
          <div><span>PROJECT GRID</span><b>{data.portfolioColumns}</b></div>
          <div><span>FOOTER COPY</span><b>{text(data.footerText, "Footer 문구가 하단에 표시됩니다")}</b></div>
        </div>
      </div>
    </section>
  );
}

function CompleteScene({ data }: { data: PortfolioData }) {
  return (
    <section className="complete-scene">
      <HeroScene data={data} mode="intro" />
      <div className="complete-strip">
        <span><b>{data.competitions.length}</b> COMPETITIONS</span>
        <span><b>{data.skills.length || "—"}</b> SKILLS</span>
        <span><b>{data.projects.length}</b> PROJECTS</span>
      </div>
      <div className="complete-cards">
        <div><span>01</span><b>Competition Journey</b><small>{text(data.competitions[0]?.name ?? "", "성장 기록")}</small></div>
        <div><span>02</span><b>Skills & Awards</b><small>{text(data.skills.slice(0, 3).join(" · "), "기술과 역량")}</small></div>
        <div><span>03</span><b>Portfolio</b><small>{text(data.projects[0]?.title ?? "", "프로젝트")}</small></div>
      </div>
    </section>
  );
}

function Scene({ data, currentStep }: PreviewProps) {
  switch (currentStep) {
    case 1:
      return <HeroScene data={data} mode="brand" />;
    case 2:
      return <HeroScene data={data} mode="intro" />;
    case 3:
      return <NavigationScene data={data} />;
    case 4:
      return <HeroScene data={data} mode="about" />;
    case 5:
      return <CompetitionScene data={data} />;
    case 6:
      return <SkillsScene data={data} />;
    case 7:
      return <ProjectsScene data={data} />;
    case 8:
      return <DesignScene data={data} />;
    case 9:
      return <LayoutScene data={data} />;
    default:
      return <CompleteScene data={data} />;
  }
}

export default function PortfolioPreview({ data, currentStep }: PreviewProps) {
  const navigation = [...data.sections, data.sectionOther].filter(Boolean).slice(0, 6);
  const lightTheme = data.theme === "라이트 테마";
  const locationIndex = Math.min(currentStep - 1, LOCATION_LABELS.length - 1);

  return (
    <section className="preview-pane" aria-label="실시간 포트폴리오 미리보기">
      <header className="preview-pane-header">
        <div><span className="live-indicator"><i /> LIVE PREVIEW</span><h2>포트폴리오 화면 미리보기</h2></div>
        <div className="preview-location"><span>현재 반영 위치</span><b>{LOCATION_LABELS[locationIndex]}</b></div>
      </header>

      <div className="browser-frame">
        <div className="browser-bar" aria-hidden="true"><div><i /><i /><i /></div><span>portfolio.preview</span><b>↗</b></div>
        <div className={`portfolio-canvas ${lightTheme ? "light" : "dark"}`} style={previewTheme(data)}>
          <nav className="portfolio-navigation">
            <div className="preview-brand"><span>R</span><b>{text(data.logoName, "ROBOT.FOLIO")}</b></div>
            <div className="preview-menu">{(navigation.length ? navigation : ["About", "Journey", "Skills", "Portfolio"]).map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
            <span className="language-chip">{text(data.language, "KR · EN")}</span>
          </nav>
          <div className="preview-scene"><Scene data={data} currentStep={currentStep} /></div>
          <footer className="preview-footer"><span>{text(data.footerText, `© ${text(data.studentName, "Robot Maker")} Portfolio`)}</span><div>{data.email ? <i>MAIL</i> : null}{data.githubUrl ? <i>GITHUB</i> : null}{data.portfolioUrl ? <i>WEB</i> : null}</div></footer>
        </div>
      </div>

      <div className="preview-locator" aria-label="포트폴리오 내 현재 위치">
        {LOCATION_LABELS.slice(0, 9).map((label, index) => <span key={label} className={index === locationIndex || currentStep === 10 ? "active" : ""}><i />{label.split(" · ")[0]}</span>)}
      </div>
    </section>
  );
}
