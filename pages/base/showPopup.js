// write a function to show a popup as a modal dialog box in file html ./posting/posting.html

function showPopup() {
    const popup = document.getElementById("posting");
    console.log(popup);  
    // add display
    popup.style.display = "block";
}  

function hidePopup() {
    const popup = document.getElementById("posting");
    console.log(popup);  
    // add display
    popup.style.display = "none";
}
