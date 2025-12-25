/**
 * Resume Templates
 * 
 * Predefined placeholder content to help users get started.
 */

export const RESUME_TEMPLATES = {
    modern: {
        name: "Modern Professional",
        content: `[NAME]
[CITY, STATE] | [PHONE] | [EMAIL]
[LINKEDIN URL] | [PORTFOLIO URL]

SUMMARY
Dedicated and results-oriented Professional with [X] years of experience in [INDUSTRY]. Proven track record of [KEY ACHIEVEMENT #1] and [KEY ACHIEVEMENT #2]. Skilled in [SKILL #1], [SKILL #2], and [SKILL #3].

EXPERIENCE
[MOST RECENT JOB TITLE] | [COMPANY NAME] | [DATE STARTED] – [PRESENT]
- [Responsibility/Achievement #1: Use action verbs and metrics if possible]
- [Responsibility/Achievement #2: Leading teams of X to accomplish Y]
- [Responsibility/Achievement #3: Improved efficiency by X% through Z]

[PREVIOUS JOB TITLE] | [COMPANY NAME] | [MONTH/YEAR] – [MONTH/YEAR]
- [Responsibility/Achievement #1: Developed and implemented Z]
- [Responsibility/Achievement #2: Collaborated with cross-functional teams]

EDUCATION
[DEGREE NAME] | [INSTITUTION NAME] | [YEAR GRADUATED]
[Optional: Relevant coursework, Honors, GPA if > 3.5]

SKILLS
- Technical: [Skill A, Skill B, Skill C]
- Soft Skills: [Skill D, Skill E, Skill F]
- Languages: [Language A, Language B]`
    },
    classic: {
        name: "Classic Corporate",
        content: `NAME
Address: [STREET ADDRESS, CITY, STATE, ZIP]
Phone: [PHONE NUMBER]
Email: [EMAIL ADDRESS]

OBJECTIVE
To secure a challenging position as a [JOB TITLE] where I can utilize my extensive experience in [SKILL/FIELD] to contribute to the growth and success of [COMPANY].

PROFESSIONAL EXPERIENCE

[COMPANY NAME], [LOCATION]
[JOB TITLE], [START DATE] – [END DATE]
* [Key responsibility or major project completed]
* [Quantitative result achieved through your work]
* [Mention a specific tool or methodology used]

[PREVIOUS COMPANY NAME], [LOCATION]
[PREVIOUS JOB TITLE], [START DATE] – [END DATE]
* [Managed a budget or team of a certain size]
* [Received recognition or award for performance]

EDUCATION

[INSTITUTION NAME], [LOCATION]
[DEGREE], [GRADUATION YEAR]

SKILLS & CERTIFICATIONS
* [Specialized Skill #1]
* [Professional Certification #1]
* [Software Proficiency #1]`
    },
    minimal: {
        name: "Minimalist Tech",
        content: `[NAME]
[EMAIL] · [PHONE] · [GITHUB] · [LINKEDIN]

PROJECTS
[Project Name] | [Tech Stack] | [Link]
- [Impactful bullet point #1 about the project]
- [Impactful bullet point #2 about the tech used]

[Project Name] | [Tech Stack] | [Link]
- [Impactful bullet point #1 about the project]

EXPERIENCE
[Job Title] @ [Company] | [Dates]
- [Concise bullet point #1]
- [Concise bullet point #2]

EDUCATION
[University Name] | [Degree] | [Year]

SKILLS
[Languages]: [A, B, C]
[Tools]: [D, E, F]`
    }
};

export type TemplateId = keyof typeof RESUME_TEMPLATES;
