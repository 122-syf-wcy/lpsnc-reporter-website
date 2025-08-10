// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 移动端导航菜单切换
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }
  
  // 滚动渐显效果
  const fadeElements = document.querySelectorAll('.fade-in-element');
  
  function checkFade() {
    fadeElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('visible');
      }
    });
  }
  
  // 初始检查
  checkFade();
  
  // 滚动时检查
  window.addEventListener('scroll', checkFade);

  // 简易前端搜索：在 /news/ 页面根据 ?q= 过滤卡片
  try {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim().toLowerCase();
    if (query && window.location.pathname.startsWith('/news')) {
      const cards = document.querySelectorAll('#news-list article.news-card');
      let anyVisible = false;
      cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        const match = text.includes(query);
        card.style.display = match ? '' : 'none';
        if (match) anyVisible = true;
      });
      if (!anyVisible) {
        const container = document.getElementById('news-list');
        if (container) {
          const empty = document.createElement('div');
          empty.className = 'col-span-full text-center text-gray-500';
          empty.textContent = '未找到匹配的新闻';
          container.appendChild(empty);
        }
      }
    }
  } catch (e) {
    console.warn('search init failed', e);
  }
});