document.addEventListener("DOMContentLoaded", () => {
    initializeOverlay(); 
});



function setActiveIcon(activeIconId) {  
  const buttons = document.querySelectorAll('.navigation-button');
  buttons.forEach((button) => {
      button.classList.remove('active');
      button.classList.add('inactive');
  });
  
  const activeButton = document.getElementById(activeIconId);
  if (activeButton) {
      activeButton.classList.add('active');
      activeButton.classList.remove('inactive');
  }
}



document.addEventListener('DOMContentLoaded', () => {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      document.body.classList.add('no-hover');
  }
});

function handleAvatarClick() {
  if (window.innerWidth <= 768) {
    const overlay = document.querySelector('.mobile-overlay');
    overlay.classList.add('active');
  } else {
    location.href = '../profile/profile.html';
  }
}


function initializeOverlay() {
  const overlay = document.querySelector(".mobile-overlay"); 
  const settingContainer = document.querySelector(".setting-container"); 

  if (!overlay || !settingContainer) {
    return;
  }
  overlay.addEventListener("click", (event) => {
    if (!settingContainer.contains(event.target)) {
      overlay.classList.remove("active"); 
    }
  });
}