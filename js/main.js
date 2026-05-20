const drawerIcons = {
    open: '<i class="fa-solid fa-xmark text-sm"></i>',
    closed: '<i class="fa-solid fa-bars text-sm"></i>',
};

const themeIcons = {
    dark: 'theme-toggle-icon fa-solid fa-sun text-xs sm:text-sm',
    light: 'theme-toggle-icon fa-solid fa-moon text-xs sm:text-sm',
};

// [수정 영역] API 시뮬레이터 응답 데이터
const apiData = {
    getProfile: {
        headers: { Status: '200 OK', Latency: '14ms' },
        body: {
            developer: '홍길동',
            role: 'Backend Application Engineer',
            experience: 'Junior / Entry-Level',
            specialty: 'Distributed Concurrency, Query Tuning, Messaging Queue',
            status: 'Available_for_Interviews',
        },
    },
    getSkills: {
        headers: { Status: '200 OK', Latency: '11ms' },
        body: {
            backend: ['Java', 'Spring Boot', 'JPA', 'Redis', 'Docker', 'AWS'],
            database: ['MySQL', 'PostGIS'],
            tools: ['Git', 'GitHub', 'IntelliJ IDEA', 'DataGrip', 'Codex CLI'],
        },
    },
    getProjects: {
        headers: { Status: '200 OK', Latency: '18ms' },
        body: {
            total_count: 2,
            projects: [
                {
                    id: 1,
                    title: 'ZPYT - AI 얼굴인식 집중도 분석 프로그램',
                    focus: 'AI Concentration Analysis',
                    key_tech: ['Java', 'Spring Boot', 'AI', 'MySQL'],
                },
                {
                    id: 2,
                    title: '지역기반 중고굿즈 교환 플랫폼',
                    focus: 'Local Goods Exchange / In Progress',
                    key_tech: ['Java', 'Spring Boot', 'PostGIS', 'Docker'],
                },
            ],
        },
    },
};

document.addEventListener('DOMContentLoaded', () => {
    initMobileDrawer();
    initScrollSpy();
    initThemeToggle();
    initApiPlayground();
    initProjects();
});

function initMobileDrawer() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (!mobileMenuBtn || !mobileDrawer) return;

    const closeDrawer = () => {
        mobileDrawer.classList.add('hidden');
        mobileMenuBtn.innerHTML = drawerIcons.closed;
    };

    mobileMenuBtn.addEventListener('click', () => {
        const isHidden = mobileDrawer.classList.toggle('hidden');
        mobileMenuBtn.innerHTML = isHidden ? drawerIcons.closed : drawerIcons.open;
    });

    mobileNavLinks.forEach((link) => {
        link.addEventListener('click', closeDrawer);
    });
}

function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!sections.length || !navLinks.length) return;

    const updateActiveNav = () => {
        let current = '';
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const scrollHeight = document.documentElement.scrollHeight;

        if (scrollPosition + windowHeight >= scrollHeight - 80) {
            current = sections[sections.length - 1].id;
        } else {
            sections.forEach((section) => {
                if (scrollPosition >= section.offsetTop - 220) {
                    current = section.id;
                }
            });
        }

        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    };

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
}

function initThemeToggle() {
    const themeToggleBtns = [
        document.getElementById('theme-toggle'),
        document.getElementById('theme-toggle-mobile'),
    ].filter(Boolean);
    const themeToggleIcons = document.querySelectorAll('.theme-toggle-icon');
    const htmlElement = document.documentElement;

    const setTheme = (theme) => {
        const isDark = theme === 'dark';

        htmlElement.classList.toggle('dark', isDark);
        themeToggleIcons.forEach((icon) => {
            icon.className = isDark ? themeIcons.dark : themeIcons.light;
        });
        localStorage.setItem('theme', theme);
    };

    setTheme(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');

    themeToggleBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            setTheme(htmlElement.classList.contains('dark') ? 'light' : 'dark');
        });
    });
}

function initApiPlayground() {
    document.querySelectorAll('[data-api-endpoint]').forEach((button) => {
        button.addEventListener('click', () => {
            triggerApi(button.dataset.apiEndpoint);
        });
    });
}

async function initProjects() {
    const projectList = document.getElementById('project-list');

    if (!projectList || !window.PortfolioProjects) return;

    try {
        const draft = localStorage.getItem('portfolioProjectsDraft');
        let projects;

        if (draft) {
            projects = JSON.parse(draft);
        } else {
            const response = await fetch('./projects.json', { cache: 'no-cache' });
            if (!response.ok) throw new Error('Failed to load projects.json');
            projects = await response.json();
        }

        projects = projects.map((project) => window.PortfolioProjects.normalizeProject(project));
        window.PortfolioProjects.renderProjects(projects, projectList);
        apiData.getProjects.body = {
            total_count: projects.length,
            projects: projects.map((project, index) => ({
                id: index + 1,
                title: project.title,
                focus: project.subtitle,
                key_tech: project.techStack,
            })),
        };
    } catch (error) {
        console.warn(error);
    }
}

function triggerApi(endpoint) {
    const resBox = document.getElementById('json-response');
    const latencyElement = document.getElementById('response-time');
    const statusElement = document.getElementById('response-status');
    const target = apiData[endpoint];

    if (!resBox || !latencyElement || !statusElement || !target) return;

    resBox.innerHTML = '/* Querying v1 backend REST gateway... */';
    latencyElement.innerText = 'Latency: Fetching...';
    statusElement.innerText = 'Status: --';

    window.setTimeout(() => {
        resBox.innerHTML = JSON.stringify(target.body, null, 4);
        latencyElement.innerText = `Latency: ${target.headers.Latency}`;
        statusElement.innerText = `Status: ${target.headers.Status}`;
    }, 450);
}
