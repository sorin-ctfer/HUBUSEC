(function () {
  const hero = document.getElementById('hero');
  const heroBg = document.querySelector('.hero-bg');
  const introLogo = document.getElementById('intro-logo');
  const header = document.getElementById('site-header');
  const main = document.getElementById('main');
  const navButtons = Array.from(document.querySelectorAll('.nav-item'));
  const flowBands = document.getElementById('flow-bands');
  const cornerArrows = document.getElementById('corner-arrows');
  const terminalOverlay = document.getElementById('terminal-overlay');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalForm = document.getElementById('terminal-form');
  const terminalInput = document.getElementById('terminal-input');
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  const clickCanvas = document.getElementById('click-canvas');
  const setSideSpeedScale = (scale) => {
    if (!flowBands) return;
    flowBands.style.setProperty('--side-speed-scale', String(scale));
  };
  const setSideSpeed = (duration) => {
    if (!flowBands) return;
    flowBands.style.setProperty('--side-speed', duration);
  };

  // 直接指定背景图，规避个别环境下 CSS 相对路径解析异常
  if (heroBg) {
    heroBg.style.backgroundImage = "url('statics/bg.jpg')";
  }
  // 同步常驻背景层
  const pageBg = document.querySelector('.page-bg');
  if (pageBg) {
    pageBg.style.backgroundImage = "url('statics/bg.jpg')";
  }

  const sections = {
    intro: document.getElementById('section-intro'),
    news: document.getElementById('section-news'),
    research: document.getElementById('section-research'),
    members: document.getElementById('section-members'),
    join: document.getElementById('section-join'),
  };

  // 假数据：协会新闻
  const newsData = [
    {
      id: 'n1',
      title: '协会创立',
      date: '2024-11-30',
      cover: 'statics/bg.jpg',
      excerpt: '协会正式创立，首任会长由k13in担任',
      content: `湖北大学网络空间安全协会在2024年11月30日正式通过审批进入运行，首任会长由2021级的k13担任，2022级年级负责人为一叶知秋来担任，2023级负责人为Sorin`
    },
  ];

  // 初始化：开场动画
  function runIntroAnimation() {
    // 可选：通过 URL 参数/哈希跳过开场动画，便于排错
    const url = new URL(window.location.href);
    const skip = url.searchParams.get('nointro') === '1' || window.location.hash.includes('nointro');
    if (skip) {
      showSite();
      if (hero) hero.remove();
      // 直接进入常速与主站层级
      if (flowBands) {
        flowBands.style.setProperty('--band-speed', '24s');
        setSideSpeed('24s');
        setSideSpeedScale(1);
        flowBands.classList.remove('on-hero');
        flowBands.classList.add('on-main');
      }
      return;
    }

    // 先确保图片加载
    const bg = new Image();
    const logo = new Image();
    let loaded = 0;
    // 超时兜底：5s 内没加载也进入主站（延长）
    const failSafe = setTimeout(() => {
      hero.classList.add('move-up');
      setTimeout(() => {
        hero.classList.add('fade-out');
        if (flowBands) {
          flowBands.style.setProperty('--band-speed', '24s');
          setSideSpeed('24s');
          flowBands.classList.remove('on-hero');
          flowBands.classList.add('on-main');
        }
        showSite();
        setTimeout(() => hero.remove(), 900);
      }, 600);
    }, 5000);
    const onAsset = () => {
      loaded += 1;
      if (loaded >= 1) { // 背景先到即可开场；logo懒加载
        clearTimeout(failSafe);
        requestAnimationFrame(() => {
          hero.classList.add('ready');
          // 进入开场阶段：提高流动速度
          if (flowBands) {
            flowBands.style.setProperty('--band-speed', '5s');
            setSideSpeed('24s');
            setSideSpeedScale(1);
            flowBands.classList.add('on-hero');
            // 分段减速，模拟“逐渐变为正常”
            setTimeout(() => flowBands.style.setProperty('--band-speed', '9s'), 900);
            setTimeout(() => flowBands.style.setProperty('--band-speed', '13s'), 1400);
            setTimeout(() => flowBands.style.setProperty('--band-speed', '17s'), 1900);
            setTimeout(() => flowBands.style.setProperty('--band-speed', '21s'), 2400);
          }
          // 过一段时间让背景模糊
          setTimeout(() => {
            hero.classList.add('blur');
          }, 400);
          // 再过一段时间将 LOGO 平移到主页 LOGO 位置并无缝衔接
          setTimeout(() => {
            // 先显示主站（在开场层之下，不可见，但可用于测量位置）
            showSite();
            requestAnimationFrame(() => performSeamlessLogoMove());
          }, 2200);
        });
      }
    };
    bg.onload = onAsset;
    bg.src = 'statics/bg.jpg';
    logo.src = 'statics/logofinal.png';
  }

  function performSeamlessLogoMove() {
    try {
      const brandLogo = document.querySelector('.brand-logo');
      if (!introLogo || !brandLogo || !hero) {
        // 兜底：若元素缺失，采用原来的上移淡出
        hero.classList.add('move-up');
        setTimeout(() => {
          hero.classList.add('fade-out');
          setTimeout(() => hero.remove(), 1000);
        }, 700);
        return;
      }

      const introRect = introLogo.getBoundingClientRect();
      const brandRect = brandLogo.getBoundingClientRect();

      const introCenterX = introRect.left + introRect.width / 2;
      const introCenterY = introRect.top + introRect.height / 2;
      const brandCenterX = brandRect.left + brandRect.width / 2;
      const brandCenterY = brandRect.top + brandRect.height / 2;

      const deltaX = brandCenterX - introCenterX;
      const deltaY = brandCenterY - introCenterY;
      const scale = brandRect.width / introRect.width;

      introLogo.style.willChange = 'transform, opacity';
      introLogo.style.transition = 'transform 900ms var(--timing)';
      introLogo.style.transform = `translate(-50%, -50%) translate(${deltaX}px, ${deltaY}px) scale(${scale})`;

      // 在 LOGO 贴合后，淡出开场层
      setTimeout(() => {
        hero.classList.add('fade-out');
        // 从开场减速到常速，并将特效置于主站层级
        if (flowBands) {
          // 延迟切换到主站层级，避免切层瞬间的合成抖动
          setTimeout(() => {
            flowBands.style.setProperty('--band-speed', '24s');
            setSideSpeed('24s');
            setSideSpeedScale(1);
            flowBands.classList.remove('on-hero');
            flowBands.classList.add('on-main');
          }, 120);
        }
        setTimeout(() => hero.remove(), 1000);
      }, 950);
    } catch (e) {
      // 任何异常都回退到原方案
      hero.classList.add('move-up');
      setTimeout(() => {
        hero.classList.add('fade-out');
        if (flowBands) {
          flowBands.style.setProperty('--band-speed', '24s');
          flowBands.classList.remove('on-hero');
          flowBands.classList.add('on-main');
        }
        setTimeout(() => hero.remove(), 1000);
      }, 700);
    }
  }

  function showSite() {
    header.classList.remove('hidden');
    main.classList.remove('hidden');
    header.classList.add('fade-in');
    main.classList.add('fade-in');
  }

  // 终端逻辑
  const WELCOME_ASCII = String.raw`  _   _   _   _   ____    _   _   ____    _____    ____                                                   
 | | | | | | | | | __ )  | | | | / ___|  | ____|  / ___|                                                  
 | |_| | | | | | |  _ \  | | | | \___ \  |  _|   | |                                                      
 |  _  | | |_| | | |_) | | |_| |  ___) | | |___  | |___                                                   
 |_| |_|  \___/  |____/   \___/  |____/  |_____|  \____|                                                  
                                                                                                          
 __        __  _____   _        ____    ___    __  __   _____     _____    ___       ___    _   _   ____  
 \ \      / / | ____| | |      / ___|  / _ \  |  \/  | | ____|   |_   _|  / _ \     / _ \  | | | | |  _ \ 
  \ \ /\ / /  |  _|   | |     | |     | | | | | |\/| | |  _|       | |   | | | |   | | | | | | | | | |_) |
   \ V  V /   | |___  | |___  | |___  | |_| | | |  | | | |___      | |   | |_| |   | |_| | | |_| | |  _ < 
    \_/\_/    |_____| |_____|  \____|  \___/  |_|  |_| |_____|     |_|    \___/     \___/   \___/  |_| \_\
                                                                                                          
  _____   _____   ____    __  __   ___   _   _      _      _                                             
 |_   _| | ____| |  _ \  |  \/  | |_ _| | \ | |    / \    | |                                            
   | |   |  _|   | |_) | | |\/| |  | |  |  \| |   / _ \   | |                                            
   | |   | |___  |  _ <  | |  | |  | |  | |\  |  / ___ \  | |___                                         
   |_|   |_____| |_| \_\ |_|  |_| |___| |_| \_| /_/   \_\ |_____|                                        `;

  const FILES = {
    flag: 'hubuctf{welcome_to_our_Terminal}',
    welcome: WELCOME_ASCII,
    about: 'we are hubuctfers，we never give up',
    ctf: 'you can go to HUBU::CTF，https://hubuctf.cn/'
  };

  function printLine(text = '', className) {
    if (!terminalOutput) return;
    const line = document.createElement('div');
    if (className) line.className = className;
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function typeText(text, speed = 2) {
    return new Promise((resolve) => {
      let i = 0;
      const buffer = document.createElement('div');
      buffer.className = 'info';
      terminalOutput.appendChild(buffer);
      const tick = () => {
        if (i <= text.length) {
          buffer.textContent = text.slice(0, i);
          terminalOutput.scrollTop = terminalOutput.scrollHeight;
          i += Math.max(1, speed);
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      tick();
    });
  }

  function openTerminal() {
    if (!terminalOverlay) return;
    // 角落箭头提示
    if (cornerArrows) {
      cornerArrows.classList.add('show');
      setTimeout(() => cornerArrows.classList.remove('show'), 1200);
    }
    terminalOverlay.setAttribute('aria-hidden', 'false');
    // 初始欢迎 ASCII
    terminalOutput.innerHTML = '';
    typeText(WELCOME_ASCII, 2).then(() => {
      printLine('');
      printLine('Terminal@hubuctfer:~$');
      terminalInput.focus();
    });
  }

  function closeTerminal() {
    if (!terminalOverlay) return;
    terminalOverlay.setAttribute('aria-hidden', 'true');
  }

  function handleCommand(input) {
    const raw = (input || '').trim();
    if (!raw) return;
    // 输出命令回显
    printLine(`Terminal@hubuctfer:~$ ${raw}`, 'info');

    const lower = raw.toLowerCase();
    let handled = false;
    if (lower === 'help') {
      printLine('we can');
      printLine('ls and cat');
      handled = true;
    } else if (lower.includes('ls')) {
      printLine('flag');
      printLine('welcome');
      printLine('about');
      printLine('ctf');
      handled = true;
    } else if (lower.startsWith('cat ')) {
      const name = raw.slice(4).trim();
      if (name in FILES) {
        printLine(FILES[name]);
      } else {
        printLine(`cat: ${name}: No such file`, 'err');
      }
      handled = true;
    } else if (raw === FILES.flag) {
      printLine('Yes! You Get The Flag! +200!', 'ok');
      handled = true;
    } else {
      printLine("if you dont know what to do，you can ‘help’", 'warn');
    }
    // 新一行提示符
    printLine('Terminal@hubuctfer:~$');
  }

  // 绑定 LOGO 点击打开终端：开场层与主站 LOGO 都可触发
  function bindTerminalTriggers() {
    const triggers = [document.getElementById('intro-logo'), ...document.querySelectorAll('.brand-logo')];
    triggers.forEach((el) => {
      if (!el) return;
      el.classList.add('is-clickable');
      el.addEventListener('click', openTerminal);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openTerminal(); });
    });
    // 终端交互
    if (terminalForm && terminalInput) {
      terminalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = terminalInput.value;
        handleCommand(value);
        terminalInput.value = '';
      });
    }
    // ESC 关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeTerminal();
    });
    // 点击遮罩关闭（不影响面板本身）
    if (terminalOverlay) {
      terminalOverlay.addEventListener('click', (e) => {
        if (e.target === terminalOverlay) closeTerminal();
      });
    }
  }

  // 检测设备类型
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 自定义鼠标与拖尾（仅在非触摸设备上启用）
  function initCustomCursor() {
    if (!cursorDot || !cursorRing || isTouchDevice) return;
    
    let ringX = -100, ringY = -100;
    let dotX = -100, dotY = -100;
    let targetX = -100, targetY = -100;
    const lerp = (a, b, n) => a + (b - a) * n;
    
    const move = (e) => {
      targetX = e.clientX; targetY = e.clientY;
      dotX = targetX; dotY = targetY;
      cursorDot.style.transform = `translate3d(${dotX - 3}px, ${dotY - 3}px, 0)`;
    };
    
    const loop = () => {
      ringX = lerp(ringX, targetX, 0.18);
      ringY = lerp(ringY, targetY, 0.18);
      cursorRing.style.transform = `translate3d(${ringX - 14}px, ${ringY - 14}px, 0)`;
      requestAnimationFrame(loop);
    };
    
    loop();
    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', (e) => { 
      cursorRing.classList.add('active'); 
      spawnClickBurst(e.clientX, e.clientY); 
    });
    window.addEventListener('mouseup', () => cursorRing.classList.remove('active'));
    
    // 进入/离开窗口
    document.addEventListener('mouseleave', () => { 
      cursorDot.classList.add('hide'); 
      cursorRing.classList.add('hide'); 
    });
    document.addEventListener('mouseenter', () => { 
      cursorDot.classList.remove('hide'); 
      cursorRing.classList.remove('hide'); 
    });
    
    // 触摸设备支持
    if (isTouchDevice) {
      window.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          spawnClickBurst(touch.clientX, touch.clientY);
        }
      });
    }

    // 当悬停可点击元素时，缩小环增强点击感
    const clickableSelector = 'a, button, [role="button"], .nav-item, .brand-logo';
    document.addEventListener('mouseover', (e) => {
      if (e.target && (e.target.closest(clickableSelector))) {
        cursorRing.classList.add('active');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target && (e.target.closest(clickableSelector))) {
        cursorRing.classList.remove('active');
      }
    });
  }

  // 点击粒子 + logo.png 超小图爆裂效果
  function spawnClickBurst(x, y) {
    if (!clickCanvas) return;
    
    // 在移动设备上减少粒子数量以提高性能
    const count = isMobileDevice ? 16 : 26;
    const baseSpeed = isMobileDevice ? 1.8 : 2.2;
    const life = isMobileDevice ? 600 : 700; // ms
    
    const ctx = clickCanvas.getContext('2d');
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    
    const resize = () => {
      clickCanvas.width = Math.floor(window.innerWidth * dpr);
      clickCanvas.height = Math.floor(window.innerHeight * dpr);
      clickCanvas.style.width = window.innerWidth + 'px';
      clickCanvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    
    if (!clickCanvas.dataset.inited) {
      resize();
      window.addEventListener('resize', resize);
      clickCanvas.dataset.inited = '1';
    }

    // 预加载小图
    const img = new Image();
    img.src = 'statics/logo.png';
    const particles = [];
    const start = performance.now();

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2) * (i / count) + Math.random() * 0.6;
      const speed = baseSpeed * (0.6 + Math.random() * 0.8);
      const size = isMobileDevice ? (6 + Math.random() * 8) : (8 + Math.random() * 10);
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        rotation: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        alpha: 1,
      });
    }

    const trail = [];
    let rafId = 0;

    const tick = (now) => {
      const t = now - start;
      if (t > life + 200) { cancelAnimationFrame(rafId); clear(); return; }
      clear();
      
      // 绘制小图（更大号，随时间缩小）
      const scale = Math.max(0, 1 - t / life);
      const iconSize = isMobileDevice ? (24 + 36 * scale) : (32 + 48 * scale);
      ctx.save();
      ctx.globalAlpha = 0.8 * scale;
      ctx.drawImage(img, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
      ctx.restore();

      // 粒子更新与绘制
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // 轻微重力
        p.rotation += p.vr;
        p.alpha = Math.max(0, 1 - t / life);
        
        // 画一个发光圆点模拟碎片
        ctx.save();
        ctx.globalAlpha = p.alpha;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grd.addColorStop(0, 'rgba(37,99,235,0.9)');
        grd.addColorStop(1, 'rgba(37,99,235,0.0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 轻微拖尾：记录点位，用细线条连接
      trail.push({x, y, alpha: 0.25});
      if (trail.length > (isMobileDevice ? 8 : 10)) trail.shift();
      ctx.save();
      ctx.lineWidth = isMobileDevice ? 1.0 : 1.2;
      ctx.strokeStyle = 'rgba(37,99,235,0.35)';
      ctx.beginPath();
      trail.forEach((pt, i) => {
        const f = i / trail.length;
        ctx.globalAlpha = pt.alpha * f;
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.restore();

      rafId = requestAnimationFrame(tick);
    };

    const clear = () => {
      ctx.clearRect(0, 0, clickCanvas.width, clickCanvas.height);
    };

    rafId = requestAnimationFrame(tick);
  }


  // 路由切换（不跳转页面）
  function switchRoute(route) {
    return function () {
    Object.entries(sections).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle('section-active', key === route);
    });
    navButtons.forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.route === route);
    });
    // 辅助：让读屏焦点落到主内容
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    requestAnimationFrame(() => main.focus());
    };
  }

  // 渲染新闻列表（卡片化）
  function renderNewsList() {
    const list = document.getElementById('news-list');
    if (!list) return;
    list.innerHTML = '';
    list.classList.add('card-grid');
    newsData.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'news-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <img class="news-cover" src="${item.cover}" alt="${item.title} 预览图" />
        <div class="news-content">
          <h3 class="news-title">${item.title}</h3>
          <div class="news-meta">${item.date}</div>
          <p class="news-excerpt">${item.excerpt}</p>
        </div>
      `;
      const open = () => openNewsDetail(item.id);
      card.addEventListener('click', open);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
      list.appendChild(card);
    });
  }

  // 成员数据：会长 + 各年份
  const presidents = [
    { name: 'k13in', year: '2024', avatar: '', blog: '' },
    { name: 'Sorin', year: '2025', avatar: 'statics/mems/Sorin.jpg', blog: 'https://www.cnblogs.com/Yakas-sorin' },
  ];
  const membersByYear = {
    '2021': [
      { name: 'k13in', desc: '', avatar: '', blog: '' },
      { name: 'st4rry', desc: '', avatar: '', blog: '' },
    ],
    '2022': [
      { name: '波克比QWQ', desc: '', avatar: '', blog: '' },
      { name: 'TGINᐝ', desc: '', avatar: '', blog: '' },
    ],
    '2023': [
      { name: 'Sorin', desc: '静专思主，谦逊俨然', avatar: 'statics/mems/Sorin.jpg', blog: 'https://www.cnblogs.com/Yakas-sorin' },
      { name: 'ShallowDream', desc: '', avatar: '', blog: '' },
      { name: 'aber', desc: '', avatar: '', blog: '' },
      { name: 'f0rev3r', desc: '', avatar: '', blog: '' },
      { name: 'GUMO', desc: '', avatar: '', blog: '' },
      { name: '梦醒', desc: '', avatar: '', blog: '' },
      { name: 'akaiwen', desc: '', avatar: '', blog: '' },
      { name: '6jf', desc: '', avatar: '', blog: '' },
      { name: 'Pie', desc: '', avatar: '', blog: '' },
    ],
  };

  function createMemberCard(m, extraBadge) {
    const avatar = m.avatar || 'statics/logo.png';
    const blog = m.blog || 'https://github.com';
    const a = document.createElement('a');
    a.className = 'member-card';
    a.href = blog;
    a.target = '_blank';
    a.rel = 'noopener';
    const badge = extraBadge ? `<span class="member-badge">${extraBadge}</span>` : '';
    a.innerHTML = `
      <img class="member-avatar" src="${avatar}" alt="${m.name} 头像" onerror="this.src='statics/logo.png'" />
      <div class="member-info">
        <div class="member-name">${m.name || 'Member'} ${badge}</div>
        <div class="member-desc">${m.desc || ''}</div>
      </div>
    `;
    return a;
  }

  function renderMembers() {
    // 会长
    const pGrid = document.getElementById('members-presidents-grid');
    if (pGrid) {
      pGrid.innerHTML = '';
      pGrid.className = 'member-grid';
      presidents.forEach(p => pGrid.appendChild(createMemberCard(p, p.year)));
    }
    // 年份
    const years = Object.keys(membersByYear);
    years.forEach((y) => {
      const grid = document.getElementById(`members-${y}-grid`);
      if (!grid) return;
      grid.innerHTML = '';
      grid.className = 'member-grid';
      membersByYear[y].forEach(m => grid.appendChild(createMemberCard(m)));
    });
  }

  function bindMembersCollapse() {
    const pairs = [
      ['members-presidents-toggle', 'members-presidents'],
      ['members-2021-toggle', 'members-2021'],
      ['members-2022-toggle', 'members-2022'],
      ['members-2023-toggle', 'members-2023'],
    ];
    const bind = (toggleId, panelId) => {
      const toggle = document.getElementById(toggleId);
      const panel = document.getElementById(panelId);
      if (!toggle || !panel) return;
      const apply = (open) => {
        panel.classList.toggle('open', open);
        panel.setAttribute('aria-hidden', String(!open));
        toggle.setAttribute('aria-expanded', String(open));
      };
      const onToggle = () => { apply(!(panel.classList.contains('open'))); };
      toggle.addEventListener('click', onToggle);
      toggle.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); }});
    };
    pairs.forEach(([t, p]) => bind(t, p));
  }

  // 加入我们：社团架构折叠切换
  function bindJoinCollapse() {
    const toggle = document.getElementById('org-structure-toggle');
    const panel = document.getElementById('org-structure');
    if (!toggle || !panel) return;
    const apply = (open) => {
      panel.classList.toggle('open', open);
      panel.setAttribute('aria-hidden', String(!open));
      toggle.setAttribute('aria-expanded', String(open));
    };
    const onToggle = () => {
      const isOpen = panel.classList.contains('open');
      apply(!isOpen);
    };
    toggle.addEventListener('click', onToggle);
    toggle.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); }});
  }

  // 详情抽屉
  const detail = document.getElementById('news-detail');
  const detailCloseBtn = document.getElementById('news-detail-close');
  const detailTitle = document.getElementById('news-detail-title');
  const detailMeta = document.querySelector('.news-detail-meta');
  const detailImage = document.querySelector('.news-detail-image');
  const detailBody = document.querySelector('.news-detail-body');

  function openNewsDetail(id) {
    const item = newsData.find(n => n.id === id);
    if (!item) return;
    detailTitle.textContent = item.title;
    detailMeta.textContent = item.date;
    detailImage.src = item.cover;
    detailBody.textContent = '';
    // 简单的段落分割
    item.content.split('\n').forEach(p => {
      const el = document.createElement('p');
      el.textContent = p;
      detailBody.appendChild(el);
    });
    detail.setAttribute('aria-hidden', 'false');
  }

  function closeNewsDetail() {
    detail.setAttribute('aria-hidden', 'true');
  }

  detailCloseBtn.addEventListener('click', closeNewsDetail);
  detail.addEventListener('click', (e) => {
    if (e.target === detail) closeNewsDetail();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNewsDetail();
  });

  // 绑定导航
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;
      switchRoute(route)();
      if (route === 'news') renderNewsList();
      if (route === 'members') renderMembers();
    });
  });

  // 移动端触摸手势支持
  function initTouchGestures() {
    if (!isTouchDevice) return;
    
    // 防止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
    
    // 防止页面滚动时的橡皮筋效果（iOS）
    document.addEventListener('touchmove', (e) => {
      if (e.target.closest('.terminal-output, .news-detail-content')) {
        return; // 允许在这些元素内滚动
      }
      // 可以在这里添加其他触摸手势逻辑
    }, { passive: true });
    
    // 优化触摸反馈
    const touchElements = document.querySelectorAll('.nav-item, .glass-card, .news-card, .member-card');
    touchElements.forEach(el => {
      el.addEventListener('touchstart', () => {
        el.style.transform = 'scale(0.98)';
        el.style.transition = 'transform 100ms ease';
      });
      
      el.addEventListener('touchend', () => {
        el.style.transform = '';
        el.style.transition = '';
      });
    });
    
    // 添加触摸手势支持
    let startY = 0;
    let startX = 0;
    
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
      }
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        const endY = e.changedTouches[0].clientY;
        const endX = e.changedTouches[0].clientX;
        const deltaY = startY - endY;
        const deltaX = startX - endX;
        
        // 检测向上滑动（可以用于快速导航）
        if (Math.abs(deltaY) > 50 && Math.abs(deltaY) > Math.abs(deltaX)) {
          if (deltaY > 0) {
            // 向上滑动 - 可以添加快速导航逻辑
            console.log('向上滑动');
          }
        }
      }
    }, { passive: true });
    
    // 优化触摸滚动体验
    const scrollableElements = document.querySelectorAll('.terminal-output, .news-detail-content');
    scrollableElements.forEach(el => {
      el.addEventListener('touchstart', () => {
        el.style.webkitOverflowScrolling = 'touch';
      }, { passive: true });
    });
  }
  
  // 移动端性能优化
  function optimizeForMobile() {
    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0);
    
    if (!isMobile) return;

    console.log('🔄 移动端优化已启用');

    // 移动端性能优化
    if (flowBands) {
      // 移动端降低动画复杂度
      flowBands.style.setProperty('--band-speed', '32s');
      setSideSpeed('32s');
      setSideSpeedScale(0.8);
    }

    // 移动端触摸优化
    document.body.classList.add('mobile-device');
    
    // 显示移动端状态
    const mobileStatus = document.querySelector('.mobile-status');
    if (mobileStatus) {
      mobileStatus.classList.remove('hidden');
    }
    
    // 优化触摸反馈
    const touchableElements = document.querySelectorAll('.nav-item, .glass-card, .news-card, .member-card, [role="button"]');
    touchableElements.forEach(el => {
      el.addEventListener('touchstart', function(e) {
        this.style.transform = 'scale(0.98)';
        this.style.transition = 'transform 0.1s ease';
        
        // 创建触摸涟漪效果
        createTouchRipple(e.touches[0].clientX, e.touches[0].clientY, this);
      }, { passive: true });
      
      el.addEventListener('touchend', function() {
        this.style.transform = '';
        this.style.transition = '';
      }, { passive: true });
    });
    
    // 触摸涟漪效果
    function createTouchRipple(x, y, element) {
      const ripple = document.createElement('div');
      ripple.className = 'touch-ripple';
      ripple.style.left = (x - element.getBoundingClientRect().left) + 'px';
      ripple.style.top = (y - element.getBoundingClientRect().top) + 'px';
      
      element.style.position = 'relative';
      element.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }

    // 移动端滚动优化
    let isScrolling = false;
    let scrollTimer;
    
    const handleScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 移动端双击缩放禁用
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // 移动端键盘优化
    if (terminalInput) {
      terminalInput.addEventListener('focus', function() {
        // 移动端输入框聚焦时滚动到可视区域
        setTimeout(() => {
          this.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      });
    }



    // 移动端状态栏优化
    if ('standalone' in window.navigator && window.navigator.standalone) {
      // iOS PWA 模式
      document.body.classList.add('pwa-mode');
    }

    // 移动端电池优化
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        if (battery.level < 0.2) {
          // 低电量时降低动画复杂度
          document.body.classList.add('low-battery');
          if (flowBands) {
            flowBands.style.setProperty('--band-speed', '40s');
            setSideSpeed('40s');
            setSideSpeedScale(0.6);
          }
          
          // 更新电池状态显示
          const batteryStatus = document.querySelector('.battery-status');
          if (batteryStatus) {
            batteryStatus.textContent = `🔋 电量低 (${Math.round(battery.level * 100)}%)`;
            batteryStatus.style.background = 'rgba(239, 68, 68, 0.9)';
          }
        } else {
          // 更新电池状态显示
          const batteryStatus = document.querySelector('.battery-status');
          if (batteryStatus) {
            batteryStatus.textContent = `🔋 电量充足 (${Math.round(battery.level * 100)}%)`;
            batteryStatus.style.background = 'rgba(16, 185, 129, 0.9)';
          }
        }
        
        // 监听电池状态变化
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.2) {
            document.body.classList.add('low-battery');
            const batteryStatus = document.querySelector('.battery-status');
            if (batteryStatus) {
              batteryStatus.textContent = `🔋 电量低 (${Math.round(battery.level * 100)}%)`;
              batteryStatus.style.background = 'rgba(239, 68, 68, 0.9)';
            }
          } else {
            document.body.classList.remove('low-battery');
            const batteryStatus = document.querySelector('.battery-status');
            if (batteryStatus) {
              batteryStatus.textContent = `🔋 电量充足 (${Math.round(battery.level * 100)}%)`;
              batteryStatus.style.background = 'rgba(16, 185, 129, 0.9)';
            }
          }
        });
      });
    }

    // 移动端网络优化
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const updateNetworkStatus = () => {
        const networkStatus = document.querySelector('.network-status');
        if (networkStatus) {
          if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            // 慢网络时禁用复杂动画
            document.body.classList.add('slow-network');
            if (flowBands) {
              flowBands.style.opacity = '0.3';
            }
            networkStatus.textContent = `📶 网络较慢 (${connection.effectiveType})`;
            networkStatus.style.background = 'rgba(239, 68, 68, 0.9)';
          } else if (connection.effectiveType === '3g') {
            networkStatus.textContent = `📶 网络一般 (${connection.effectiveType})`;
            networkStatus.style.background = 'rgba(245, 158, 11, 0.9)';
          } else {
            networkStatus.textContent = `📶 网络良好 (${connection.effectiveType})`;
            networkStatus.style.background = 'rgba(37, 99, 235, 0.9)';
          }
        }
      };
      
      updateNetworkStatus();
      connection.addEventListener('change', updateNetworkStatus);
    }
    
    // 移动端性能监控
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;
    
    function updatePerformance() {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // 更新性能提示
        const performanceHint = document.querySelector('.performance-hint');
        if (performanceHint) {
          if (fps < 30) {
            performanceHint.textContent = `⚡ 性能较低 (${fps}fps)`;
            performanceHint.style.background = 'rgba(239, 68, 68, 0.9)';
            // 降低动画复杂度
            if (flowBands) {
              flowBands.style.opacity = '0.4';
            }
          } else if (fps < 50) {
            performanceHint.textContent = `⚡ 性能一般 (${fps}fps)`;
            performanceHint.style.background = 'rgba(245, 158, 11, 0.9)';
          } else {
            performanceHint.textContent = `⚡ 性能良好 (${fps}fps)`;
            performanceHint.style.background = 'rgba(16, 185, 129, 0.9)';
          }
        }
      }
      
      requestAnimationFrame(updatePerformance);
    }
    
    // 启动性能监控
    updatePerformance();
    
    // 移动端资源加载优化
    if ('IntersectionObserver' in window) {
      // 图片懒加载
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      });
      
      // 观察所有图片
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
    
    // 移动端预加载优化
    if ('connection' in navigator) {
      const connection = navigator.connection;
      if (connection.effectiveType === '4g' || connection.effectiveType === '5g') {
        // 高速网络时预加载资源
        const preloadLinks = [
          'statics/bg.jpg',
          'statics/logofinal.png',
          'statics/logo.png'
        ];
        
        preloadLinks.forEach(src => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          document.head.appendChild(link);
        });
      }
    }
    
    // 内存使用监控
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        
        if (usedMB > totalMB * 0.8) {
          // 内存使用过高时优化
          console.warn('内存使用过高，正在优化...');
          if (flowBands) {
            flowBands.style.opacity = '0.3';
          }
        }
      }, 5000);
    }
    
    // 移动端错误处理
    window.addEventListener('error', function(e) {
      console.error('页面错误:', e.error);
      
      // 显示错误提示
      const errorHint = document.createElement('div');
      errorHint.className = 'error-hint';
      errorHint.textContent = '⚠️ 页面出现错误，请刷新重试';
      errorHint.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        text-align: center;
      `;
      
      document.body.appendChild(errorHint);
      
      setTimeout(() => {
        errorHint.remove();
      }, 5000);
    });
    
    // 移动端离线支持
    window.addEventListener('online', function() {
      console.log('网络已连接');
      document.body.classList.remove('offline');
      
      // 显示网络恢复提示
      const onlineHint = document.createElement('div');
      onlineHint.className = 'online-hint';
      onlineHint.textContent = '✅ 网络已恢复';
      onlineHint.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 12px;
        z-index: 10000;
      `;
      
      document.body.appendChild(onlineHint);
      
      setTimeout(() => {
        onlineHint.remove();
      }, 3000);
    });
    
    window.addEventListener('offline', function() {
      console.log('网络已断开');
      document.body.classList.add('offline');
      
      // 显示离线提示
      const offlineHint = document.createElement('div');
      offlineHint.className = 'offline-hint';
      offlineHint.textContent = '📡 网络已断开，部分功能可能受限';
      offlineHint.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 12px;
        z-index: 10000;
        max-width: 200px;
        text-align: center;
      `;
      
      document.body.appendChild(offlineHint);
      
      // 离线时降低动画复杂度
      if (flowBands) {
        flowBands.style.opacity = '0.2';
      }
    });
    
    // 移动端页面可见性优化
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        // 页面不可见时暂停动画
        if (flowBands) {
          flowBands.style.animationPlayState = 'paused';
        }
      } else {
        // 页面可见时恢复动画
        if (flowBands) {
          flowBands.style.animationPlayState = 'running';
        }
      }
    });
    
    console.log('✅ 移动端优化完成');
  }
  
  // 启动
  bindTerminalTriggers();
  renderNewsList();
  renderMembers();
  bindMembersCollapse();
  bindJoinCollapse();
  initCustomCursor();
  initTouchGestures();
  optimizeForMobile();
  runIntroAnimation();
})();

