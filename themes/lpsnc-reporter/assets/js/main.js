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
});