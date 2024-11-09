function loadComponent(componentId, filePath) {
  fetch(filePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${filePath}`);
        console.error(`Failed to load ${filePath}`);
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById(componentId).innerHTML = data;
    })
    .catch((error) => console.error(error));
}

function setActiveIcon(activeIconId) {
  const icons = document.querySelectorAll('.icon'); // Lấy tất cả các icon
  icons.forEach((icon) => {
    if (icon.id === activeIconId) {
      icon.classList.add('active');
      icon.classList.remove('inactive');
    } else {
      icon.classList.add('inactive');
      icon.classList.remove('active');
    }
  });
}