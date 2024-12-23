function showPopup() {
    const popup = document.getElementById("posting");
    if (!popup) {
        console.error("Popup element not found!");
        return;
    }
    popup.style.display = "flex";
}


function hidePopup() {
    const popup = document.getElementById("posting");
    popup.style.display = "none";
}
