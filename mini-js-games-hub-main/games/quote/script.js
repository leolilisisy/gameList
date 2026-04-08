const quotes = [
  { quote: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { quote: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
  { quote: "Everything you can imagine is real.", author: "Pablo Picasso" },
  { quote: "Turn your wounds into wisdom.", author: "Oprah Winfrey" }
];

function generateQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quoteText = quotes[randomIndex].quote;
  const quoteAuthor = quotes[randomIndex].author;

  document.getElementById("quote").textContent = quoteText;
  document.getElementById("author").textContent = `— ${quoteAuthor}`;
}