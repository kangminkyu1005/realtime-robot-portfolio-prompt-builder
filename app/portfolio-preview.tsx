"use client";

import { useCallback, useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PortfolioData } from "./workflow";

type PreviewProps = {
  data: PortfolioData;
  currentStep: number;
  focusTarget: string;
  focusRequest: number;
};

type PreviewTheme = CSSProperties & {
  "--preview-accent": string;
  "--preview-accent-soft": string;
  "--preview-secondary": string;
};

const HEX_COLORS_PATTERN = /#[0-9a-fA-F]{6}/g;
const PALETTE_VALUES: Record<string, [string, string, string]> = {
  "네온 블루 + 다크 네이비": ["#36c9ff", "rgba(54, 201, 255, .16)", "#6477ff"],
  "민트 + 네이비": ["#56bca7", "rgba(86, 188, 167, .18)", "#2569c0"],
  "퍼플 + 블루": ["#a875ff", "rgba(168, 117, 255, .17)", "#4da6ff"],
  "레드 + 블랙": ["#ff625f", "rgba(255, 98, 95, .16)", "#ffb44d"],
};

const PREVIEW_NAVIGATION = [
  { key: "hero", label: "처음" },
  { key: "about-section", label: "소개" },
  { key: "competition-section", label: "대회" },
  { key: "skills-section", label: "역량" },
  { key: "projects-section", label: "프로젝트" },
  { key: "footer", label: "Footer" },
];

function text(value: string, fallback: string) {
  return value.trim() || fallback;
}

function compact(value: string, fallback: string, maxLength = 130) {
  const resolved = text(value, fallback);
  return resolved.length > maxLength ? `${resolved.slice(0, maxLength)}…` : resolved;
}

function previewTheme(data: PortfolioData): PreviewTheme {
  const customColors = data.customColors.match(HEX_COLORS_PATTERN) ?? [];
  const fallback = PALETTE_VALUES[data.palette] ?? PALETTE_VALUES["민트 + 네이비"];
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

function focusClass(activeTarget: string, key: string) {
  return activeTarget === key ? "preview-focus" : "";
}

function sectionClass(activeTarget: string, prefix: string) {
  return activeTarget.startsWith(prefix) ? "preview-section-current" : "";
}

function locationLabel(target: string) {
  if (target === "brand") return "헤더 · 브랜드";
  if (target === "student-name") return "히어로 · 학생 이름";
  if (target === "portfolio-name") return "히어로 · 포트폴리오 이름";
  if (target === "language") return "헤더 · 사용 언어";
  if (target === "navigation") return "헤더 · 메뉴 구성";
  if (target === "hero-title") return "히어로 · 첫 화면 제목";
  if (target === "hero-intro") return "히어로 · 소개 문장";
  if (target === "about-purpose") return "About · 웹앱 목적";
  if (target === "about-audience") return "About · 주요 사용자";
  if (target === "about-intro") return "About · 포트폴리오 소개";
  if (target === "about-bio") return "About · 자기소개";
  if (target === "about-goal") return "About · 앞으로의 목표";
  if (target === "text-policy") return "생성 규칙 · 문구 처리";
  if (target === "competition-section") return "Competition Journey";
  if (target.startsWith("competition-") && !/-(name|team|roles|strengths|improvements|review)$/.test(target)) return "Competition Journey · 대회 기록";
  if (target.includes("-name")) return "Competition Journey · 대회명";
  if (target.includes("-team")) return "Competition Journey · 팀명";
  if (target.includes("-roles")) return "Competition Journey · 자신의 역할";
  if (target.includes("-strengths")) return "Competition Journey · 잘한 점";
  if (target.includes("-improvements")) return "Competition Journey · 보완할 점";
  if (target.includes("-review")) return "Competition Journey · 한줄평";
  if (target.startsWith("award-")) return "Skills & Awards · 수상 내역";
  if (target === "skills-section" || target === "skills-list") return "Skills & Awards · 기술과 역량";
  if (target === "projects-section") return "Portfolio 프로젝트";
  if (target.includes("-technologies")) return "Portfolio · 사용 기술";
  if (target.includes("-description")) return "Portfolio · 프로젝트 설명";
  if (target.includes("-image")) return "Portfolio · 이미지 방향";
  if (target.includes("-link")) return "Portfolio · 연결 링크";
  if (target.startsWith("project-")) return "Portfolio · 프로젝트 제목";
  if (target === "competition-layout") return "Competition Journey · 배치";
  if (target === "skills-layout") return "Skills & Awards · 배치";
  if (target === "projects-layout" || target === "project-action") return "Portfolio · 카드 배치";
  if (target === "footer" || target.startsWith("contact-")) return "Contact · Footer";
  if (target === "design-system") return "전체 페이지 · 디자인";
  return "전체 포트폴리오";
}

function annotationText(target: string) {
  if (target === "text-policy") return "이 선택은 화면 문구가 아니라 Stitch가 글을 다루는 생성 규칙에 적용됩니다.";
  if (target === "design-system") return "선택한 테마·색상·분위기·배경 효과가 미리보기 전체에 적용됩니다.";
  if (target === "navigation") return "선택한 영역이 상단 메뉴와 아래 본문 섹션에 함께 반영됩니다.";
  if (target === "overview") return "완성된 포트폴리오를 위에서 아래로 직접 스크롤해 확인할 수 있습니다.";
  return "";
}

function HeroSection({ data, focusTarget }: { data: PortfolioData; focusTarget: string }) {
  return (
    <section
      className={`portfolio-page-section portfolio-hero ${sectionClass(focusTarget, "hero")}`}
      data-preview-key="hero"
    >
      <div className="hero-copy">
        <span className={`student-chip ${focusClass(focusTarget, "student-name")}`} data-preview-key="student-name">
          {text(data.studentName, "ROBOT MAKER")}
        </span>
        <span className={`hero-kicker ${focusClass(focusTarget, "portfolio-name")}`} data-preview-key="portfolio-name">
          {text(data.portfolioName, "MY ROBOT PORTFOLIO")}
        </span>
        <h3 className={focusClass(focusTarget, "hero-title")} data-preview-key="hero-title">
          {text(data.heroTitle, "My Robot and Code Portfolio")}
        </h3>
        <p className={focusClass(focusTarget, "hero-intro")} data-preview-key="hero-intro">
          {compact(data.heroIntro || data.portfolioIntro, "도전하고, 만들고, 개선하며 성장한 과정을 소개합니다.")}
        </p>
        <div className="hero-actions" aria-hidden="true">
          <span>프로젝트 보기</span>
          <span className="ghost-action">성장 기록</span>
        </div>
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

function AboutSection({ data, focusTarget }: { data: PortfolioData; focusTarget: string }) {
  return (
    <section
      className={`portfolio-page-section about-section ${sectionClass(focusTarget, "about")}`}
      data-preview-key="about-section"
    >
      <div className="page-section-heading">
        <span>ABOUT THE MAKER</span>
        <h3 className={focusClass(focusTarget, "about-intro")} data-preview-key="about-intro">
          {text(data.portfolioIntro, "결과뿐 아니라 시도하고 개선한 성장 과정을 보여줍니다")}
        </h3>
      </div>
      <div className="about-layout">
        <div className={`about-story ${focusClass(focusTarget, "about-bio")}`} data-preview-key="about-bio">
          <span>MY STORY</span>
          <p>{compact(data.bio, "로봇을 만들고 코딩하며 배우는 나의 이야기가 이곳에 표시됩니다.", 180)}</p>
        </div>
        <div className="about-facts">
          <article className={focusClass(focusTarget, "about-purpose")} data-preview-key="about-purpose">
            <i>01</i><span>PORTFOLIO PURPOSE</span>
            <p>{compact(data.purpose, "이 포트폴리오로 보여주고 싶은 목적", 95)}</p>
          </article>
          <article className={focusClass(focusTarget, "about-audience")} data-preview-key="about-audience">
            <i>02</i><span>FOR WHOM</span>
            <p>{compact(data.audience, "친구, 선생님, 가족과 대회 관계자", 95)}</p>
          </article>
          <article className={focusClass(focusTarget, "about-goal")} data-preview-key="about-goal">
            <i>03</i><span>MY NEXT GOAL</span>
            <p>{compact(data.goal, "앞으로 도전하고 싶은 목표", 95)}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function CompetitionSection({ data, focusTarget }: { data: PortfolioData; focusTarget: string }) {
  const layoutClass = data.competitionLayout === "카드 그리드"
    ? "journey-grid"
    : data.competitionLayout === "세로 목록"
      ? "journey-list"
      : "journey-timeline";

  return (
    <section
      className={`portfolio-page-section journey-section ${sectionClass(focusTarget, "competition")}`}
      data-preview-key="competition-section"
    >
      <div className="page-section-heading">
        <span>COMPETITION JOURNEY</span>
        <h3>결과보다 성장의 과정을 기록합니다</h3>
        <p>대회에서 맡은 역할, 잘한 점과 다음 도전을 위한 개선점을 함께 보여줍니다.</p>
      </div>
      <div className={`journey-preview ${layoutClass} ${focusClass(focusTarget, "competition-layout")}`} data-preview-key="competition-layout">
        {data.competitions.map((competition, index) => {
          const base = `competition-${competition.id}`;
          const roles = [...competition.roles, competition.roleOther].filter(Boolean);
          return (
            <article key={competition.id} className={focusTarget === base ? "preview-focus" : ""} data-preview-key={base}>
              <div className="timeline-dot">{index + 1}</div>
              <div className="journey-card">
                <div className="journey-card-head">
                  <span className={focusClass(focusTarget, `${base}-team`)} data-preview-key={`${base}-team`}>
                    {text(competition.team, `TEAM ${String(index + 1).padStart(2, "0")}`)}
                  </span>
                  <small>COMPETITION {String(index + 1).padStart(2, "0")}</small>
                </div>
                <h4 className={focusClass(focusTarget, `${base}-name`)} data-preview-key={`${base}-name`}>
                  {text(competition.name, "대회명이 여기에 표시됩니다")}
                </h4>
                <div className={`role-tags ${focusClass(focusTarget, `${base}-roles`)}`} data-preview-key={`${base}-roles`}>
                  {roles.length
                    ? roles.slice(0, 5).map((role) => <i key={role}>{role}</i>)
                    : <EmptyValue>자신의 역할</EmptyValue>}
                </div>
                <div className="growth-grid">
                  <div className={focusClass(focusTarget, `${base}-strengths`)} data-preview-key={`${base}-strengths`}>
                    <b>잘한 점</b>
                    <p>{compact(competition.strengths, "이번 대회에서 잘한 점이 표시됩니다.", 105)}</p>
                  </div>
                  <div className={focusClass(focusTarget, `${base}-improvements`)} data-preview-key={`${base}-improvements`}>
                    <b>다음에 보완할 점</b>
                    <p>{compact(competition.improvements, "아쉬웠던 점과 개선 방법이 표시됩니다.", 105)}</p>
                  </div>
                </div>
                <blockquote className={focusClass(focusTarget, `${base}-review`)} data-preview-key={`${base}-review`}>
                  “{compact(competition.review, "이번 대회의 한줄평이 이곳에 표시됩니다.", 110)}”
                </blockquote>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SkillsSection({ data, focusTarget }: { data: PortfolioData; focusTarget: string }) {
  const skills = [...data.skills, data.skillOther].filter(Boolean);
  const awards = data.awards.filter((award) => award.competition.trim() || award.result.trim());

  return (
    <section
      className={`portfolio-page-section skills-section ${sectionClass(focusTarget, "skills")} ${sectionClass(focusTarget, "award")}`}
      data-preview-key="skills-section"
    >
      <div className="page-section-heading"><span>SKILLS & AWARDS</span><h3>배운 기술과 값진 결과를 한눈에</h3></div>
      <div className={`skills-layout ${focusClass(focusTarget, "skills-layout")}`} data-preview-key="skills-layout">
        <div className={`skill-cloud ${focusClass(focusTarget, "skills-list")}`} data-preview-key="skills-list">
          {(skills.length ? skills : ["Robot Building", "Coding", "Problem Solving", "Teamwork"]).slice(0, 10).map((skill, index) => (
            <span key={`${skill}-${index}`} className={!skills.length ? "is-placeholder" : ""}><i>{String(index + 1).padStart(2, "0")}</i>{skill}</span>
          ))}
        </div>
        <div className="award-stack">
          <span className="award-icon">★</span>
          <h4>Certifications<br />& Awards</h4>
          {(awards.length ? awards : [{ id: "preview", competition: "대회명", result: "수상 결과" }]).slice(0, 4).map((award) => (
            <div
              key={award.id}
              className={`${!awards.length ? "is-placeholder" : ""} ${focusClass(focusTarget, `award-${award.id}`)}`}
              data-preview-key={`award-${award.id}`}
            >
              <b>{award.result}</b><small>{award.competition}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection({ data, focusTarget }: { data: PortfolioData; focusTarget: string }) {
  const columnsClass = data.portfolioColumns.includes("2열")
    ? "project-columns-2"
    : data.portfolioColumns.includes("4열")
      ? "project-columns-4"
      : "project-columns-3";

  return (
    <section
      className={`portfolio-page-section projects-section ${sectionClass(focusTarget, "project")}`}
      data-preview-key="projects-section"
    >
      <div className="page-section-heading"><span>SELECTED PROJECTS</span><h3>직접 만들고 코딩한 프로젝트</h3></div>
      <div className={`project-preview-grid ${columnsClass} ${focusClass(focusTarget, "projects-layout")}`} data-preview-key="projects-layout">
        {data.projects.map((project, index) => {
          const base = `project-${project.id}`;
          return (
            <article key={project.id} className={focusTarget === base ? "preview-focus" : ""} data-preview-key={base}>
              <div className={`project-art art-${(index % 3) + 1} ${focusClass(focusTarget, `${base}-image`)}`} data-preview-key={`${base}-image`}>
                <span>0{index + 1}</span><i /><i /><b />
                <small>{compact(project.imageDirection, "ROBOT PROJECT IMAGE", 30)}</small>
              </div>
              <div className="project-copy">
                <span className={focusClass(focusTarget, `${base}-technologies`)} data-preview-key={`${base}-technologies`}>
                  {text(project.technologies, "ROBOT · CODE")}
                </span>
                <h4 className={focusClass(focusTarget, base)}>{text(project.title, "프로젝트 제목")}</h4>
                <p className={focusClass(focusTarget, `${base}-description`)} data-preview-key={`${base}-description`}>
                  {compact(project.description, "프로젝트 설명이 이 카드에 실시간으로 표시됩니다.", 100)}
                </p>
                {data.projectAction !== "버튼 표시 안 함" && (
                  <b className={focusClass(focusTarget, "project-action")} data-preview-key="project-action">
                    {text(data.projectAction, "자세히 보기")} →
                  </b>
                )}
                {project.link && <small className={focusClass(focusTarget, `${base}-link`)} data-preview-key={`${base}-link`}>{project.link}</small>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function GenericSection({ title }: { title: string }) {
  return (
    <section className="portfolio-page-section generic-section">
      <div className="page-section-heading"><span>ADDITIONAL SECTION</span><h3>{title}</h3></div>
      <div className="generic-placeholder"><i /><div><b>{title}</b><span>선택한 영역이 최종 포트폴리오의 독립 섹션으로 생성됩니다.</span></div></div>
    </section>
  );
}

function ContactSection({ data, focusTarget }: { data: PortfolioData; focusTarget: string }) {
  return (
    <section className={`portfolio-page-section contact-section ${sectionClass(focusTarget, "contact")}`} data-preview-key="contact-section">
      <div><span>LET&apos;S CONNECT</span><h3>함께 이야기해요</h3><p>연락처와 포트폴리오 링크가 마지막 섹션에 정리됩니다.</p></div>
      <div className="contact-links">
        <span className={focusClass(focusTarget, "contact-email")} data-preview-key="contact-email">{text(data.email, "EMAIL")}</span>
        <span className={focusClass(focusTarget, "contact-github")} data-preview-key="contact-github">{text(data.githubUrl, "GITHUB")}</span>
        <span className={focusClass(focusTarget, "contact-web")} data-preview-key="contact-web">{text(data.portfolioUrl, "PORTFOLIO")}</span>
      </div>
    </section>
  );
}

export default function PortfolioPreview({ data, currentStep, focusTarget, focusRequest }: PreviewProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const navigation = [...data.sections, data.sectionOther].filter(Boolean).slice(0, 7);
  const lightTheme = data.theme === "라이트 테마";
  const annotation = annotationText(focusTarget);

  const scrollToTarget = useCallback((target: string, behavior: ScrollBehavior = "smooth") => {
    const scroller = scrollRef.current;
    const canvas = canvasRef.current;
    if (!scroller || !canvas) return;

    if (["brand", "language", "navigation", "design-system", "overview"].includes(target)) {
      scroller.scrollTo({ top: 0, behavior });
      return;
    }

    const fallbackKey = target.startsWith("competition-")
      ? "competition-section"
      : target.startsWith("award-") || target.startsWith("skills-")
        ? "skills-section"
        : target.startsWith("project-") || target === "projects-layout"
          ? "projects-section"
          : target.startsWith("contact-") || target === "footer"
            ? "footer"
            : target.startsWith("about-")
              ? "about-section"
              : "hero";
    const element = canvas.querySelector<HTMLElement>(`[data-preview-key="${target}"]`)
      ?? canvas.querySelector<HTMLElement>(`[data-preview-key="${fallbackKey}"]`);
    if (!element) return;

    const scrollRect = scroller.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const centeredTop = scroller.scrollTop
      + elementRect.top
      - scrollRect.top
      - Math.max(18, (scroller.clientHeight - Math.min(elementRect.height, scroller.clientHeight * .7)) / 2);
    scroller.scrollTo({ top: Math.max(0, centeredTop), behavior });
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => scrollToTarget(focusTarget));
    return () => window.cancelAnimationFrame(frame);
  }, [focusRequest, focusTarget, scrollToTarget]);

  return (
    <section className="preview-pane" aria-label="실시간 포트폴리오 미리보기">
      <header className="preview-pane-header">
        <div><span className="live-indicator"><i /> LIVE PREVIEW</span><h2>완성될 포트폴리오 미리보기</h2><p>입력 내용이 실제 페이지 순서대로 계속 쌓입니다.</p></div>
        <button type="button" className="preview-location" onClick={() => scrollToTarget(focusTarget)}>
          <span>현재 입력 위치 · STEP {String(currentStep).padStart(2, "0")}</span>
          <b>{locationLabel(focusTarget)}</b>
          <small>위치로 이동 ↘</small>
        </button>
      </header>

      <div className="browser-frame">
        <div className="browser-bar" aria-hidden="true"><div><i /><i /><i /></div><span>portfolio.preview</span><b>↗</b></div>
        <div
          ref={canvasRef}
          className={`portfolio-canvas ${lightTheme ? "light" : "dark"} ${focusTarget === "design-system" ? "design-focus" : ""}`}
          style={previewTheme(data)}
          data-preview-key="design-system"
        >
          <nav className={`portfolio-navigation ${focusClass(focusTarget, "navigation")}`} data-preview-key="navigation">
            <div className={`preview-brand ${focusClass(focusTarget, "brand")}`} data-preview-key="brand"><span>R</span><b>{text(data.logoName, "ROBOT.FOLIO")}</b></div>
            <div className="preview-menu">{(navigation.length ? navigation : ["About", "Competition Journey", "Skills", "Portfolio"]).map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div>
            <span className={`language-chip ${focusClass(focusTarget, "language")}`} data-preview-key="language">{text(data.language, "KR · EN")}</span>
          </nav>

          {annotation && <div className="preview-annotation" role="status"><b>적용 안내</b><span>{annotation}</span></div>}

          <div ref={scrollRef} className="portfolio-scroll" aria-label="누적된 포트폴리오 전체 페이지">
            <HeroSection data={data} focusTarget={focusTarget} />
            <AboutSection data={data} focusTarget={focusTarget} />
            {data.sections.includes("Experience") && <GenericSection title="Experience" />}
            <CompetitionSection data={data} focusTarget={focusTarget} />
            {(data.sections.includes("Skills") || data.sections.includes("Certifications & Awards") || data.skills.length > 0 || data.awards.some((award) => award.competition || award.result) || focusTarget.startsWith("skills") || focusTarget.startsWith("award")) && <SkillsSection data={data} focusTarget={focusTarget} />}
            {data.sections.includes("Education") && <GenericSection title="Education" />}
            {(data.sections.includes("Portfolio") || data.projects.some((project) => project.title || project.description || project.technologies) || focusTarget.startsWith("project") || focusTarget === "projects-layout") && <ProjectsSection data={data} focusTarget={focusTarget} />}
            {(data.sections.includes("Contact") || data.email || data.githubUrl || data.portfolioUrl || focusTarget.startsWith("contact-")) && <ContactSection data={data} focusTarget={focusTarget} />}
            <footer className={`preview-footer ${focusClass(focusTarget, "footer")}`} data-preview-key="footer">
              <span>{text(data.footerText, `© ${text(data.studentName, "Robot Maker")} Portfolio`)}</span>
              <div>{data.email ? <i>MAIL</i> : null}{data.githubUrl ? <i>GITHUB</i> : null}{data.portfolioUrl ? <i>WEB</i> : null}</div>
            </footer>
          </div>
        </div>
      </div>

      <nav className="preview-locator" aria-label="미리보기 위치 바로가기">
        {PREVIEW_NAVIGATION.map((item) => (
          <button key={item.key} type="button" onClick={() => scrollToTarget(item.key)} className={focusTarget.startsWith(item.key.split("-")[0]) ? "active" : ""}>
            <i />{item.label}
          </button>
        ))}
      </nav>
    </section>
  );
}
