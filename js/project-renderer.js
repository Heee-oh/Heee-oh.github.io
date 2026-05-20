(function () {
    const emptyProblem = {
        title: '',
        situation: '',
        task: '',
        action: '',
        result: '',
    };

    const defaultProject = {
        title: '',
        subtitle: '',
        iconClass: 'fa-solid fa-code',
        imageUrl: '',
        imageLabel: 'PROJECT IMAGE',
        overviewTitle: 'Project Overview',
        overviewText: '',
        diagrams: [],
        roles: [],
        problems: [],
        techStack: [],
        sourceUrl: '',
    };

    function normalizeProject(project) {
        const source = project || {};
        const { diagramTitle, diagramSteps, problem, ...rest } = source;
        const diagrams = Array.isArray(source.diagrams)
            ? source.diagrams
            : legacyDiagram(source);
        const problems = Array.isArray(source.problems)
            ? source.problems
            : legacyProblem(source);

        return {
            ...defaultProject,
            ...rest,
            diagrams: diagrams.map((diagram) => ({
                title: diagram.title || '',
                imageUrl: diagram.imageUrl || '',
                imageLabel: diagram.imageLabel || 'DIAGRAM IMAGE',
            })),
            roles: Array.isArray(source.roles) ? source.roles : [],
            problems: problems.map((problem) => ({
                ...emptyProblem,
                ...problem,
            })),
            techStack: Array.isArray(source.techStack) ? source.techStack : [],
        };
    }

    function legacyDiagram(project) {
        if (!project.diagramTitle && !Array.isArray(project.diagramSteps)) return [];
        return [{
            title: project.diagramTitle || 'DIAGRAM',
            imageUrl: '',
            imageLabel: 'DIAGRAM IMAGE',
        }];
    }

    function legacyProblem(project) {
        if (!project.problem) return [];
        return [project.problem];
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderFigure({ imageUrl, imageLabel, altText, emptyLabel }) {
        if (imageUrl) {
            return `
                <figure class="aspect-[16/9] rounded-lg border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/20 overflow-hidden">
                    <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(altText)}" class="w-full h-full object-cover">
                </figure>
            `;
        }

        return `
            <figure class="aspect-[16/9] rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20 flex flex-col items-center justify-center gap-2 text-zinc-400">
                <i class="fa-regular fa-image text-xl"></i>
                <figcaption class="text-[10px] font-mono">${escapeHtml(imageLabel || emptyLabel)}</figcaption>
            </figure>
        `;
    }

    function renderDiagrams(project) {
        if (!project.diagrams.length) return '';

        return `
            <div class="space-y-4">
                ${project.diagrams.map((diagram) => `
                    <div class="space-y-2">
                        <h5 class="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">${escapeHtml(diagram.title)}</h5>
                        ${renderFigure({
                            imageUrl: diagram.imageUrl,
                            imageLabel: diagram.imageLabel,
                            altText: `${project.title} ${diagram.title}`,
                            emptyLabel: 'DIAGRAM IMAGE',
                        })}
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderStarRow(label, value, isResult) {
        return `
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs ${label === 'Situation' ? '' : 'pt-3 border-t border-zinc-100 dark:border-zinc-900/60'}">
                <div class="sm:col-span-3 font-mono font-bold text-zinc-400">${label}</div>
                <div class="sm:col-span-9 ${isResult ? 'font-medium text-emerald-600 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'}">${escapeHtml(value)}</div>
            </div>
        `;
    }

    function renderProblems(project) {
        if (!project.problems.length) return '';

        return `
            <div class="space-y-3">
                <h4 class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Problem Solving</h4>
                <div class="space-y-4">
                    ${project.problems.map((problem) => `
                        <div class="rounded-lg border border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10 p-4 space-y-4">
                            <h5 class="text-sm font-bold text-zinc-900 dark:text-white">${escapeHtml(problem.title)}</h5>
                            <div class="space-y-3">
                                ${renderStarRow('Situation', problem.situation)}
                                ${renderStarRow('Task', problem.task)}
                                ${renderStarRow('Action', problem.action)}
                                ${renderStarRow('Result', problem.result, true)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function renderProject(projectInput) {
        const project = normalizeProject(projectInput);

        return `
            <article class="space-y-8">
                <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                    <div class="space-y-1">
                        <h3 class="text-lg font-bold text-zinc-900 dark:text-white">${escapeHtml(project.title)}</h3>
                        <p class="text-xs font-mono text-zinc-500">${escapeHtml(project.subtitle)}</p>
                    </div>
                    <div class="w-9 h-9 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-center text-emerald-500" aria-label="${escapeHtml(project.title)} 프로젝트 아이콘">
                        <i class="${escapeHtml(project.iconClass)} text-sm"></i>
                    </div>
                </div>

                ${renderFigure({
                    imageUrl: project.imageUrl,
                    imageLabel: project.imageLabel,
                    altText: `${project.title} 대표 이미지`,
                    emptyLabel: 'PROJECT IMAGE',
                })}

                <div class="space-y-4">
                    <h4 class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">${escapeHtml(project.overviewTitle)}</h4>
                    <p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">${escapeHtml(project.overviewText)}</p>
                    ${renderDiagrams(project)}
                </div>

                <div class="space-y-3">
                    <h4 class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">My Role</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        ${project.roles.map((role) => `<div class="rounded-lg border border-zinc-100 dark:border-zinc-900 p-3">${escapeHtml(role)}</div>`).join('')}
                    </div>
                </div>

                ${renderProblems(project)}

                <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div class="flex flex-wrap gap-1">
                        ${project.techStack.map((tech) => `<span class="text-[10px] font-mono px-2 py-0.5 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-100 dark:border-zinc-800">${escapeHtml(tech)}</span>`).join('')}
                    </div>
                    ${project.sourceUrl ? `
                        <a href="${escapeHtml(project.sourceUrl)}" target="_blank" class="text-[11px] font-mono text-zinc-500 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1">
                            <i class="fa-brands fa-github"></i> Source Code
                        </a>
                    ` : ''}
                </div>
            </article>
        `;
    }

    function renderProjects(projects, target) {
        if (!target) return;
        target.innerHTML = projects.map(renderProject).join('');
    }

    window.PortfolioProjects = {
        normalizeProject,
        renderProject,
        renderProjects,
    };
})();
