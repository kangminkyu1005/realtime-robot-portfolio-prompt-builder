"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import {
  BACKGROUND_OPTIONS,
  EMPTY_AWARD,
  EMPTY_COMPETITION,
  EMPTY_PROJECT,
  INITIAL_DATA,
  MOOD_OPTIONS,
  ROLE_OPTIONS,
  SECTION_OPTIONS,
  SKILL_OPTIONS,
  STEPS,
  createStitchPrompt,
  stepComplete,
} from "./workflow";
import PortfolioPreview from "./portfolio-preview";
import type { PortfolioData } from "./workflow";

const STORAGE_KEY = "robot-portfolio-prompt-builder-v1";

const STEP_PREVIEW_TARGETS: Record<number, string> = {
  1: "brand",
  2: "about-purpose",
  3: "navigation",
  4: "hero-title",
  5: "competition-section",
  6: "skills-section",
  7: "projects-section",
  8: "design-system",
  9: "footer",
  10: "overview",
};

function uid(prefix: string) {
  const values = new Uint32Array(2);
  crypto.getRandomValues(values);
  return `${prefix}-${values[0].toString(16)}${values[1].toString(16)}`;
}

function ChoiceGroup({ label, value, options, onChange, onPreviewFocus }: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onPreviewFocus?: () => void;
}) {
  return (
    <div className="input-block" onFocusCapture={onPreviewFocus}>
      <span className="input-title">{label}<em>필수</em></span>
      <div className="choice-pills" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={value === option}
            className={value === option ? "selected" : ""}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiChoice({ label, values, options, other, onToggle, onOther, locked = [], onPreviewFocus }: {
  label: string;
  values: string[];
  options: string[];
  other: string;
  onToggle: (value: string) => void;
  onOther: (value: string) => void;
  locked?: string[];
  onPreviewFocus?: () => void;
}) {
  return (
    <div className="input-block wide" onFocusCapture={onPreviewFocus}>
      <span className="input-title">{label}<em>복수 선택</em></span>
      <div className="multi-pills">
        {options.map((option) => {
          const active = values.includes(option);
          const isLocked = locked.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={active ? "selected" : ""}
              onClick={() => !isLocked && onToggle(option)}
              aria-pressed={active}
            >
              {active ? "✓ " : ""}{option}{isLocked ? " · 필수" : ""}
            </button>
          );
        })}
      </div>
      <input
        className="other-input"
        value={other}
        onChange={(event) => onOther(event.target.value)}
        placeholder="기타 항목이 있다면 직접 입력하세요."
      />
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, multiline = false, optional = false, onPreviewFocus }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  optional?: boolean;
  onPreviewFocus?: () => void;
}) {
  return (
    <label className="input-block">
      <span className="input-title">{label}<em className={optional ? "optional" : ""}>{optional ? "선택" : "필수"}</em></span>
      {multiline
        ? <textarea rows={3} value={value} onFocus={onPreviewFocus} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
        : <input value={value} onFocus={onPreviewFocus} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />}
    </label>
  );
}

function SkillLevelEditor({ skills, levels, onChange, onPreviewFocus }: {
  skills: string[];
  levels: Record<string, number>;
  onChange: (skill: string, level: number) => void;
  onPreviewFocus?: () => void;
}) {
  return (
    <div className="input-block wide skill-level-editor" onFocusCapture={onPreviewFocus}>
      <span className="input-title">기술별 숙련도<em className="optional">1~5단계</em></span>
      <p>진행도에 표시할 실제 수준을 선택하세요. 선택하지 않은 기술은 기본 3단계로 표시됩니다.</p>
      {skills.length ? skills.map((skill) => {
        const level = levels[skill] ?? 3;
        return (
          <div className="skill-level-row" key={skill}>
            <b>{skill}</b>
            <div className="skill-level-buttons" role="radiogroup" aria-label={`${skill} 숙련도`}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={level === value}
                  className={level === value ? "selected" : ""}
                  onClick={() => onChange(skill, value)}
                >
                  {value}
                </button>
              ))}
            </div>
            <span>{level}단계</span>
          </div>
        );
      }) : <div className="info-note"><b>안내</b><span>6단계에서 기술과 역량을 먼저 선택하면 숙련도를 설정할 수 있어요.</span></div>}
    </div>
  );
}

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [data, setData] = useState<PortfolioData>(INITIAL_DATA);
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState("불러오는 중");
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewFocus, setPreviewFocus] = useState({ key: STEP_PREVIEW_TARGETS[1], request: 0 });
  const step = STEPS[current];
  const completedCount = STEPS.slice(0, 9).filter((item) => stepComplete(item.number, data)).length;
  const allComplete = completedCount === 9;
  const prompt = useMemo(() => createStitchPrompt(data), [data]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<PortfolioData>;
          setData({
            ...INITIAL_DATA,
            ...parsed,
            competitions: parsed.competitions?.length ? parsed.competitions : INITIAL_DATA.competitions,
            awards: parsed.awards?.length ? parsed.awards : INITIAL_DATA.awards,
            projects: parsed.projects?.length ? parsed.projects : INITIAL_DATA.projects,
            skillLevels: parsed.skillLevels ?? INITIAL_DATA.skillLevels,
          });
        }
      } catch {
        // Ignore unavailable or malformed device-local data.
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setSaveStatus("이 브라우저에 자동 저장됨");
      } catch {
        setSaveStatus("자동 저장을 사용할 수 없음");
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [data, hydrated]);

  useEffect(() => {
    if (!showPrompt) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setShowPrompt(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showPrompt]);

  const focusPreview = (key: string) => setPreviewFocus((previous) => ({ key, request: previous.request + 1 }));
  const update = <K extends keyof PortfolioData>(key: K, value: PortfolioData[K]) => setData((previous) => ({ ...previous, [key]: value }));
  const toggle = (key: "sections" | "skills" | "moods" | "backgrounds", value: string) => {
    if (key === "sections" && value === "Competition Journey") return;
    if (key === "backgrounds") {
      if (value === "배경 효과 없음") {
        update("backgrounds", data.backgrounds.includes(value) ? [] : [value]);
        return;
      }
      const activeBackgrounds = data.backgrounds.filter((item) => item !== "배경 효과 없음");
      update("backgrounds", activeBackgrounds.includes(value)
        ? activeBackgrounds.filter((item) => item !== value)
        : [...activeBackgrounds, value]);
      return;
    }
    update(key, data[key].includes(value) ? data[key].filter((item) => item !== value) : [...data[key], value]);
  };
  const selectStep = (index: number) => {
    const nextIndex = Math.min(STEPS.length - 1, Math.max(0, index));
    setCurrent(nextIndex);
    focusPreview(STEP_PREVIEW_TARGETS[STEPS[nextIndex].number]);
  };
  const move = (direction: number) => selectStep(current + direction);
  const next = () => current === 9 ? allComplete && setShowPrompt(true) : stepComplete(step.number, data) && move(1);
  const updateCompetition = (id: string, key: string, value: string | string[]) => update("competitions", data.competitions.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const updateAward = (id: string, key: string, value: string) => update("awards", data.awards.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const updateProject = (id: string, key: string, value: string) => update("projects", data.projects.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const updateSkillLevel = (skill: string, level: number) => update("skillLevels", { ...data.skillLevels, [skill]: level });
  const selectedSkills = [...data.skills, data.skillOther.trim()].filter(Boolean);

  const addCompetition = () => {
    const id = uid("competition");
    update("competitions", [...data.competitions, { ...EMPTY_COMPETITION, id }]);
    focusPreview(`competition-${id}`);
  };
  const addAward = () => {
    const id = uid("award");
    update("awards", [...data.awards, { ...EMPTY_AWARD, id }]);
    focusPreview(`award-${id}`);
  };
  const addProject = () => {
    const id = uid("project");
    update("projects", [...data.projects, { ...EMPTY_PROJECT, id }]);
    focusPreview(`project-${id}`);
  };

  const reset = () => {
    if (!window.confirm("작성한 내용을 모두 지울까요? 삭제한 내용은 되돌릴 수 없습니다.")) return;
    setData(INITIAL_DATA);
    window.localStorage.removeItem(STORAGE_KEY);
    selectStep(0);
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const renderStep = () => {
    switch (step.number) {
      case 1:
        return <div className="form-grid">
          <TextInput label="학생 이름" value={data.studentName} onChange={(value) => update("studentName", value)} onPreviewFocus={() => focusPreview("student-name")} placeholder="예: 강건형" />
          <TextInput label="포트폴리오 이름" value={data.portfolioName} onChange={(value) => update("portfolioName", value)} onPreviewFocus={() => focusPreview("portfolio-name")} placeholder="예: GunHyung's Robot Portfolio" />
          <TextInput label="웹앱 로고 이름" value={data.logoName} onChange={(value) => update("logoName", value)} onPreviewFocus={() => focusPreview("brand")} placeholder="예: GunHyung's Portfolio" />
          <ChoiceGroup label="사용 언어" value={data.language} options={["한국어", "영어", "한국어와 영어 혼합"]} onChange={(value) => update("language", value)} onPreviewFocus={() => focusPreview("language")} />
        </div>;
      case 2:
        return <div className="form-grid">
          <TextInput label="웹앱의 목적" value={data.purpose} onChange={(value) => update("purpose", value)} onPreviewFocus={() => focusPreview("about-purpose")} placeholder="예: 로봇과 코딩 프로젝트를 통해 배우고 만든 결과물을 보여주는 포트폴리오" multiline />
          <TextInput label="주요 사용자" value={data.audience} onChange={(value) => update("audience", value)} onPreviewFocus={() => focusPreview("about-audience")} placeholder="예: 친구, 선생님, 대회 관계자와 가족" multiline />
          <TextInput label="포트폴리오 소개" value={data.portfolioIntro} onChange={(value) => update("portfolioIntro", value)} onPreviewFocus={() => focusPreview("about-intro")} placeholder="예: 결과뿐 아니라 시도하고 실패하며 개선한 성장 과정을 보여줍니다." multiline />
          <ChoiceGroup label="입력 문구 처리" value={data.textPolicy} options={["입력한 문구를 그대로 사용", "맞춤법만 수정 허용", "자연스럽게 다듬기"]} onChange={(value) => update("textPolicy", value)} onPreviewFocus={() => focusPreview("text-policy")} />
        </div>;
      case 3:
        return <div className="form-grid single">
          <MultiChoice label="포트폴리오에 표시할 영역" values={data.sections} options={SECTION_OPTIONS} other={data.sectionOther} onToggle={(value) => toggle("sections", value)} onOther={(value) => update("sectionOther", value)} onPreviewFocus={() => focusPreview("navigation")} locked={["Competition Journey"]} />
          <div className="info-note"><b>자동 적용</b><span>선택한 영역만 메뉴와 본문에 포함되고, Competition Journey는 대회 성장 기록을 위해 항상 포함됩니다.</span></div>
        </div>;
      case 4:
        return <div className="form-grid">
          <TextInput label="첫 화면 제목" value={data.heroTitle} onChange={(value) => update("heroTitle", value)} onPreviewFocus={() => focusPreview("hero-title")} placeholder="예: My Robot and Code Portfolio" />
          <TextInput label="첫 화면 소개 문장" value={data.heroIntro} onChange={(value) => update("heroIntro", value)} onPreviewFocus={() => focusPreview("hero-intro")} placeholder="예: It's my journey with robots and code" />
          <TextInput label="자기소개" value={data.bio} onChange={(value) => update("bio", value)} onPreviewFocus={() => focusPreview("about-bio")} placeholder="나의 로봇·코딩 경험을 소개해 주세요." multiline />
          <TextInput label="앞으로의 목표" value={data.goal} onChange={(value) => update("goal", value)} onPreviewFocus={() => focusPreview("about-goal")} placeholder="앞으로 도전하고 싶은 프로젝트와 키우고 싶은 능력을 적어 주세요." multiline />
        </div>;
      case 5:
        return <div className="record-list">
          {data.competitions.map((competition, index) => {
            const base = `competition-${competition.id}`;
            return <article className="record-card" key={competition.id}>
              <header><div><span>COMPETITION {String(index + 1).padStart(2, "0")}</span><strong>대회 기록 {index + 1}</strong></div>{data.competitions.length > 1 && <button type="button" onClick={() => { update("competitions", data.competitions.filter((item) => item.id !== competition.id)); focusPreview("competition-section"); }}>삭제</button>}</header>
              <div className="record-fields">
                <TextInput label="대회명" value={competition.name} onChange={(value) => updateCompetition(competition.id, "name", value)} onPreviewFocus={() => focusPreview(`${base}-name`)} placeholder="예: 2026 RoboCup Korea Open CoSpace U12" />
                <TextInput label="팀명" value={competition.team} onChange={(value) => updateCompetition(competition.id, "team", value)} onPreviewFocus={() => focusPreview(`${base}-team`)} placeholder="예: K.F.C.NOVA" />
                <MultiChoice label="자신의 역할" values={competition.roles} options={ROLE_OPTIONS} other={competition.roleOther} onToggle={(value) => updateCompetition(competition.id, "roles", competition.roles.includes(value) ? competition.roles.filter((role) => role !== value) : [...competition.roles, value])} onOther={(value) => updateCompetition(competition.id, "roleOther", value)} onPreviewFocus={() => focusPreview(`${base}-roles`)} />
                <TextInput label="잘한 점" value={competition.strengths} onChange={(value) => updateCompetition(competition.id, "strengths", value)} onPreviewFocus={() => focusPreview(`${base}-strengths`)} placeholder="이번 대회에서 잘했다고 생각하는 점을 적어 주세요." multiline />
                <TextInput label="아쉬운 점 및 보완할 점" value={competition.improvements} onChange={(value) => updateCompetition(competition.id, "improvements", value)} onPreviewFocus={() => focusPreview(`${base}-improvements`)} placeholder="아쉬웠던 점과 다음 대회를 위해 개선할 방법을 적어 주세요." multiline />
                <TextInput label="이번 대회 한줄평" value={competition.review} onChange={(value) => updateCompetition(competition.id, "review", value)} onPreviewFocus={() => focusPreview(`${base}-review`)} placeholder="예: 끝까지 포기하지 않고 팀과 함께 성장한 대회였다." />
              </div>
            </article>;
          })}
          <button type="button" className="add-record" onClick={addCompetition}>＋ 다른 대회 기록 추가</button>
        </div>;
      case 6:
        return <div className="split-editor">
          <MultiChoice label="기술과 역량" values={data.skills} options={SKILL_OPTIONS} other={data.skillOther} onToggle={(value) => toggle("skills", value)} onOther={(value) => update("skillOther", value)} onPreviewFocus={() => focusPreview("skills-list")} />
          <div className="compact-records"><span className="input-title">수상 내역<em className="optional">선택</em></span>
            {data.awards.map((award, index) => <div className="compact-row" key={award.id} onFocusCapture={() => focusPreview(`award-${award.id}`)}>
              <input value={award.competition} onChange={(event) => updateAward(award.id, "competition", event.target.value)} placeholder={`대회명 ${index + 1}`} />
              <input value={award.result} onChange={(event) => updateAward(award.id, "result", event.target.value)} placeholder="예: 1st Place, Influencer Award" />
              {data.awards.length > 1 && <button type="button" onClick={() => update("awards", data.awards.filter((item) => item.id !== award.id))}>×</button>}
            </div>)}
            <button type="button" className="small-add" onClick={addAward}>＋ 수상 내역 추가</button>
          </div>
        </div>;
      case 7:
        return <div className="record-list">
          {data.projects.map((project, index) => {
            const base = `project-${project.id}`;
            return <article className="record-card" key={project.id}>
              <header><div><span>PROJECT {String(index + 1).padStart(2, "0")}</span><strong>프로젝트 {index + 1}</strong></div>{data.projects.length > 1 && <button type="button" onClick={() => { update("projects", data.projects.filter((item) => item.id !== project.id)); focusPreview("projects-section"); }}>삭제</button>}</header>
              <div className="record-fields project-fields">
                <TextInput label="프로젝트 제목" value={project.title} onChange={(value) => updateProject(project.id, "title", value)} onPreviewFocus={() => focusPreview(base)} placeholder="예: Line Tracing Robot" />
                <TextInput label="사용 기술" value={project.technologies} onChange={(value) => updateProject(project.id, "technologies", value)} onPreviewFocus={() => focusPreview(`${base}-technologies`)} placeholder="예: Color Sensor, Motor Control, Block Coding" />
                <TextInput label="프로젝트 설명" value={project.description} onChange={(value) => updateProject(project.id, "description", value)} onPreviewFocus={() => focusPreview(`${base}-description`)} placeholder="무엇을 만들고 어떻게 작동하는지 설명해 주세요." multiline />
                <TextInput label="이미지 방향" value={project.imageDirection} onChange={(value) => updateProject(project.id, "imageDirection", value)} onPreviewFocus={() => focusPreview(`${base}-image`)} placeholder="예: 검은 선을 따라가는 로봇 사진 영역" optional />
                <TextInput label="프로젝트 링크" value={project.link} onChange={(value) => updateProject(project.id, "link", value)} onPreviewFocus={() => focusPreview(`${base}-link`)} placeholder="GitHub, 웹앱 또는 영상 주소" optional />
              </div>
            </article>;
          })}
          <button type="button" className="add-record" onClick={addProject}>＋ 다른 프로젝트 추가</button>
        </div>;
      case 8:
        return <div className="form-grid design-grid">
          <ChoiceGroup label="화면 테마" value={data.theme} options={["다크 테마", "라이트 테마", "시스템 설정에 따라 변경"]} onChange={(value) => update("theme", value)} onPreviewFocus={() => focusPreview("design-system")} />
          <ChoiceGroup label="색상 조합" value={data.palette} options={["네온 블루 + 다크 네이비", "민트 + 네이비", "퍼플 + 블루", "레드 + 블랙", "직접 색상 입력"]} onChange={(value) => update("palette", value)} onPreviewFocus={() => focusPreview("design-system")} />
          {data.palette === "직접 색상 입력" && <TextInput label="사용할 색상" value={data.customColors} onChange={(value) => update("customColors", value)} onPreviewFocus={() => focusPreview("design-system")} placeholder="예: #00C2FF, #071426, #FFFFFF" />}
          <MultiChoice label="디자인 분위기" values={data.moods} options={MOOD_OPTIONS} other={data.moodOther} onToggle={(value) => toggle("moods", value)} onOther={(value) => update("moodOther", value)} onPreviewFocus={() => focusPreview("design-system")} />
          <MultiChoice label="배경 효과" values={data.backgrounds} options={BACKGROUND_OPTIONS} other={data.backgroundOther} onToggle={(value) => toggle("backgrounds", value)} onOther={(value) => update("backgroundOther", value)} onPreviewFocus={() => focusPreview("design-system")} />
        </div>;
      case 9:
        return <div className="form-grid layout-grid">
          <ChoiceGroup label="대회 기록 표시" value={data.competitionLayout} options={["타임라인", "카드 그리드", "세로 목록"]} onChange={(value) => update("competitionLayout", value)} onPreviewFocus={() => focusPreview("competition-layout")} />
          <ChoiceGroup label="Skills 표시" value={data.skillLayout} options={["아이콘 카드와 배지", "태그", "진행도 표시", "단순 목록"]} onChange={(value) => update("skillLayout", value)} onPreviewFocus={() => focusPreview("skills-layout")} />
          {data.skillLayout === "진행도 표시" && <SkillLevelEditor skills={selectedSkills} levels={data.skillLevels} onChange={updateSkillLevel} onPreviewFocus={() => focusPreview("skills-layout")} />}
          <ChoiceGroup label="프로젝트 카드 배치" value={data.portfolioColumns} options={["데스크톱 2열 · 모바일 1열", "데스크톱 3열 · 모바일 1열", "데스크톱 4열 · 모바일 2열"]} onChange={(value) => update("portfolioColumns", value)} onPreviewFocus={() => focusPreview("projects-layout")} />
          <ChoiceGroup label="자세히 보기 동작" value={data.projectAction} options={["상세 팝업 열기", "별도 페이지로 이동", "외부 링크 열기", "버튼 표시 안 함"]} onChange={(value) => update("projectAction", value)} onPreviewFocus={() => focusPreview("project-action")} />
          <TextInput label="Footer 문구" value={data.footerText} onChange={(value) => update("footerText", value)} onPreviewFocus={() => focusPreview("footer")} placeholder="예: © 2026 Minjun's Portfolio. All rights reserved." />
          <TextInput label="이메일" value={data.email} onChange={(value) => update("email", value)} onPreviewFocus={() => focusPreview("contact-email")} placeholder="표시할 이메일" optional />
          <TextInput label="GitHub 주소" value={data.githubUrl} onChange={(value) => update("githubUrl", value)} onPreviewFocus={() => focusPreview("contact-github")} placeholder="https://github.com/..." optional />
          <TextInput label="포트폴리오 주소" value={data.portfolioUrl} onChange={(value) => update("portfolioUrl", value)} onPreviewFocus={() => focusPreview("contact-web")} placeholder="https://..." optional />
        </div>;
      default:
        return <div className="generate-summary">
          <div className="summary-count"><b>{completedCount}</b><span>/ 9단계<br />작성 완료</span></div>
          <div><strong>{allComplete ? "Stitch 프롬프트를 만들 준비가 됐어요!" : "아직 작성하지 않은 단계가 있어요."}</strong><p>{allComplete ? `${data.competitions.length}개의 대회 기록과 ${data.projects.length}개의 프로젝트가 한 페이지에 누적되었습니다.` : "완료하지 않은 단계를 선택해 필수 내용을 입력해 주세요."}</p></div>
        </div>;
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-row">
          <Image className="playwell-logo" src="/playwell-logo.png" alt="playwell" width={151} height={40} priority unoptimized />
          <div className="brand-divider" />
          <div><p className="eyebrow">ROBOT PORTFOLIO · GOOGLE STITCH</p><h1>포트폴리오 프롬프트 빌더</h1></div>
        </div>
        <div className="header-center"><span>입력</span><i>→</i><b>실시간 누적 미리보기</b></div>
        <div className="header-actions">
          <span className="save-pill"><span className="save-dot" />{saveStatus}</span>
          <button type="button" className="reset-button" onClick={reset}>처음부터</button>
          <div className="top-progress" aria-label={`9단계 중 ${completedCount}단계 완료`}><span className="progress-copy"><b>{completedCount}</b> / 9 작성</span><div className="progress-track"><span style={{ width: `${(completedCount / 9) * 100}%` }} /></div></div>
        </div>
      </header>

      <section className="split-workspace" aria-label="포트폴리오 프롬프트 작성 화면">
        <aside className={`input-pane ${step.color}`} aria-live="polite">
          <header className="input-pane-header">
            <div className="step-title-row"><span className="panel-icon" aria-hidden="true">{step.icon}</span><div><p>{step.phase} · STEP {String(step.number).padStart(2, "0")}</p><h2>{step.title}</h2></div></div>
            <span className={`step-state ${stepComplete(step.number, data) ? "complete" : ""}`}>{stepComplete(step.number, data) ? "✓ 작성 완료" : "작성 중"}</span>
          </header>

          <nav className="step-switcher" aria-label="작성 단계 바로가기">
            {STEPS.map((item, index) => {
              const complete = stepComplete(item.number, data);
              return <button key={item.number} type="button" className={`${index === current ? "active" : ""} ${complete ? "done" : ""}`} onClick={() => selectStep(index)} aria-current={index === current ? "step" : undefined} aria-label={`${item.number}단계 ${item.title}로 이동`}><span>{complete ? "✓" : item.number}</span><small>{item.phase}</small></button>;
            })}
          </nav>

          <div className="step-tip"><b>TIP</b><span>{step.tip}</span></div>
          <div className="form-scroll">{renderStep()}</div>

          <nav className="panel-nav" aria-label="단계 이동">
            <button type="button" onClick={() => move(-1)} disabled={current === 0}>← 이전 단계</button>
            <span className="nav-position">{String(current + 1).padStart(2, "0")} <i>/</i> 10</span>
            <button type="button" className="next-button" onClick={next} disabled={current < 9 ? !stepComplete(step.number, data) : !allComplete}>{current === 9 ? "최종 프롬프트 보기" : "저장하고 다음"} →</button>
            {current < 9 && !stepComplete(step.number, data) && <span className="nav-hint">필수 항목을 입력하면 다음 단계로 이동할 수 있어요.</span>}
          </nav>
        </aside>

        <PortfolioPreview data={data} currentStep={step.number} focusTarget={previewFocus.key} focusRequest={previewFocus.request} />
      </section>

      {showPrompt && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setShowPrompt(false)}><section className="prompt-modal" role="dialog" aria-modal="true" aria-labelledby="prompt-title"><header className="modal-header"><div><span className="stitch-badge">✦ GOOGLE STITCH READY</span><h2 id="prompt-title">로봇 포트폴리오 프롬프트가 완성됐어요</h2><p>학생이 작성한 문구와 대회 성장 기록을 포함한 최종 디자인 명세입니다.</p></div><button type="button" className="close-button" onClick={() => setShowPrompt(false)} aria-label="프롬프트 창 닫기">×</button></header><pre className="prompt-output">{prompt}</pre><footer className="modal-actions"><span>작성 내용은 이 브라우저에만 저장되며 코드나 GitHub에는 포함되지 않습니다.</span><div><button type="button" className="copy-button" onClick={copyPrompt}>{copied ? "✓ 복사 완료" : "프롬프트 복사"}</button><a href="https://stitch.withgoogle.com/" target="_blank" rel="noreferrer">Google Stitch 열기 ↗</a></div></footer></section></div>}
    </main>
  );
}
