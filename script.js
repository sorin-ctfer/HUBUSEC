(function () {
  const loader = document.getElementById('loader');
  const transitionStage = document.getElementById('transition');
  const mainStage = document.getElementById('main');
  const centerTitle = document.getElementById('center-title');
  const enterHint = loader ? loader.querySelector('.enter-hint') : null;

  let jumpTimer = null;
  let readyToEnter = false;
  let hasEntered = false;

  // 首页海报弹窗：初始化/显示/隐藏
  function initPosterModal() {
    const modal = document.getElementById('poster-modal');
    if (!modal) return;
    const inner = modal.querySelector('.modal-inner');
    // 点击内容区域不关闭
    if (inner && !inner.dataset.bound) {
      inner.addEventListener('click', (e) => e.stopPropagation());
      inner.addEventListener('pointerdown', (e) => e.stopPropagation());
      inner.dataset.bound = '1';
    }
    // 点击遮罩关闭
    if (!modal.dataset.bound) {
      const closeIfOverlay = (e) => {
        if (e.target === modal) hidePosterModal();
      };
      modal.addEventListener('click', closeIfOverlay);
      modal.addEventListener('pointerdown', closeIfOverlay);
      modal.dataset.bound = '1';
    }
  }

  function showHomePosterModal() {
    const modal = document.getElementById('poster-modal');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    startPosterCycle();
  }

  function hidePosterModal() {
    const modal = document.getElementById('poster-modal');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    stopPosterCycle();
  }

  // 弹窗海报循环：海报1s -> 闪屏1 0.25s -> 闪屏2 0.25s -> 海报...
  let posterCycleTimer = null;
  let posterCycleIndex = 0;
  const posterFrames = [
    { src: 'static/海报.png', duration: 1000 },
    { src: 'static/闪屏1.png', duration: 100 },
    { src: 'static/闪屏2.png', duration: 100 },
  ];

  function startPosterCycle() {
    const img = document.querySelector('#poster-modal .poster-image');
    const modal = document.getElementById('poster-modal');
    if (!img || !modal || modal.getAttribute('aria-hidden') === 'true') return;
    clearTimeout(posterCycleTimer);
    // 设置当前帧
    const frame = posterFrames[posterCycleIndex % posterFrames.length];
    img.src = frame.src;
    // 计划下一帧
    posterCycleTimer = setTimeout(() => {
      posterCycleIndex = (posterCycleIndex + 1) % posterFrames.length;
      startPosterCycle();
    }, frame.duration);
  }

  function stopPosterCycle() {
    clearTimeout(posterCycleTimer);
    posterCycleTimer = null;
    posterCycleIndex = 0;
    const img = document.querySelector('#poster-modal .poster-image');
    if (img) img.src = 'static/海报.png';
  }

  function onAnyKeyOrClick(ev) {
    if (!readyToEnter || hasEntered) return;
    hasEntered = true;
    startTransition();
  }

  function showEnterHint() {
    if (!loader) return;
    loader.classList.add('ready');
    readyToEnter = true;
    window.addEventListener('keydown', onAnyKeyOrClick, { once: true });
    window.addEventListener('pointerdown', onAnyKeyOrClick, { once: true });
  }

  function startLoader() {
    if (!loader) return;
    // 在丝线交织的时刻，让背景空心大字淡入
    setTimeout(() => loader.classList.add('interweave'), 700);
    // 准备进入提示
    setTimeout(showEnterHint, 2200);
  }

  function startTransition() {
    // 显示过渡界面
    transitionStage && transitionStage.setAttribute('aria-hidden', 'false');
    loader && loader.setAttribute('aria-hidden', 'true');

    // 触发三行情景快速流动
    requestAnimationFrame(() => {
      transitionStage && transitionStage.classList.add('run');
    });

    // 动画结束后进入主页面
    setTimeout(() => {
      transitionStage && transitionStage.setAttribute('aria-hidden', 'true');
      mainStage && mainStage.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => mainStage && mainStage.classList.add('show'));
      // 进入首页时显示海报弹窗
      showHomePosterModal();
      startMainInteractions();
    }, 1100);
  }

  function startMainInteractions() {
    // 启动打字机特效
    startTypewriter();
    
    // 添加HUBUSEC点击事件
    const centerTitle = document.getElementById('center-title');
    if (centerTitle) {
      centerTitle.addEventListener('click', startIntroSequence);
      centerTitle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startIntroSequence();
        }
      });
    }
    
    // 添加LOGO长按彩蛋事件
    initLogoLongPress();
  }

  function startTypewriter() {
    const typewriterText = document.getElementById('typewriter-text');
    if (!typewriterText) return;

    const texts = [
      '湖北大学网络空间安全协会',
      '点击HUBUSEC查看详情', 
      '长按LOGO试试看',
      '扣666',
      '今天官网有些不一样啊'
    ];
    
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let isPausing = false;
    
    function typeStep() {
      const currentText = texts[currentTextIndex];
      
      if (isPausing) {
        setTimeout(() => {
          isPausing = false;
          isDeleting = true;
          typeStep();
        }, 2000); // 停顿2秒
        return;
      }
      
      if (isDeleting) {
        // 删除字符
        currentCharIndex--;
        typewriterText.textContent = currentText.substring(0, currentCharIndex);
        
        if (currentCharIndex === 0) {
          isDeleting = false;
          currentTextIndex = (currentTextIndex + 1) % texts.length;
          setTimeout(typeStep, 300); // 删除完后短暂停顿
        } else {
          setTimeout(typeStep, 50); // 删除速度
        }
      } else {
        // 添加字符
        currentCharIndex++;
        typewriterText.textContent = currentText.substring(0, currentCharIndex);
        
        if (currentCharIndex === currentText.length) {
          isPausing = true;
          setTimeout(typeStep, 100);
        } else {
          setTimeout(typeStep, 100); // 打字速度
        }
      }
    }
    
    // 开始打字机效果
    typeStep();
  }

  function startIntroSequence() {
    const mainStage = document.getElementById('main');
    const transitionStage = document.getElementById('transition');
    const introStage = document.getElementById('intro-stage');
    
    if (!mainStage || !transitionStage || !introStage) return;
    
    // 隐藏主页面
    mainStage.setAttribute('aria-hidden', 'true');
    
    // 确保过渡元素处于初始状态
    transitionStage.classList.remove('run');
    
    // 显示过渡动画（复用原有的三行滚动）
    transitionStage.setAttribute('aria-hidden', 'false');
    
    // 延迟一下再触发动画，确保元素显示完成
    setTimeout(() => {
      transitionStage.classList.add('run');
    }, 100);
    
    // 过渡动画结束后显示协会介绍界面
    setTimeout(() => {
      transitionStage.setAttribute('aria-hidden', 'true');
      transitionStage.classList.remove('run');
      
      introStage.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => {
        introStage.classList.add('show');
      });
      
      // 启动终端加载动画
      startTerminalLoading();
    }, 2200); // 给足够的时间让过渡动画完成
  }

  function startTerminalLoading() {
    const asciiArt = document.getElementById('ascii-art');
    const loadingMessages = document.getElementById('loading-messages');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (!asciiArt || !loadingMessages) return;
    
    // HUBUSEC ASCII 艺术字
    const asciiText = `██╗  ██╗██╗   ██╗██████╗ ██╗   ██╗███████╗███████╗ ██████╗
██║  ██║██║   ██║██╔══██╗██║   ██║██╔════╝██╔════╝██╔════╝
███████║██║   ██║██████╔╝██║   ██║███████╗█████╗  ██║     
██╔══██║██║   ██║██╔══██╗██║   ██║╚════██║██╔══╝  ██║     
██║  ██║╚██████╔╝██████╔╝╚██████╔╝███████║███████╗╚██████╗
╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝ ╚═════╝
                                                          `;
    
    // 加载消息列表
    const messages = [
      { text: '初始化 HUBUSEC 系统模块...', type: 'normal', delay: 500 },
      { text: '加载网络安全数据库...', type: 'normal', delay: 800 },
      { text: '配置安全连接协议...', type: 'warning', delay: 1200 },
      { text: '验证用户访问权限...', type: 'normal', delay: 1000 },
      { text: '加载协会信息数据...', type: 'normal', delay: 900 },
      { text: '解析组织架构配置...', type: 'normal', delay: 700 },
      { text: '连接协会主服务器...', type: 'normal', delay: 800 },
      { text: '加载成员数据与权限...', type: 'warning', delay: 600 },
      { text: '优化页面渲染性能...', type: 'normal', delay: 500 },
      { text: 'HUBUSEC 系统加载完成!', type: 'success', delay: 400 }
    ];
    
    let currentStep = 0;
    
    // 打字机显示ASCII艺术
    function typeAsciiArt() {
      let i = 0;
      const speed = 2; // 每次显示2个字符
      
      function typeChar() {
        if (i < asciiText.length) {
          asciiArt.textContent = asciiText.substring(0, i + speed);
          i += speed;
          setTimeout(typeChar, 20);
        } else {
          setTimeout(showMessages, 500);
        }
      }
      
      typeChar();
    }
    
    // 显示加载消息
    function showMessages() {
      if (currentStep < messages.length) {
        const message = messages[currentStep];
        const messageEl = document.createElement('div');
        messageEl.className = `loading-message ${message.type}`;
        messageEl.textContent = message.text;
        loadingMessages.appendChild(messageEl);
        
        currentStep++;
        
        // 在显示第5个消息时开始显示进度条
        if (currentStep === 5 && progressContainer) {
          progressContainer.style.display = 'flex';
          startProgress();
        }
        
        setTimeout(showMessages, message.delay);
      } else {
        // 所有消息显示完成，等待进度条完成
        setTimeout(() => {
          finishLoading();
        }, 1000);
      }
    }
    
    // 进度条动画
    function startProgress() {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // 随机增加
        if (progress > 100) progress = 100;
        
        if (progressFill && progressText) {
          progressFill.style.width = progress + '%';
          progressText.textContent = Math.floor(progress) + '%';
        }
        
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);
    }
    
    // 完成加载，显示内容
    function finishLoading() {
      const terminalLoader = document.getElementById('terminal-loader');
      const contentSections = document.querySelectorAll('.content-section');
      
      if (terminalLoader) {
        terminalLoader.style.opacity = '0';
        terminalLoader.style.transform = 'scale(0.95)';
        terminalLoader.style.transition = 'opacity 600ms var(--ease-smooth), transform 600ms var(--ease-smooth)';
        
        setTimeout(() => {
          terminalLoader.style.display = 'none';
          
          // 显示默认内容区域
          const defaultSection = document.getElementById('section-about');
          const contentPanel = document.querySelector('.content-panel');
          
          if (defaultSection && contentPanel) {
            defaultSection.style.display = 'block';
            contentPanel.classList.add('content-loaded');
            setTimeout(() => {
              defaultSection.classList.add('show');
            }, 100);
          }
          
          // 初始化交互
          initIntroInteractions();
        }, 600);
      }
    }
    
    // 开始动画
    setTimeout(typeAsciiArt, 300);
  }

  function showTerminalAndLoadContent(targetSection) {
    const terminalLoader = document.getElementById('terminal-loader');
    const targetContentSection = document.getElementById(`section-${targetSection}`);
    
    if (!terminalLoader || !targetContentSection) return;
    
    // 显示终端加载器
    terminalLoader.style.display = 'block';
    terminalLoader.style.opacity = '0';
    terminalLoader.style.transform = 'scale(1.05)';
    
    requestAnimationFrame(() => {
      terminalLoader.style.transition = 'opacity 400ms var(--ease-smooth), transform 400ms var(--ease-smooth)';
      terminalLoader.style.opacity = '1';
      terminalLoader.style.transform = 'scale(1)';
    });
    
    // 重置终端内容
    const asciiArt = document.getElementById('ascii-art');
    const loadingMessages = document.getElementById('loading-messages');
    const progressContainer = document.getElementById('progress-container');
    
    if (asciiArt) asciiArt.textContent = '';
    if (loadingMessages) loadingMessages.innerHTML = '';
    if (progressContainer) {
      progressContainer.style.display = 'none';
      const progressFill = document.getElementById('progress-fill');
      const progressText = document.getElementById('progress-text');
      if (progressFill) progressFill.style.width = '0%';
      if (progressText) progressText.textContent = '0%';
    }
    
    // 简化的加载动画（不显示ASCII艺术）
    const quickMessages = [
      { text: '切换至目标模块...', type: 'normal', delay: 300 },
      { text: '加载相关数据...', type: 'normal', delay: 400 },
      { text: '渲染页面内容...', type: 'warning', delay: 300 },
      { text: '加载完成!', type: 'success', delay: 200 }
    ];
    
    let step = 0;
    
    function showQuickMessage() {
      if (step < quickMessages.length) {
        const message = quickMessages[step];
        const messageEl = document.createElement('div');
        messageEl.className = `loading-message ${message.type}`;
        messageEl.textContent = message.text;
        if (loadingMessages) loadingMessages.appendChild(messageEl);
        
        step++;
        
        // 在第2步开始显示进度条
        if (step === 2 && progressContainer) {
          progressContainer.style.display = 'flex';
          startQuickProgress();
        }
        
        setTimeout(showQuickMessage, message.delay);
      } else {
        // 加载完成，显示目标内容
        setTimeout(() => {
          finishQuickLoading(targetContentSection);
        }, 500);
      }
    }
    
    function startQuickProgress() {
      let progress = 0;
      const progressFill = document.getElementById('progress-fill');
      const progressText = document.getElementById('progress-text');
      
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 10;
        if (progress > 100) progress = 100;
        
        if (progressFill && progressText) {
          progressFill.style.width = progress + '%';
          progressText.textContent = Math.floor(progress) + '%';
        }
        
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 150);
    }
    
    function finishQuickLoading(targetContentSection) {
      // 隐藏终端加载器
      terminalLoader.style.opacity = '0';
      terminalLoader.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        terminalLoader.style.display = 'none';
        
        // 显示目标内容
        const contentPanel = document.querySelector('.content-panel');
        if (contentPanel) contentPanel.classList.add('content-loaded');
        
        targetContentSection.style.display = 'block';
        setTimeout(() => {
          targetContentSection.classList.add('show');
        }, 100);
      }, 400);
    }
    
    // 开始快速加载
    setTimeout(showQuickMessage, 200);
  }

  // LOGO长按彩蛋功能
  function initLogoLongPress() {
    const logo = document.getElementById('main-logo');
    const logoContainer = document.querySelector('.logo-container');
    const progressContainer = document.getElementById('press-progress-container');
    const progressFill = document.getElementById('press-progress-fill');
    const mainStage = document.getElementById('main');
    
    if (!logoContainer || !progressContainer || !progressFill || !mainStage) {
      return;
    }
    
    let pressTimer = null;
    let progressTimer = null;
    let progress = 0;
    let isPressed = false;
    let glitchSquares = [];
    
    function startPress() {
      if (isPressed) return;
      isPressed = true;
      progress = 0;
      
      progressContainer.classList.add('show');
      progressFill.style.width = '10%';
      
      progressTimer = setInterval(() => {
        progress += 1.2;
        progressFill.style.width = Math.min(progress, 100) + '%';
        
        // 根据进度添加震动效果
        if (progress > 20 && progress <= 50) {
          mainStage.className = 'stage stage--main shake-light';
          addGlitchSquares(1);
        } else if (progress > 50 && progress <= 80) {
          mainStage.className = 'stage stage--main shake-medium';
          addGlitchSquares(2);
        } else if (progress > 80 && progress < 100) {
          mainStage.className = 'stage stage--main shake-heavy';
          addGlitchSquares(3);
        }
        
        if (progress >= 100) {
          clearInterval(progressTimer);
          triggerSecretEasterEgg();
        }
      }, 36);
    }
    
    function stopPress() {
      if (!isPressed) return;
      isPressed = false;
      
      if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
      }
      const decreaseTimer = setInterval(() => {
        progress -= 3;
        if (progress <= 0) {
          progress = 0;
          progressFill.style.width = '0%';
          progressContainer.classList.remove('show');
          mainStage.className = 'stage stage--main';
          clearGlitchSquares();
          clearInterval(decreaseTimer);
        } else {
          progressFill.style.width = progress + '%';
          removeRandomGlitchSquares();
        }
      }, 50);
    }
    
    function addGlitchSquares(count) {
      for (let i = 0; i < count; i++) {
        const square = document.createElement('div');
        square.className = 'glitch-square';
        
        const size = Math.random() * 30 + 10;
        const x = Math.random() * (window.innerWidth - size);
        const y = Math.random() * (window.innerHeight - size);
        
        square.style.width = size + 'px';
        square.style.height = size + 'px';
        square.style.left = x + 'px';
        square.style.top = y + 'px';
        
        document.body.appendChild(square);
        glitchSquares.push(square);
      }
    }
    
    function removeRandomGlitchSquares() {
      if (glitchSquares.length > 0) {
        const removeCount = Math.min(2, glitchSquares.length);
        for (let i = 0; i < removeCount; i++) {
          const index = Math.floor(Math.random() * glitchSquares.length);
          const square = glitchSquares[index];
          if (square && square.parentNode) {
            square.parentNode.removeChild(square);
          }
          glitchSquares.splice(index, 1);
        }
      }
    }
    
    function clearGlitchSquares() {
      glitchSquares.forEach(square => {
        if (square && square.parentNode) {
          square.parentNode.removeChild(square);
        }
      });
      glitchSquares = [];
    }
    
    function resetSecretStage() {
      const secretStage = document.getElementById('secret-stage');
      if (!secretStage) return;
      
      // 恢复初始HTML结构
      secretStage.innerHTML = `
        <div class="glitch-overlay" id="glitch-overlay"></div>
        <div class="secret-content">
          <div class="secret-message" id="secret-message"></div>
          <div class="secret-cursor" id="secret-cursor">_</div>
        </div>
      `;
      
      // 移除show类
      const glitchOverlay = document.getElementById('glitch-overlay');
      if (glitchOverlay) {
        glitchOverlay.classList.remove('show');
      }
    }
    
    function triggerSecretEasterEgg() {
      const secretStage = document.getElementById('secret-stage');
      let glitchOverlay = document.getElementById('glitch-overlay');
      
      if (!secretStage) return;
      
      // 确保彩蛋界面是干净的初始状态
      resetSecretStage();
      
      // 重新获取glitch overlay元素（因为resetSecretStage重建了DOM）
      glitchOverlay = document.getElementById('glitch-overlay');
      if (!glitchOverlay) return;
      
      // 隐藏主页面
      mainStage.setAttribute('aria-hidden', 'true');
      
      // 显示隐藏界面
      secretStage.setAttribute('aria-hidden', 'false');
      glitchOverlay.classList.add('show');
      
      // 延迟后开始打字机效果
      setTimeout(() => {
        startSecretMessage();
      }, 1000);
    }
    
    logoContainer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startPress();
    });
    logoContainer.addEventListener('mouseup', (e) => {
      stopPress();
    });
    logoContainer.addEventListener('mouseleave', (e) => {
      stopPress();
    });
    
    logoContainer.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startPress();
    });
    logoContainer.addEventListener('touchend', (e) => {
      e.preventDefault();
      stopPress();
    });
    logoContainer.addEventListener('touchcancel', (e) => {
      stopPress();
    });
  }
  
  function startSecretMessage() {
    const messageEl = document.getElementById('secret-message');
    const cursorEl = document.getElementById('secret-cursor');
    
    if (!messageEl || !cursorEl) return;
    
    // 重置彩蛋界面内容
    messageEl.textContent = '';
    cursorEl.style.display = 'inline';
    
    // 显示"我一直在等你"打字效果
    const waitingMessage = '我一直在等你';
    let currentIndex = 0;
    
    function typeWaitingChar() {
      if (currentIndex < waitingMessage.length) {
        messageEl.textContent = waitingMessage.substring(0, currentIndex + 1);
        currentIndex++;
        setTimeout(typeWaitingChar, 200);
      } else {
        // 打字完成，等待3秒后开始CTF彩蛋
        setTimeout(() => {
          startCtfEasterEgg();
        }, 3000);
      }
    }
    
    typeWaitingChar();
  }
  
  function startCtfEasterEgg() {
    const secretStage = document.getElementById('secret-stage');
    const messageEl = document.getElementById('secret-message');
    
    if (!secretStage || !messageEl) return;
    
    secretStage.innerHTML = '';
    
    const ctfContainer = document.createElement('div');
    ctfContainer.className = 'ctf-easter-egg-container';
    ctfContainer.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: #000;
      color: #fff;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      text-align: center;
      padding: 40px;
    `;
    
    const typeContainer = document.createElement('div');
    typeContainer.className = 'ctf-type-container';
    typeContainer.style.cssText = `
      font-size: 24px;
      line-height: 1.6;
      margin-bottom: 40px;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    `;
    
    ctfContainer.appendChild(typeContainer);
    secretStage.appendChild(ctfContainer);
    
    typeCtfMessage(typeContainer);
  }
  
  function typeCtfMessage(container) {
    const messages = [
      { text: '你知道CTF吗？', delay: 100, pause: 2000 },
      { text: '这是flag：HUBUCTF{w3lc0me_t0_0ur_w0rld}', delay: 80, pause: 2000 }
    ];
    
    let messageIndex = 0;
    
    function typeMessage() {
      if (messageIndex >= messages.length) {
        showFlagInput(container);
        return;
      }
      
      const currentMessage = messages[messageIndex];
      const messageEl = document.createElement('div');
      messageEl.style.cssText = `
        margin-bottom: 20px;
        font-size: ${messageIndex === 0 ? '28px' : '24px'};
        color: #fff;
        text-shadow: 0 0 10px #fff;
      `;
      
      container.appendChild(messageEl);
      
      let charIndex = 0;
      
      function typeChar() {
        if (charIndex < currentMessage.text.length) {
          messageEl.textContent = currentMessage.text.substring(0, charIndex + 1);
          charIndex++;
          setTimeout(typeChar, currentMessage.delay);
        } else {
          setTimeout(() => {
            messageIndex++;
            typeMessage();
          }, currentMessage.pause);
        }
      }
      
      typeChar();
    }
    
    typeMessage();
  }
  
  function showFlagInput(container) {
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      margin-top: 40px;
    `;
    
          const hint = document.createElement('div');
    hint.textContent = '你知道应该做什么：';
          hint.style.cssText = `
      color: #fff;
      font-size: 20px;
      margin-bottom: 10px;
    `;
    
    const flagInput = document.createElement('input');
    flagInput.type = 'text';
    flagInput.placeholder = 'HUBUCTF{...}';
    flagInput.style.cssText = `
      padding: 12px 20px;
      font-size: 18px;
      border: 2px solid #fff;
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      border-radius: 8px;
      width: 400px;
      text-align: center;
      outline: none;
    `;
    
    const submitBtn = document.createElement('button');
    submitBtn.textContent = '提交';
    submitBtn.style.cssText = `
      padding: 12px 30px;
      font-size: 18px;
      background: #fff;
      color: #000;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s ease;
    `;
    
    submitBtn.addEventListener('mouseenter', () => {
      submitBtn.style.background = '#ccc';
      submitBtn.style.transform = 'scale(1.05)';
    });
    
    submitBtn.addEventListener('mouseleave', () => {
      submitBtn.style.background = '#fff';
      submitBtn.style.transform = 'scale(1)';
    });
    
    inputContainer.appendChild(hint);
    inputContainer.appendChild(flagInput);
    inputContainer.appendChild(submitBtn);
    container.appendChild(inputContainer);
    
    // 移动端不自动聚焦，避免弹出虚拟键盘
    const isMobileFlag = window.innerWidth <= 768;
    if (!isMobileFlag) {
      flagInput.focus();
    }
    
    function checkFlag() {
      const input = flagInput.value.trim();
      if (input === 'HUBUCTF{w3lc0me_t0_0ur_w0rld}') {
        startStoryAnimation(container);
      } else {
        showError(inputContainer, '错误的flag，请重试！');
      }
    }
    
    submitBtn.addEventListener('click', checkFlag);
    flagInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        checkFlag();
      }
    });
  }
  
  function showError(container, message) {
    const existingError = container.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    errorEl.style.cssText = `
      color: #ff4444;
      font-size: 16px;
      margin-top: 10px;
      animation: shake 0.5s ease-in-out;
    `;
    
    container.appendChild(errorEl);
    
    setTimeout(() => {
      if (errorEl.parentNode) {
        errorEl.remove();
      }
    }, 3000);
  }
  
  function startStoryAnimation(container) {
    container.innerHTML = '';
    
    // 播放背景音乐
    const audio = new Audio('static/music.mp3');
    audio.loop = true; // 循环播放
    audio.volume = 0.5; // 设置音量为50%
    audio.play().catch(e => {
      // 音频播放失败
    });
    
    const storyTexts = [
      '这是属于你的故事',
      '关于漫长和坚持',
      '关于放弃与坚定',
      '关于勇气和梦想的故事'
    ];
    
    let storyIndex = 0;
    
    function showStoryText() {
      if (storyIndex >= storyTexts.length) {
        setTimeout(() => {
          startLinuxTerminal(container);
        }, 2000);
        return;
      }
      
      const storyEl = document.createElement('div');
      storyEl.textContent = storyTexts[storyIndex];
      storyEl.style.cssText = `
        font-size: 32px;
        color: #fff;
        opacity: 0;
        transform: translateY(20px);
        transition: all 1s ease-in-out;
        margin: 20px 0;
        text-align: center;
      `;
      
      container.appendChild(storyEl);
      
      setTimeout(() => {
        storyEl.style.opacity = '1';
        storyEl.style.transform = 'translateY(0)';
      }, 100);
      
      setTimeout(() => {
        storyEl.style.opacity = '0';
        storyEl.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
          if (storyEl.parentNode) {
            storyEl.remove();
          }
          storyIndex++;
          showStoryText();
        }, 1000);
      }, 3000);
    }
    
    container.style.background = '#000';
    setTimeout(showStoryText, 1000);
  }
  
  function startLinuxTerminal(container) {
    container.innerHTML = '';
    
    // 检查是否为移动端
    const isMobile = window.innerWidth <= 768;
    const mobileAscii = `HUBUSEC
Network Security Association
Hubei University`;
    
    const terminalContainer = document.createElement('div');
    terminalContainer.className = 'ctf-terminal-container';
    terminalContainer.style.cssText = `
      width: 100%;
      height: 100%;
      background: #000;
      color: #fff;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 16px;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    `;
    
    const asciiTitle = document.createElement('div');
    asciiTitle.style.cssText = `
      color: #fff;
      font-size: 12px;
      line-height: 1;
      white-space: pre;
      margin-bottom: 20px;
      text-align: center;
    `;
    
    const hubusecAscii = `██╗  ██╗██╗   ██╗██████╗ ██╗   ██╗███████╗███████╗ ██████╗
██║  ██║██║   ██║██╔══██╗██║   ██║██╔════╝██╔════╝██╔════╝
███████║██║   ██║██████╔╝██║   ██║███████╗█████╗  ██║     
██╔══██║██║   ██║██╔══██╗██║   ██║╚════██║██╔══╝  ██║     
██║  ██║╚██████╔╝██████╔╝╚██████╔╝███████║███████╗╚██████╗
╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝ ╚═════╝
                                                          `;
    
    let asciiIndex = 0;
    const displayAscii = isMobile ? mobileAscii : hubusecAscii;
    
    function typeAscii() {
      if (asciiIndex < displayAscii.length) {
        asciiTitle.textContent = displayAscii.substring(0, asciiIndex + (isMobile ? 1 : 2));
        asciiIndex += (isMobile ? 1 : 2);
        setTimeout(typeAscii, isMobile ? 50 : 20);
      } else {
        setTimeout(() => {
          showWelcomeMessage();
        }, 500);
      }
    }
    
    const outputArea = document.createElement('div');
    outputArea.className = 'terminal-output';
    outputArea.style.cssText = `
      flex: 1;
      margin-bottom: 10px;
      white-space: pre-wrap;
      overflow-y: auto;
    `;
    
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      display: flex;
      align-items: center;
      margin-top: 10px;
    `;
    
    const prompt = document.createElement('span');
    prompt.textContent = 'HUBUCTF@ctfer:~$ ';
    prompt.style.cssText = `
      color: #fff;
      white-space: nowrap;
    `;
    
    const commandInput = document.createElement('input');
    commandInput.type = 'text';
    commandInput.style.cssText = `
      background: transparent;
      border: none;
      color: #fff;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 16px;
      outline: none;
      flex: 1;
      margin-left: 5px;
    `;
    
    inputContainer.appendChild(prompt);
    inputContainer.appendChild(commandInput);
    
    terminalContainer.appendChild(asciiTitle);
    terminalContainer.appendChild(outputArea);
    terminalContainer.appendChild(inputContainer);
    container.appendChild(terminalContainer);
    
    const fileSystem = {
      'help.txt': 'You can use "ls", "cat" and "echo".',
      'HUBUSEC': isMobile ? mobileAscii : hubusecAscii,
      'sorin.txt': 'Just submit the flag directly',
      'flag': 'HUBUCTF{y0u_C3pt6re_th3_f1aggg}'
    };
    
    // 命令处理函数
    function processCommand(command) {
      const trimmed = command.trim().toLowerCase();
      
      // 添加命令到输出
      outputArea.textContent += `HUBUCTF@ctfer:~$ ${command}\n`;
      
      if (trimmed.includes('help')) {
        outputArea.textContent += 'You can use "ls", "cat" and "echo".\n\n';
      } else if (trimmed.includes('ls')) {
        outputArea.textContent += 'help.txt\nHUBUSEC\nsorin.txt\nflag\n\n';
      } else if (trimmed.includes('cat')) {
        const parts = command.trim().split(/\s+/);
        if (parts.length > 1) {
          const filename = parts[1];
          if (fileSystem[filename]) {
            outputArea.textContent += fileSystem[filename] + '\n\n';
          } else {
            outputArea.textContent += `cat: ${filename}: No such file or directory\n\n`;
          }
        } else {
          outputArea.textContent += 'cat: missing file operand\n\n';
        }
      } else if (trimmed.includes('echo')) {
        const echoText = command.substring(command.toLowerCase().indexOf('echo') + 4).trim();
        outputArea.textContent += echoText + '\n\n';
      } else if (trimmed === 'hubuctf{y0u_c3pt6re_th3_f1aggg}') {
        // 用户输入了正确的flag
        const winMessage = document.createElement('div');
        winMessage.textContent = 'You Win！';
        winMessage.style.cssText = `
          color: #fff;
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
        `;
        outputArea.appendChild(winMessage);
        outputArea.textContent += '\n';
        
        // 等待几秒后显示最终故事
        setTimeout(() => {
          showFinalStory(container);
        }, 3000);
        return;
      } else if (trimmed !== '') {
        outputArea.textContent += 'You can enter "help" to view the help\n\n';
      }
      
      // 滚动到底部
      outputArea.scrollTop = outputArea.scrollHeight;
    }
    
    // 欢迎信息
    function showWelcomeMessage() {
      outputArea.textContent += '你记得Linux如何使用吗，试试看\n\n';
      // 移动端不自动聚焦输入框，避免弹出虚拟键盘
      if (!isMobile) {
        commandInput.focus();
      }
    }
    
    // 添加输入事件监听
    commandInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const command = commandInput.value;
        processCommand(command);
        commandInput.value = '';
      }
    });
    
    // 移动端添加点击聚焦
    if (isMobile) {
      commandInput.addEventListener('click', () => {
        commandInput.focus();
      });
    }
    
    // 开始打字动画
    typeAscii();
  }
  
  function showFinalStory(container) {
    // 清空容器
    container.innerHTML = '';
    
    // 创建最终故事容器
    const finalContainer = document.createElement('div');
    finalContainer.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: #000;
      color: #fff;
      text-align: center;
      padding: 40px;
    `;
    
    // 第一行文字
    const storyLine1 = document.createElement('div');
    storyLine1.textContent = '故事很长，征途很远';
    storyLine1.style.cssText = `
      font-size: 36px;
      margin-bottom: 40px;
      opacity: 0;
      transform: translateY(20px);
      transition: all 1s ease-in-out;
    `;
    
    // 官网链接
    const websiteLink = document.createElement('div');
    websiteLink.style.cssText = `
      margin-bottom: 40px;
      opacity: 0;
      transform: translateY(20px);
      transition: all 1s ease-in-out;
    `;
    
    const linkText = document.createElement('div');
    linkText.textContent = '我们的CTF官网：';
    linkText.style.cssText = `
      font-size: 20px;
      margin-bottom: 10px;
      color: #ccc;
    `;
    
    const link = document.createElement('a');
    link.href = 'https://hubuctf.cn/';
    link.textContent = 'https://hubuctf.cn/';
    link.target = '_blank';
    link.style.cssText = `
      font-size: 24px;
      color: #fff;
      text-decoration: none;
      border-bottom: 2px solid #fff;
      padding-bottom: 2px;
      transition: all 0.3s ease;
    `;
    
    link.addEventListener('mouseenter', () => {
      link.style.color = '#ccc';
      link.style.borderColor = '#ccc';
    });
    
    link.addEventListener('mouseleave', () => {
      link.style.color = '#fff';
      link.style.borderColor = '#fff';
    });
    
    websiteLink.appendChild(linkText);
    websiteLink.appendChild(link);
    
    // 返回按钮
    const returnBtn = document.createElement('button');
    returnBtn.textContent = '返回主界面';
    returnBtn.style.cssText = `
      padding: 15px 30px;
      font-size: 18px;
      background: linear-gradient(135deg, #ff7a7a, #7aa8ff);
      color: white;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(20px);
      box-shadow: 0 4px 15px rgba(255, 122, 122, 0.3);
    `;
    
    returnBtn.addEventListener('mouseenter', () => {
      returnBtn.style.transform = 'translateY(15px) scale(1.05)';
      returnBtn.style.boxShadow = '0 6px 20px rgba(255, 122, 122, 0.4)';
    });
    
    returnBtn.addEventListener('mouseleave', () => {
      returnBtn.style.transform = 'translateY(20px) scale(1)';
      returnBtn.style.boxShadow = '0 4px 15px rgba(255, 122, 122, 0.3)';
    });
    
    returnBtn.addEventListener('click', () => {
      returnToMain();
    });
    
    finalContainer.appendChild(storyLine1);
    finalContainer.appendChild(websiteLink);
    finalContainer.appendChild(returnBtn);
    container.appendChild(finalContainer);
    
    // 依次显示元素
    setTimeout(() => {
      storyLine1.style.opacity = '1';
      storyLine1.style.transform = 'translateY(0)';
    }, 500);
    
    setTimeout(() => {
      websiteLink.style.opacity = '1';
      websiteLink.style.transform = 'translateY(0)';
    }, 1500);
    
    setTimeout(() => {
      returnBtn.style.opacity = '1';
      returnBtn.style.transform = 'translateY(0)';
    }, 2500);
  }
  
  function returnToMain() {
    const secretStage = document.getElementById('secret-stage');
    const mainStage = document.getElementById('main');
    
    if (secretStage && mainStage) {
      secretStage.setAttribute('aria-hidden', 'true');
      mainStage.setAttribute('aria-hidden', 'false');
      // 返回首页时显示海报弹窗
      showHomePosterModal();
      
      // 重置状态
      const progressContainer = document.getElementById('press-progress-container');
      const progressFill = document.getElementById('press-progress-fill');
      
      if (progressContainer && progressFill) {
        progressContainer.classList.remove('show');
        progressFill.style.width = '0%';
      }
      
      mainStage.className = 'stage stage--main';
      
      // 清理所有黑色方块
      document.querySelectorAll('.glitch-square').forEach(square => {
        if (square.parentNode) {
          square.parentNode.removeChild(square);
        }
      });
      
      // 重置彩蛋界面到初始状态，确保可以重新进入
      resetSecretStage();
    }
  }

  function initIntroInteractions() {
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    const expandBtns = document.querySelectorAll('.expand-btn');
    const backBtn = document.querySelector('.back-btn');
    
    // 菜单切换交互
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetSection = item.dataset.section;
        
        // 更新活跃状态
        menuItems.forEach(mi => mi.classList.remove('active'));
        item.classList.add('active');
        
        // 隐藏所有内容区域
        contentSections.forEach(section => {
          section.style.display = 'none';
          section.classList.remove('show');
        });
        
        // 显示终端加载并加载目标内容
        showTerminalAndLoadContent(targetSection);
      });
    });
    
    // 成员列表展开/折叠
    expandBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetYear = btn.dataset.year;
        const memberList = document.getElementById(targetYear);
        
        if (memberList) {
          const isVisible = memberList.style.display !== 'none';
          
          if (isVisible) {
            memberList.style.opacity = '0';
            memberList.style.transition = 'opacity 300ms var(--ease-smooth)';
            setTimeout(() => {
              memberList.style.display = 'none';
              btn.textContent = '点击展开查看';
            }, 300);
          } else {
            memberList.style.display = 'grid';
            memberList.style.opacity = '0';
            btn.textContent = '点击折叠隐藏';
            requestAnimationFrame(() => {
              memberList.style.transition = 'opacity 400ms var(--ease-smooth)';
              memberList.style.opacity = '1';
            });
          }
        }
      });
    });
    
    // 返回按钮交互
    if (backBtn) {
      backBtn.addEventListener('click', startBackToMain);
      backBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startBackToMain();
        }
      });
    }
  }

  function startBackToMain() {
    const introStage = document.getElementById('intro-stage');
    const transitionStage = document.getElementById('transition');
    const mainStage = document.getElementById('main');
    
    if (!introStage || !transitionStage || !mainStage) return;
    
    // 隐藏协会介绍界面
    introStage.classList.remove('show');
    
    setTimeout(() => {
      introStage.setAttribute('aria-hidden', 'true');
      
      // 显示返回过渡动画
      transitionStage.classList.remove('run');
      transitionStage.setAttribute('aria-hidden', 'false');
      
      setTimeout(() => {
        transitionStage.classList.add('run');
      }, 50);
      
      // 过渡动画结束后显示主页面
      setTimeout(() => {
        transitionStage.setAttribute('aria-hidden', 'true');
        transitionStage.classList.remove('run');
        mainStage.setAttribute('aria-hidden', 'false');
        // 返回首页时显示海报弹窗
        showHomePosterModal();
      }, 1900);
    }, 300);
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLoader, { once: true });
    document.addEventListener('DOMContentLoaded', initPosterModal, { once: true });
  } else {
    startLoader();
    initPosterModal();
  }
  
  // 全局键盘事件（ESC返回主页）
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const introStage = document.getElementById('intro-stage');
      
      if (introStage && !introStage.hasAttribute('aria-hidden')) {
        // 使用过渡动画返回主页面
        startBackToMain();
      }
    }
  });
  
  // 三连空格触发隐藏彩蛋（独立于LOGO长按）
  (function initTripleSpaceEasterEgg() {
    let spaceCount = 0;
    let lastSpaceTime = 0;
    let resetTimer = null;
    let active = false;
    let previousStageId = null;

    function getCurrentStageId() {
      const stages = ['loader', 'transition', 'main', 'intro-stage', 'secret-stage'];
      for (const id of stages) {
        const el = document.getElementById(id);
        if (el && el.getAttribute('aria-hidden') === 'false') return id;
      }
      return 'main';
    }

    function buildSecretScene() {
      const secretStage = document.getElementById('secret-stage');
      if (!secretStage) return;
      secretStage.innerHTML = `
        <div class="flash-layer" id="flash-layer"></div>
        <div class="secret-scroll-zone top">
          <div class="row">
            <div class="ticker bg-ticker">
              <span>HUBUCTF&nbsp;</span><span>HUBUCTF&nbsp;</span><span>HUBUCTF&nbsp;</span><span>HUBUCTF&nbsp;</span><span>HUBUCTF&nbsp;</span><span>HUBUCTF&nbsp;</span><span>HUBUCTF&nbsp;</span><span>HUBUCTF&nbsp;</span>
            </div>
          </div>
        </div>
        <div class="blue-band">
          <div class="cutout-text">HUBUCTF</div>
          <div class="fill-text" id="fill-text"></div>
        </div>
        <div class="secret-scroll-zone bottom">
          <div class="row">
            <div class="ticker bg-ticker">
              <span>HUBUCTF&nbsp;</span><span>HUBUCTF&nbsp;</span><span>HUBUCTF&nbsp;</span><span>HUBUCTF&nbsp;</span><span>HUBUCTF&nbsp;</span><span>HUBUCTF&nbsp;</span><span>HUBUCTF&nbsp;</span><span>HUBUCTF&nbsp;</span>
            </div>
          </div>
        </div>
        <div class="type-prompt" id="type-prompt">
          <span class="hint">请输入</span>
          <span class="typed" id="typed-output"></span>
          <span class="cursor">|</span>
        </div>
        <div class="particle-layer" id="particle-layer"></div>
      `;
    }

    // 简单的8bit按键音（WebAudio方波）
    let audioCtx = null;
    // 完成输入后播放的CTF音乐（避免叠加播放）
    let ctfAudio = null;
    function playBeep() {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = 880 + Math.random() * 220; // 8bit随机小抖动
        gain.gain.value = 0.06;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        setTimeout(() => { osc.stop(); }, 110);
      } catch (e) {
        // 忽略音频失败
      }
    }

    function shakeOnce() {
      const secretStage = document.getElementById('secret-stage');
      if (!secretStage) return;
      secretStage.classList.add('shake-impact');
      setTimeout(() => secretStage.classList.remove('shake-impact'), 140);
    }

    function spawnParticles() {
      const layer = document.getElementById('particle-layer');
      const band = document.querySelector('.blue-band');
      if (!layer || !band) return;
      const rect = band.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      const count = 140; // 大量像素块弹射
      for (let i = 0; i < count; i++) {
        const px = document.createElement('div');
        px.className = 'pixel';
        const x = originX + (Math.random() - 0.5) * rect.width * 0.6;
        const y = originY + (Math.random() - 0.5) * rect.height * 0.6;
        px.style.left = x + 'px';
        px.style.top = y + 'px';
        const dx = (Math.random() - 0.5) * 680;
        const dy = (Math.random() - 0.5) * 360;
        const hue = 210 + Math.floor(Math.random() * 40);
        const light = 55 + Math.floor(Math.random() * 35);
        px.style.background = `hsl(${hue}, 100%, ${light}%)`;
        layer.appendChild(px);
        requestAnimationFrame(() => {
          px.style.transform = `translate(${dx}px, ${dy}px) scale(${0.6 + Math.random() * 0.5})`;
          px.style.opacity = '0';
        });
        setTimeout(() => { if (px.parentNode) px.parentNode.removeChild(px); }, 900);
      }
    }

    function startSequence() {
      if (active) return;
      active = true;
      previousStageId = getCurrentStageId();

      const secretStage = document.getElementById('secret-stage');
      const mainStage = document.getElementById('main');
      if (!secretStage || !mainStage) return;

      // 切换到隐藏彩蛋舞台
      mainStage.setAttribute('aria-hidden', 'true');
      secretStage.setAttribute('aria-hidden', 'false');

      // 构建场景与闪屏
      buildSecretScene();
      const flash = document.getElementById('flash-layer');
      if (flash) flash.classList.add('run');

      // 准备音乐：避免叠加播放，进入页面时重置
      try {
        if (!ctfAudio) {
          ctfAudio = new Audio('static/ctf.mp3');
          ctfAudio.preload = 'auto';
        }
        ctfAudio.pause();
        ctfAudio.currentTime = 0;
      } catch (e) {}

      // 2秒后确保滚动与条带显示（flash结束即黑场）
      setTimeout(() => {
        // 无需额外处理：元素已渲染并滚动
        startTyping();
      }, 2000);
    }

    function shakeVisibleStage() {
      const id = getCurrentStageId();
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add('shake-impact');
      setTimeout(() => el.classList.remove('shake-impact'), 140);
    }

    function finishAndReturn() {
      // 返回至主页面或之前的页面
      const introStage = document.getElementById('intro-stage');
      const mainStage = document.getElementById('main');
      const secretStage = document.getElementById('secret-stage');
      if (!secretStage || !mainStage) return;

      // 简洁处理：统一返回主页面
      secretStage.setAttribute('aria-hidden', 'true');
      mainStage.setAttribute('aria-hidden', 'false');
      // 返回首页时显示海报弹窗
      showHomePosterModal();
      active = false;
    }

    function runWitnessSequence() {
      const secretStage = document.getElementById('secret-stage');
      if (!secretStage) { finishAndReturn(); return; }

      // 构造黑屏与字幕容器
      const overlay = document.createElement('div');
      overlay.className = 'witness-overlay';
      const textEl = document.createElement('div');
      textEl.className = 'witness-text';
      overlay.appendChild(textEl);
      secretStage.appendChild(overlay);

      const phrases = ['见证', '湖北大学网络空间安全协会', '重新起航！'];

      // 逐条淡入/淡出
      let i = 0;
      function showNext() {
        if (i >= phrases.length) {
          // 进入小球交互阶段
          setTimeout(() => {
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            runCircleBallSequence();
          }, 280);
          return;
        }
        textEl.textContent = phrases[i];
        textEl.style.opacity = '0';
        // 淡入
        requestAnimationFrame(() => {
          textEl.style.opacity = '1';
        });
        // 保持显示后淡出
        setTimeout(() => {
          textEl.style.opacity = '0';
          setTimeout(() => {
            i++;
            showNext();
          }, 500);
        }, 1300);
      }

      // 先黑屏片刻再开始字幕
      setTimeout(showNext, 400);
    }

    function switchHomeToCTFVariant() {
      const centerTitleEl = document.getElementById('center-title');
      const mainLogoEl = document.getElementById('main-logo');
      if (centerTitleEl) centerTitleEl.textContent = 'HUBUCTF';
      if (mainLogoEl) {
        mainLogoEl.src = 'static/ctflogo.png';
        mainLogoEl.alt = 'HUBUCTF logo';
      }
    }

    function runCircleBallSequence() {
      const secretStage = document.getElementById('secret-stage');
      if (!secretStage) { finishAndReturn(); return; }
      const stage = document.createElement('div');
      stage.className = 'circle-stage';
      const expander = document.createElement('div');
      expander.className = 'white-expander';
      const frame = document.createElement('div');
      frame.className = 'circle-frame';
      const ball = document.createElement('div');
      ball.className = 'ball3d';
      // 成员名字叠层（黑区白字 / 白区黑字）
      const darkLayer = document.createElement('div');
      darkLayer.className = 'name-overlay name-overlay-dark';
      const lightLayer = document.createElement('div');
      lightLayer.className = 'name-overlay name-overlay-light';
      const controls = document.createElement('div');
      controls.className = 'circle-controls';
      const btnForward = document.createElement('button');
      btnForward.className = 'ctrl-btn';
      btnForward.type = 'button';
      btnForward.textContent = '前进';
      btnForward.setAttribute('aria-label', '前进');
      const btnBack = document.createElement('button');
      btnBack.className = 'ctrl-btn';
      btnBack.type = 'button';
      btnBack.textContent = '后退';
      btnBack.setAttribute('aria-label', '后退');
      controls.appendChild(btnForward);
      controls.appendChild(btnBack);
      // 按层级顺序添加：黑区名字层（0）→ 白区扩张层（1）→ 白区名字层（2，置于框之前）→ 圆框/小球（2）→ 控制按钮（4）
      stage.appendChild(darkLayer);
      stage.appendChild(expander);
      stage.appendChild(lightLayer);
      stage.appendChild(frame);
      frame.appendChild(ball);
      stage.appendChild(controls);
      secretStage.appendChild(stage);

      // 初始半径与最大半径（全屏填充）
      const w = secretStage.clientWidth || window.innerWidth;
      const h = secretStage.clientHeight || window.innerHeight;
      const maxR = Math.sqrt(w*w + h*h);
      const minR = Math.min(w, h) * 0.06; // 初始较小白圈
      let progress = 0; // 0→1 对应约 10 秒的前进过程
      let holdingUp = false;
      let holdingDown = false;
      let running = true;
      let last = performance.now();
      let currentR = minR;
      let disposed = false;

      // 采集历届成员姓名（使用“历届成员”面板中的真实数据）
      const collectNames = (years) => {
        const result = [];
        years.forEach((y) => {
          const list = document.getElementById(String(y));
          if (!list) return;
          list.querySelectorAll('.member-name').forEach((el) => {
            const t = (el.textContent || '').trim();
            if (t) result.push(t);
          });
        });
        return result;
      };
      const legacyNames = collectNames([2021, 2022, 2023]);
      const newNames = collectNames([2024, 2025]);

      // 随机位置与标签生成
      const rand = (min, max) => Math.random() * (max - min) + min;
      function createLabel(name, color) {
        const span = document.createElement('span');
        span.className = 'name-label';
        span.textContent = name;
        span.style.color = color;
        return span;
      }
      function tryPlace(layer, name, insideCircle) {
        const sw = stage.clientWidth;
        const sh = stage.clientHeight;
        const margin = 24; // 与白圈边缘的安全距离
        for (let i = 0; i < 28; i++) {
          const x = rand(40, sw - 40);
          const y = rand(40, sh - 40);
          const dx = x - sw / 2;
          const dy = y - sh / 2;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const ok = insideCircle ? (dist <= Math.max(0, currentR - margin)) : (dist >= currentR + margin);
          if (ok) {
            const el = createLabel(name, insideCircle ? '#000' : '#fff');
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            layer.appendChild(el);
            // 淡入
            requestAnimationFrame(() => { el.style.opacity = '1'; });
            // 持续一段时间后淡出并移除
            const hold = rand(800, 1600);
            const fade = rand(280, 640);
            setTimeout(() => {
              el.style.opacity = '0';
              setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, fade);
            }, hold);
            return true;
          }
        }
        return false;
      }
      // 循环随机生成名字（黑区：21/22/23 白色圈内：24/25）
      let darkTimer = 0;
      let lightTimer = 0;
      function scheduleDark() {
        if (disposed) return;
        darkTimer = setTimeout(() => {
          if (legacyNames.length) {
            const name = legacyNames[Math.floor(Math.random() * legacyNames.length)];
            tryPlace(darkLayer, name, false);
          }
          scheduleDark();
        }, rand(420, 980));
      }
      function scheduleLight() {
        if (disposed) return;
        lightTimer = setTimeout(() => {
          if (newNames.length) {
            const name = newNames[Math.floor(Math.random() * newNames.length)];
            tryPlace(lightLayer, name, true);
          }
          scheduleLight();
        }, rand(520, 1100));
      }
      scheduleDark();
      scheduleLight();

      // 初始位置（球在圆框内底部，稍大）
      expander.style.clipPath = `circle(${minR}px at 50% 50%)`;
      ball.style.position = 'absolute';
      ball.style.left = '50%';
      ball.style.bottom = '6%';
      ball.style.transform = 'translateX(-50%) scale(1.2)';

      function onKeyDown(e) {
        if (e.key === 'ArrowUp') {
          holdingUp = true;
        } else if (e.key === 'ArrowDown') {
          holdingDown = true;
        }
      }
      function onKeyUp(e) {
        if (e.key === 'ArrowUp') holdingUp = false;
        if (e.key === 'ArrowDown') holdingDown = false;
      }
      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('keyup', onKeyUp);

      // 移动端/鼠标：按钮按压保持前进/后退
      const fwDown = (e) => { e.preventDefault(); holdingUp = true; };
      const fwUp = () => { holdingUp = false; };
      const bkDown = (e) => { e.preventDefault(); holdingDown = true; };
      const bkUp = () => { holdingDown = false; };
      btnForward.addEventListener('pointerdown', fwDown, { passive: false });
      btnForward.addEventListener('pointerup', fwUp);
      btnForward.addEventListener('pointerleave', fwUp);
      btnForward.addEventListener('pointercancel', fwUp);
      btnBack.addEventListener('pointerdown', bkDown, { passive: false });
      btnBack.addEventListener('pointerup', bkUp);
      btnBack.addEventListener('pointerleave', bkUp);
      btnBack.addEventListener('pointercancel', bkUp);

      function updateScene(p) {
        // 更新白色扩张
        const r = minR + p * (maxR - minR);
        expander.style.clipPath = `circle(${r}px at 50% 50%)`;
        currentR = r;

        // 更新球位置与大小（从圆框底部向中心上移，并变小，模拟远去）
        const fh = frame.clientHeight;
        const bh = ball.clientHeight;
        const startBottom = Math.max(0, fh * 0.06);
        const centerBottom = Math.max(0, (fh - bh) / 2);
        const bottomPx = startBottom + p * (centerBottom - startBottom);
        const scale = 1.25 - 0.4 * p; // 由近到远缩小
        ball.style.bottom = `${Math.min(fh - bh, Math.max(0, bottomPx))}px`;
        ball.style.transform = `translateX(-50%) scale(${scale})`;
      }

      function loop(now) {
        if (!running) return;
        const dt = Math.max(0, now - last);
        last = now;
        if (holdingUp) {
          // 约 10 秒走完 0→1
          progress = Math.min(1, progress + dt / 10000);
        } else if (holdingDown) {
          progress = Math.max(0, progress - dt / 10000);
        }

        updateScene(progress);

        if (progress >= 0.999) {
          complete();
          return;
        }
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);

      function complete() {
        running = false;
        disposed = true;
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
        btnForward.removeEventListener('pointerdown', fwDown);
        btnForward.removeEventListener('pointerup', fwUp);
        btnForward.removeEventListener('pointerleave', fwUp);
        btnForward.removeEventListener('pointercancel', fwUp);
        btnBack.removeEventListener('pointerdown', bkDown);
        btnBack.removeEventListener('pointerup', bkUp);
        btnBack.removeEventListener('pointerleave', bkUp);
        btnBack.removeEventListener('pointercancel', bkUp);
        clearTimeout(darkTimer);
        clearTimeout(lightTimer);
        // 移除叠层
        if (darkLayer && darkLayer.parentNode) darkLayer.parentNode.removeChild(darkLayer);
        if (lightLayer && lightLayer.parentNode) lightLayer.parentNode.removeChild(lightLayer);
        expander.style.clipPath = `circle(${maxR}px at 50% 50%)`;

        const splash = document.createElement('div');
        splash.className = 'hubusec-splash';
        splash.textContent = 'HUBUSEC';
        stage.appendChild(splash);
        requestAnimationFrame(() => splash.classList.add('show'));

        // 2秒后淡出并进入首页（切换为CTF变体）
        setTimeout(() => {
          splash.style.opacity = '0';
          setTimeout(() => {
            if (stage && stage.parentNode) stage.parentNode.removeChild(stage);
            switchHomeToCTFVariant();
            finishAndReturn();
          }, 800);
        }, 2000);
      }
    }

    function startTyping() {
      const typedOut = document.getElementById('typed-output');
      const fillText = document.getElementById('fill-text');
      if (!typedOut) return;
      const target = 'HUBUCTF';
      let index = 0;
      let started = false;
      const palette = ['#ff5c7a','#ffd54f','#4dd0e1','#66bb6a','#ba68c8','#ff8a65','#29b6f6'];

      function onKey(e) {
        if (!active) return;
        if (e.key.length === 1) {
          const ch = e.key.toUpperCase();
          if (ch === target[index]) {
            typedOut.textContent = (typedOut.textContent || '') + ch;
            // 将彩色字母填充到条带镂空处
            if (fillText) {
              const span = document.createElement('span');
              span.className = 'ch';
              span.textContent = ch;
              span.style.color = palette[index % palette.length];
              fillText.appendChild(span);
            }
            index++;
            // 每个按键：震动+像素爆炸+音效
            shakeOnce();
            spawnParticles();
            playBeep();
            if (!started) {
              started = true;
            }
          if (index >= target.length) {
            document.removeEventListener('keydown', onKey);
            // 完成输入后自动播放音乐（不叠加，已在进入页面时重置）
            try {
              if (ctfAudio) {
                ctfAudio.pause();
                ctfAudio.currentTime = 0;
                const p = ctfAudio.play();
                if (p && typeof p.catch === 'function') p.catch(() => {});
              }
            } catch (e) {}
            // 执行黑屏与字幕淡入淡出序列
            runWitnessSequence();
          }
        } else {
          // 错误输入：仅震动与轻微音效提示
          shakeOnce();
          playBeep();
          }
        }
      }

      document.addEventListener('keydown', onKey);
    }

    // 监听三次“6”键
    document.addEventListener('keydown', (e) => {
      // 处于输入状态时，不再触发新的序列
      if (active) return;
      if (e.key === '6' || e.code === 'Digit6' || e.code === 'Numpad6') {
        // 每次按下 6 给出晃动提示
        shakeVisibleStage();
        const now = performance.now();
        if (lastSpaceTime === 0 || (now - lastSpaceTime) <= 380) {
          spaceCount++;
        } else {
          spaceCount = 1;
        }
        lastSpaceTime = now;
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => { spaceCount = 0; lastSpaceTime = 0; }, 420);
        if (spaceCount >= 3) {
          e.preventDefault();
          spaceCount = 0; lastSpaceTime = 0;
          startSequence();
        }
      } else {
        // 其他键打断连续性
        spaceCount = 0; lastSpaceTime = 0;
      }
    });
  })();

  // 增强交互效果
  document.addEventListener('mousemove', (e) => {
    const introStage = document.getElementById('intro-stage');
    if (introStage && !introStage.hasAttribute('aria-hidden')) {
      const verticalMenu = introStage.querySelector('.vertical-menu');
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      // 鼠标移入菜单栏时的微妙效果
      if (verticalMenu && mouseX < 240 && mouseY > 20) {
        verticalMenu.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
        verticalMenu.style.transform = 'translateY(0) scale(1.02)';
      } else if (verticalMenu) {
        verticalMenu.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        verticalMenu.style.transform = 'translateY(0) scale(1)';
      }
    }
  });
})();

// 性能优化：无障碍支持
 if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  // 监控内容元素
  document.addEventListener('DOMContentLoaded', () => {
    const observeElements = document.querySelectorAll('.research-item, .member-card, .department-item');
    observeElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 600ms var(--ease-smooth), transform 600ms var(--ease-smooth)';
      observer.observe(el);
    });
  });
}


