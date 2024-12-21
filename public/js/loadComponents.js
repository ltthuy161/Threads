function loadComponent(componentId, filePath) {
  return new Promise((resolve, reject) => {
    fetch(filePath)
      .then((response) => {
        if (!response.ok) {
          reject(new Error(`Failed to load ${filePath}`)); 
        }
        return response.text();
      })
      .then((data) => {
        document.getElementById(componentId).innerHTML = data;
        resolve(); 
      })
      .catch((error) => {
        console.error(error);
        reject(error); 
      });
  });
}


function setActiveIcon(activeIconId) {
  const buttons = document.querySelectorAll('.navigation-button');
  buttons.forEach((button) => {
      const icon = button.querySelector('i');
      if (button.id === activeIconId) {
          icon.classList.add('active');
          icon.classList.remove('inactive');
      } else {
          icon.classList.add('inactive');
          icon.classList.remove('active');
      }
  });
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