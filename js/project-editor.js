const draftStorageKey = 'portfolioProjectsDraft';
const themeIcons = {
    dark: 'theme-toggle-icon fa-solid fa-sun text-xs sm:text-sm',
    light: 'theme-toggle-icon fa-solid fa-moon text-xs sm:text-sm',
};

let projects = [];
let selectedIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
    initThemeToggle();
    await loadProjects();
    bindActions();
    renderEditor();
});

function createEmptyDiagram() {
    return {
        title: '다이어그램 이름',
        imageUrl: '',
        imageLabel: 'DIAGRAM IMAGE',
    };
}

function createEmptyProblem() {
    return {
        title: '문제 소제목',
        situation: '',
        task: '',
        action: '',
        result: '',
    };
}

function createEmptyProject() {
    return {
        title: '새 프로젝트',
        subtitle: 'Project Subtitle',
        iconClass: 'fa-solid fa-code',
        imageUrl: '',
        imageLabel: 'PROJECT IMAGE',
        overviewTitle: 'Project Overview',
        overviewText: '',
        diagrams: [createEmptyDiagram()],
        roles: ['담당한 기능을 입력하세요'],
        problems: [createEmptyProblem()],
        techStack: ['Java', 'Spring Boot'],
        sourceUrl: '',
    };
}

async function loadProjects() {
    const draft = localStorage.getItem(draftStorageKey);

    if (draft) {
        projects = normalizeProjects(JSON.parse(draft));
        setStatus('draft loaded');
        return;
    }

    const response = await fetch('./projects.json', { cache: 'no-cache' });
    projects = normalizeProjects(await response.json());
    setStatus('projects.json loaded');
}

function normalizeProjects(items) {
    return (Array.isArray(items) ? items : [createEmptyProject()])
        .map((project) => window.PortfolioProjects.normalizeProject(project));
}

function bindActions() {
    document.getElementById('add-project').addEventListener('click', () => {
        projects.push(createEmptyProject());
        selectedIndex = projects.length - 1;
        persistDraft();
        renderEditor();
    });

    document.getElementById('export-json').addEventListener('click', exportJson);
    document.getElementById('import-json').addEventListener('change', importJson);
    document.getElementById('reset-draft').addEventListener('click', async () => {
        localStorage.removeItem(draftStorageKey);
        selectedIndex = 0;
        await loadProjects();
        renderEditor();
    });
}

function renderEditor() {
    if (!projects.length) {
        projects = [createEmptyProject()];
        selectedIndex = 0;
    }

    projects = normalizeProjects(projects);
    selectedIndex = Math.min(selectedIndex, projects.length - 1);
    renderTabs();
    renderForm();
    renderPreview();
}

function renderTabs() {
    const tabs = document.getElementById('project-tabs');
    tabs.innerHTML = projects.map((project, index) => {
        const isActive = index === selectedIndex;
        return `
            <button type="button" data-index="${index}" class="project-tab w-full text-left p-3 rounded-lg border ${isActive ? 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20' : 'border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/40'}">
                <span class="block text-xs font-bold text-zinc-900 dark:text-white truncate">${escapeHtml(project.title || 'Untitled')}</span>
                <span class="block text-[10px] font-mono text-zinc-400 truncate mt-0.5">${escapeHtml(project.subtitle || 'No subtitle')}</span>
            </button>
        `;
    }).join('');

    document.querySelectorAll('.project-tab').forEach((button) => {
        button.addEventListener('click', () => {
            selectedIndex = Number(button.dataset.index);
            renderEditor();
        });
    });
}

function renderForm() {
    const project = projects[selectedIndex];
    const form = document.getElementById('project-form');

    form.innerHTML = `
        ${section('Basic', `
            ${input('title', 'Project Name', project.title)}
            ${input('subtitle', 'Subtitle', project.subtitle)}
            ${input('iconClass', 'Font Awesome Icon Class', project.iconClass)}
            ${input('sourceUrl', 'Source URL', project.sourceUrl)}
        `)}

        ${section('Project Image', `
            ${input('imageUrl', 'Image URL or Path', project.imageUrl)}
            ${input('imageLabel', 'Placeholder Label', project.imageLabel)}
            ${fileInput('project-image-file', 'Image File')}
        `)}

        ${section('Overview', `
            ${input('overviewTitle', 'Section Title', project.overviewTitle)}
            ${textarea('overviewText', 'Detail', project.overviewText, 4)}
        `)}

        ${section('Diagrams', `
            <div class="space-y-5">
                ${project.diagrams.map(renderDiagramForm).join('')}
                <button type="button" id="add-diagram" class="api-btn inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <i class="fa-solid fa-plus text-[10px]"></i>
                    Add Diagram
                </button>
            </div>
        `)}

        ${section('My Role', `
            ${textarea('roles', 'Roles', toLines(project.roles), 5)}
        `)}

        ${section('Problem Solving', `
            <div class="space-y-5">
                ${project.problems.map(renderProblemForm).join('')}
                <button type="button" id="add-problem" class="api-btn inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <i class="fa-solid fa-plus text-[10px]"></i>
                    Add Problem
                </button>
            </div>
        `)}

        ${section('Tech Stack', `
            ${textarea('techStack', 'Tech Stack', toLines(project.techStack), 4)}
        `)}

        <button type="button" id="delete-project" class="api-btn w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/60 text-xs font-mono text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
            <i class="fa-regular fa-trash-can text-[10px]"></i>
            Delete Project
        </button>
    `;

    bindFormEvents(form);
}

function renderDiagramForm(diagram, index) {
    return `
        <div class="rounded-lg border border-zinc-100 dark:border-zinc-900 p-4 space-y-4">
            <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Diagram ${index + 1}</span>
                <button type="button" data-delete-diagram="${index}" class="api-btn p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-red-500" title="다이어그램 삭제">
                    <i class="fa-regular fa-trash-can text-[10px]"></i>
                </button>
            </div>
            ${input(`diagrams.${index}.title`, 'Diagram Name', diagram.title)}
            ${input(`diagrams.${index}.imageUrl`, 'Diagram Image URL or Path', diagram.imageUrl)}
            ${input(`diagrams.${index}.imageLabel`, 'Placeholder Label', diagram.imageLabel)}
            ${fileInput(`diagram-file-${index}`, 'Diagram Image File')}
        </div>
    `;
}

function renderProblemForm(problem, index) {
    return `
        <div class="rounded-lg border border-zinc-100 dark:border-zinc-900 p-4 space-y-4">
            <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Problem ${index + 1}</span>
                <button type="button" data-delete-problem="${index}" class="api-btn p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-red-500" title="트러블슈팅 삭제">
                    <i class="fa-regular fa-trash-can text-[10px]"></i>
                </button>
            </div>
            ${input(`problems.${index}.title`, 'Problem Title', problem.title)}
            ${textarea(`problems.${index}.situation`, 'Situation', problem.situation, 3)}
            ${textarea(`problems.${index}.task`, 'Task', problem.task, 3)}
            ${textarea(`problems.${index}.action`, 'Action', problem.action, 3)}
            ${textarea(`problems.${index}.result`, 'Result', problem.result, 3)}
        </div>
    `;
}

function bindFormEvents(form) {
    form.querySelectorAll('[data-field]').forEach((field) => {
        field.addEventListener('input', () => {
            updateField(field.dataset.field, field.value);
            persistDraft();
            renderTabs();
            renderPreview();
        });
    });

    document.getElementById('project-image-file').addEventListener('change', handleProjectImageFile);
    document.getElementById('add-diagram').addEventListener('click', addDiagram);
    document.getElementById('add-problem').addEventListener('click', addProblem);
    document.getElementById('delete-project').addEventListener('click', deleteProject);

    form.querySelectorAll('[id^="diagram-file-"]').forEach((inputElement) => {
        inputElement.addEventListener('change', () => {
            const index = Number(inputElement.id.replace('diagram-file-', ''));
            handleDiagramImageFile(index, inputElement.files && inputElement.files[0]);
        });
    });

    form.querySelectorAll('[data-delete-diagram]').forEach((button) => {
        button.addEventListener('click', () => deleteDiagram(Number(button.dataset.deleteDiagram)));
    });

    form.querySelectorAll('[data-delete-problem]').forEach((button) => {
        button.addEventListener('click', () => deleteProblem(Number(button.dataset.deleteProblem)));
    });
}

function section(title, content) {
    return `
        <fieldset class="space-y-4">
            <legend class="text-xs font-mono font-bold tracking-widest uppercase text-emerald-500 mb-3">${title}</legend>
            <div class="space-y-4">${content}</div>
        </fieldset>
    `;
}

function input(field, label, value) {
    return `
        <label class="block">
            <span class="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">${label}</span>
            <input data-field="${field}" value="${escapeHtml(value)}" class="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:border-emerald-500">
        </label>
    `;
}

function textarea(field, label, value, rows) {
    return `
        <label class="block">
            <span class="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">${label}</span>
            <textarea data-field="${field}" rows="${rows}" class="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:border-emerald-500 resize-y">${escapeHtml(value)}</textarea>
        </label>
    `;
}

function fileInput(id, label) {
    return `
        <label class="block">
            <span class="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">${label}</span>
            <input id="${id}" type="file" accept="image/*" class="block w-full text-xs text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-xs file:font-mono file:text-zinc-600 dark:file:bg-zinc-900 dark:file:text-zinc-300">
        </label>
    `;
}

function updateField(field, value) {
    const project = projects[selectedIndex];

    if (field === 'roles' || field === 'techStack') {
        project[field] = toList(value);
        return;
    }

    const parts = field.split('.');

    if (parts[0] === 'diagrams') {
        project.diagrams[Number(parts[1])][parts[2]] = value;
        return;
    }

    if (parts[0] === 'problems') {
        project.problems[Number(parts[1])][parts[2]] = value;
        return;
    }

    project[field] = value;
}

function handleProjectImageFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    readImageFile(file, (result) => {
        projects[selectedIndex].imageUrl = result;
        projects[selectedIndex].imageLabel = file.name;
        persistDraft();
        renderForm();
        renderPreview();
    });
}

function handleDiagramImageFile(index, file) {
    if (!file) return;

    readImageFile(file, (result) => {
        const diagram = projects[selectedIndex].diagrams[index];
        diagram.imageUrl = result;
        diagram.imageLabel = file.name;
        persistDraft();
        renderForm();
        renderPreview();
    });
}

function readImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file);
}

function addDiagram() {
    projects[selectedIndex].diagrams.push(createEmptyDiagram());
    persistDraft();
    renderForm();
    renderPreview();
}

function deleteDiagram(index) {
    projects[selectedIndex].diagrams.splice(index, 1);
    persistDraft();
    renderForm();
    renderPreview();
}

function addProblem() {
    projects[selectedIndex].problems.push(createEmptyProblem());
    persistDraft();
    renderForm();
    renderPreview();
}

function deleteProblem(index) {
    projects[selectedIndex].problems.splice(index, 1);
    persistDraft();
    renderForm();
    renderPreview();
}

function deleteProject() {
    if (projects.length <= 1) {
        projects = [createEmptyProject()];
    } else {
        projects.splice(selectedIndex, 1);
        selectedIndex = Math.max(0, selectedIndex - 1);
    }

    persistDraft();
    renderEditor();
}

function renderPreview() {
    const preview = document.getElementById('project-preview');
    window.PortfolioProjects.renderProjects([projects[selectedIndex]], preview);
}

function persistDraft() {
    localStorage.setItem(draftStorageKey, JSON.stringify(projects));
    setStatus('draft saved locally');
}

function exportJson() {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'projects.json';
    link.click();
    URL.revokeObjectURL(url);
    setStatus('projects.json exported');
}

function importJson(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        projects = normalizeProjects(JSON.parse(reader.result));
        selectedIndex = 0;
        persistDraft();
        renderEditor();
        setStatus('json imported');
    };
    reader.readAsText(file);
}

function initThemeToggle() {
    const button = document.getElementById('theme-toggle');
    const icons = document.querySelectorAll('.theme-toggle-icon');
    const html = document.documentElement;

    const setTheme = (theme) => {
        const isDark = theme === 'dark';
        html.classList.toggle('dark', isDark);
        icons.forEach((icon) => {
            icon.className = isDark ? themeIcons.dark : themeIcons.light;
        });
        localStorage.setItem('theme', theme);
    };

    setTheme(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');
    button.addEventListener('click', () => {
        setTheme(html.classList.contains('dark') ? 'light' : 'dark');
    });
}

function setStatus(message) {
    const status = document.getElementById('editor-status');
    if (status) status.innerText = message;
}

function toList(value) {
    return String(value || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

function toLines(value) {
    return Array.isArray(value) ? value.join('\n') : '';
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
