const newMemeBtn = document.getElementById("newMemeBtn");
const memeTitle = document.getElementById("meme-title");
const memeImg = document.getElementById("meme");
const errorText = document.getElementById("error");

async function getMeme() {
  errorText.innerText = ""; // Clear previous error
  try {
    const response = await fetch("https://meme-api.com/gimme");
    if (!response.ok) throw new Error("Network response not ok");
    const data = await response.json();
    memeTitle.innerText = data.title;
    memeImg.src = data.url;
  } catch (error) {
    memeTitle.innerText = "Oops! Couldn't fetch a meme.";
    errorText.innerText = error.message;
  }
}

// Button click
newMemeBtn.addEventListener("click", getMeme);

// Automatically load one meme on page load
window.onload = getMeme;
