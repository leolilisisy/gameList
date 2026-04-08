// FILE: script.js
return;
}


secondCard = {el:cardEl, data:cardData};
lockBoard = true;
moves++;
movesEl.textContent = moves;


// check match: pairId equal but types must differ (country vs capital)
if(firstCard.data.pairId === secondCard.data.pairId && firstCard.data.type !== secondCard.data.type){
// match
matches++;
matchesEl.textContent = matches;
// keep them flipped and disable
firstCard.el.disabled = true;
secondCard.el.disabled = true;
resetSelection();
if(matches === pairs.length){
setTimeout(()=>{
alert(Congratulations! You matched all pairs in ${moves} moves.);
},200);
}
} else {
// not a match — flip back
setTimeout(()=>{
firstCard.el.classList.remove('is-flipped');
secondCard.el.classList.remove('is-flipped');
resetSelection();
},700);
}
}


function resetSelection(){
[firstCard, secondCard] = [null, null];
lockBoard = false;
}


function startGame(){
buildDeck();
render();
moves = 0; matches = 0;
movesEl.textContent = moves;
matchesEl.textContent = matches;
firstCard = secondCard = null;
lockBoard = false;
}


restartBtn.addEventListener('click', startGame);


// small HTML-escape helper
function escapeHtml(str){
return String(str).replace(/[&<>"]+/g, (m)=>{
return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]);
});
}


// start
startGame();
