// 移动端菜单切换
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const searchButton = document.getElementById('search-button');
    const mobileSearchButton = document.getElementById('mobile-search-button');
    const searchContainer = document.getElementById('search-container');

    // 移动端菜单切换
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            const isHidden = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            
            // 更新 aria-expanded 属性
            mobileMenuButton.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
            mobileMenuButton.setAttribute('title', isHidden ? '关闭菜单' : '打开菜单');
            mobileMenuButton.setAttribute('aria-label', isHidden ? '关闭导航菜单' : '打开导航菜单');
        });
    }

    // 搜索功能切换
    if (searchButton && searchContainer) {
        searchButton.addEventListener('click', function() {
            searchContainer.classList.toggle('hidden');
            if (!searchContainer.classList.contains('hidden')) {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    }

    if (mobileSearchButton && searchContainer) {
        mobileSearchButton.addEventListener('click', function() {
            searchContainer.classList.toggle('hidden');
            if (!searchContainer.classList.contains('hidden')) {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    }

    // 搜索表单提交
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            if (searchInput && searchInput.value.trim()) {
                // 简单的搜索功能 - 跳转到 Google 搜索
                const query = encodeURIComponent(searchInput.value + ' site:' + window.location.hostname);
                window.open('https://www.google.com/search?q=' + query, '_blank');
            }
        });
    }

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 新闻卡片悬停效果增强
    document.querySelectorAll('.news-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // 图片懒加载和错误处理
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // 图片加载错误处理
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            if (!this.dataset.fallbackApplied) {
                this.dataset.fallbackApplied = 'true';
                this.src = 'https://via.placeholder.com/400x200.png/3B82F6/FFFFFF?text=图片加载失败';
                this.alt = '图片加载失败';
            }
        });
    });

    // 加载状态动画
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(element => {
        setTimeout(() => {
            element.classList.add('loaded');
        }, 100);
    });

    // 页面加载完成动画
    window.addEventListener('load', function() {
        document.body.classList.add('page-loaded');
    });

    // 轮播图功能
    initSlider();
});

// 轮播图初始化和功能
function initSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelectorAll('.dot');
    const prevBtn = slider.querySelector('.slider-btn.prev');
    const nextBtn = slider.querySelector('.slider-btn.next');

    if (slides.length === 0) return;

    let currentSlide = 0;
    let isTransitioning = false;
    let autoPlayInterval;

    // 显示指定幻灯片
    function showSlide(index, direction = null) {
        if (isTransitioning) return;
        isTransitioning = true;

        // 移除所有活动状态
        slides.forEach(slide => {
            slide.classList.remove('active', 'slide-in-left', 'slide-in-right');
        });
        dots.forEach(dot => dot.classList.remove('active'));

        // 设置新的活动幻灯片
        const newSlide = slides[index];
        newSlide.classList.add('active');
        
        // 添加方向动画
        if (direction === 'next') {
            newSlide.classList.add('slide-in-right');
        } else if (direction === 'prev') {
            newSlide.classList.add('slide-in-left');
        }

        // 更新指示器
        if (dots[index]) {
            dots[index].classList.add('active');
        }

        currentSlide = index;

        // 重置过渡状态
        setTimeout(() => {
            isTransitioning = false;
        }, 800);
    }

    // 下一张
    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next, 'next');
    }

    // 上一张
    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev, 'prev');
    }

    // 自动播放
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    // 键盘控制
    function handleKeyboard(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
            restartAutoPlay();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
            restartAutoPlay();
        }
    }

    // 重启自动播放
    function restartAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    // 事件监听器
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            restartAutoPlay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            restartAutoPlay();
        });
    }

    // 指示器点击
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (index !== currentSlide) {
                const direction = index > currentSlide ? 'next' : 'prev';
                showSlide(index, direction);
                restartAutoPlay();
            }
        });
    });

    // 鼠标悬停暂停
    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);

    // 触摸支持
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoPlay();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }

    // 键盘支持
    document.addEventListener('keydown', handleKeyboard);

    // 页面可见性API - 当页面不可见时暂停自动播放
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    });

    // 初始化
    showSlide(0);
    startAutoPlay();

    // 预加载图片
    slides.forEach((slide, index) => {
        if (index > 0) {
            const bgImage = slide.style.backgroundImage;
            if (bgImage) {
                const imageUrl = bgImage.slice(5, -2); // 移除 url(" 和 ")
                const img = new Image();
                img.src = imageUrl;
            }
        }
    });

    // 清理函数
    window.addEventListener('beforeunload', () => {
        stopAutoPlay();
        document.removeEventListener('keydown', handleKeyboard);
    });
}

    // 返回顶部按钮 - 添加辅助功能属性
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        backToTopButton.setAttribute('aria-label', '返回页面顶部');
        backToTopButton.setAttribute('title', '返回顶部');
    }

    // 返回顶部按钮
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const backToTop = document.getElementById('back-to-top');
    
    if (backToTop) {
        if (scrollTop > 300) {
            backToTop.style.display = 'block';
            backToTop.style.opacity = '1';
        } else {
            backToTop.style.opacity = '0';
            setTimeout(() => {
                if (backToTop.style.opacity === '0') {
                    backToTop.style.display = 'none';
                }
            }, 300);
        }
    }
});

// 创建返回顶部按钮
document.addEventListener('DOMContentLoaded', function() {
    const backToTopButton = document.createElement('button');
    backToTopButton.id = 'back-to-top';
    backToTopButton.innerHTML = '↑';
    backToTopButton.className = 'fixed bottom-6 right-6 bg-primary-blue text-white w-12 h-12 rounded-full shadow-lg hover:bg-blue-800 transition-all duration-300 z-50';
    backToTopButton.style.display = 'none';
    backToTopButton.style.opacity = '0';
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(backToTopButton);
});

// 分享功能
function shareToWeChat() {
    // 复制链接到剪贴板并提示用户
    copyToClipboard();
    alert('链接已复制到剪贴板，请在微信中粘贴分享');
}

function shareToWeibo() {
    const title = document.title;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${text}`, '_blank', 'width=600,height=400');
}

function copyToClipboard() {
    const url = window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showNotification('链接已复制到剪贴板');
        });
    } else {
        // 备用方案
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('链接已复制到剪贴板');
    }
}

// 通知提示
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-primary-blue text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 隐藏动画
    setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 申请表单处理
document.addEventListener('DOMContentLoaded', function() {
    const applicationForm = document.getElementById('application-form-submit');
    if (applicationForm) {
        applicationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 收集表单数据
            const formData = new FormData(this);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // 验证必填字段
            const requiredFields = ['name', 'gender', 'student_id', 'major', 'grade', 'phone', 'email', 'department', 'reason'];
            const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
            
            if (missingFields.length > 0) {
                showNotification('请填写所有必填项！', 'error');
                return;
            }
            
            if (!data.agree_terms) {
                showNotification('请同意相关条款！', 'error');
                return;
            }
            
            // 模拟提交成功
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>提交中...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                // 保存到本地存储
                const applications = JSON.parse(localStorage.getItem('applications') || '[]');
                applications.push({
                    ...data,
                    timestamp: new Date().toISOString(),
                    id: Date.now()
                });
                localStorage.setItem('applications', JSON.stringify(applications));
                
                showNotification('申请提交成功！我们会尽快联系您。', 'success');
                this.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
});

// 评论系统
document.addEventListener('DOMContentLoaded', function() {
    const commentForm = document.getElementById('comment-form');
    const commentsList = document.getElementById('comments-list');
    
    if (commentForm && commentsList) {
        // 加载现有评论
        loadComments();
        
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const comment = {
                name: formData.get('comment_name'),
                email: formData.get('comment_email'),
                content: formData.get('comment_content'),
                timestamp: new Date().toISOString(),
                id: Date.now(),
                approved: false // 需要管理员审核
            };
            
            if (!comment.name || !comment.content) {
                showNotification('请填写姓名和评论内容！', 'error');
                return;
            }
            
            // 保存评论
            const pageUrl = window.location.pathname;
            const comments = JSON.parse(localStorage.getItem(`comments_${pageUrl}`) || '[]');
            comments.push(comment);
            localStorage.setItem(`comments_${pageUrl}`, JSON.stringify(comments));
            
            showNotification('评论提交成功！将在审核后显示。', 'success');
            this.reset();
            loadComments();
        });
    }
    
    function loadComments() {
        if (!commentsList) return;
        
        const pageUrl = window.location.pathname;
        const comments = JSON.parse(localStorage.getItem(`comments_${pageUrl}`) || '[]');
        const approvedComments = comments.filter(c => c.approved);
        
        if (approvedComments.length === 0) {
            commentsList.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <p>暂无评论，快来抢沙发吧！</p>
                </div>
            `;
        } else {
            commentsList.innerHTML = approvedComments.map(comment => `
                <div class="bg-white rounded-lg p-6 mb-4 border border-gray-200">
                    <div class="flex items-center mb-3">
                        <div class="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center text-white font-bold mr-3">
                            ${comment.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-medium text-gray-800">${comment.name}</div>
                            <div class="text-sm text-gray-500">${new Date(comment.timestamp).toLocaleString('zh-CN')}</div>
                        </div>
                    </div>
                    <div class="text-gray-700 leading-relaxed">${comment.content}</div>
                </div>
            `).join('');
        }
    }
});

// 增强的通知系统
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-primary-blue',
        warning: 'bg-yellow-500'
    };
    
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300 max-w-sm`;
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="mr-3">
                ${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}
            </div>
            <div class="flex-1">${message}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 隐藏动画
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}