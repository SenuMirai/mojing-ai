// ==================== 导航栏滚动效果 ====================
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle('scrolled', scrolled);
    backToTop.classList.toggle('visible', window.scrollY > 400);
});

// 返回顶部
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ==================== 移动端菜单 ====================
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// 点击导航链接关闭菜单
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// ==================== 滚动揭示动画 ====================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
});

// ==================== 数字递增动画 ====================
const numberObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            let current = 0;
            const step = Math.ceil(target / 30);
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                el.textContent = current;
            }, 30);
            numberObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => {
    numberObserver.observe(el);
});

// ==================== 粒子背景 ====================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = canvas.parentElement.offsetHeight;
}

function createParticles() {
    particles = [];
    const count = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 1.8 + 0.9,
            opacity: Math.random() * 0.35 + 0.28,
            color: Math.random() > 0.5 ? '79, 163, 184' : '116, 195, 212'
        });
    }
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制粒子
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // 边界反弹
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.fill();
    });

    // 绘制连线
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(79, 163, 184, ${(1 - dist / 120) * 0.2})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    animationId = requestAnimationFrame(drawParticles);
}

function initParticles() {
    resizeCanvas();
    createParticles();
    if (animationId) cancelAnimationFrame(animationId);
    drawParticles();
}

initParticles();

// 窗口大小变化时重新初始化
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initParticles, 200);
});

// ==================== 平滑滚动导航高亮 ====================
const sections = document.querySelectorAll('section[id]');
const navLinkItems = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinkItems.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${current}`) {
            link.style.color = 'var(--primary-light)';
        }
    });
});

// ==================== 下载按钮处理 ====================
const downloadBtn = document.getElementById('downloadBtn');

// Release 资源名（不含版本号，保证 releases/latest 链接长期有效）
const RELEASE_ASSET = 'MojingAI_Portable.zip';

/**
 * 解析安装包下载地址：
 * - 部署在 GitHub Pages（<owner>.github.io/<repo>/）时自动指向该仓库的 latest Release 资源
 * - 本地预览（file:// 或本地 http 服务）时回退到项目内的 dist 目录
 */
function resolveDownloadUrl() {
    const host = location.hostname || '';
    const m = host.match(/^([^.]+)\.github\.io$/i);
    if (m && m[1].toLowerCase() !== 'www') {
        const repo = (location.pathname.split('/')[1] || '').trim();
        if (repo) {
            return {
                url: `https://github.com/${m[1]}/${repo}/releases/latest/download/${RELEASE_ASSET}`,
                name: RELEASE_ASSET
            };
        }
    }
    return { url: '../dist/墨境AI_v2.3_Portable.zip', name: '墨境AI_v2.3_Portable.zip' };
}

downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const target = resolveDownloadUrl();
    const link = document.createElement('a');
    link.href = target.url;
    link.download = target.name;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('正在开始下载... 如果未自动下载，请右键链接另存为');
});

// 让下载链接可被复制/右键另存（同步真实地址到按钮 href）
(function syncDownloadHref() {
    const target = resolveDownloadUrl();
    if (downloadBtn) downloadBtn.setAttribute('href', target.url);
})();

// ==================== Toast 提示 ====================
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(255, 255, 255, 0.88);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(79, 163, 184, 0.35);
        color: #1F3B45;
        padding: 14px 28px;
        border-radius: 10px;
        font-size: 0.95rem;
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 8px 32px rgba(31, 59, 69, 0.16);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==================== 鼠标视差效果（Hero区域）====================
const hero = document.querySelector('.hero-content');
const heroSection = document.getElementById('hero');

heroSection.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    hero.style.transform = `translate(${x}px, ${y}px)`;
});

heroSection.addEventListener('mouseleave', () => {
    hero.style.transform = 'translate(0, 0)';
});

// 平滑过渡
hero.style.transition = 'transform 0.3s ease-out';

// ==================== 卡片悬停3D效果 ====================
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 30;
        const rotateY = (centerX - x) / 30;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ==================== 页面加载完成动画 ====================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});
