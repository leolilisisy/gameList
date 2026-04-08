'use strict';

const SIZE = 4;
const board = document.getElementById('board');
const shuffleBtn = document.getElementById('shuffle');
const solveBtn = document.getElementById('solve');

let state = [];

function makeSolved() {
  const arr = [];
  for (let i=1;i<SIZE*SIZE;i++) arr.push(i);
  arr.push(0);
  return arr;
}

function render() {
  board.innerHTML = '';
  for (let i=0;i<state.length;i++){
    const val = state[i];
    const tile = document.createElement('div');
    tile.className = 'tile' + (val===0? ' empty':'');
    tile.textContent = val===0? '' : String(val);
    tile.dataset.index = i;
    if (val!==0) tile.addEventListener('click', onTileClick);
    board.appendChild(tile);
  }
}

function canMove(index){
  const r = Math.floor(index/SIZE), c = index%SIZE;
  const empty = state.indexOf(0);
  const er = Math.floor(empty/SIZE), ec = empty%SIZE;
  const dr = Math.abs(r-er), dc = Math.abs(c-ec);
  return (dr+dc)===1;
}

function onTileClick(e){
  const i = Number(e.currentTarget.dataset.index);
  if (!canMove(i)) return;
  const empty = state.indexOf(0);
  [state[i], state[empty]] = [state[empty], state[i]];
  render();
  if (isSolved()) setTimeout(()=> alert('Solved!'), 120);
}

function shuffle() {
  // simple Fisher-Yates shuffle until solvable
  do {
    for (let i=state.length-1;i>0;i--) {
      const j = Math.floor(Math.random()*(i+1));
      [state[i], state[j]] = [state[j], state[i]];
    }
  } while (!isSolvable() || isSolved());
  render();
}

function isSolvable(){
  // count inversions
  const arr = state.filter(n=>n!==0);
  let inv=0;
  for (let i=0;i<arr.length;i++) for (let j=i+1;j<arr.length;j++) if (arr[i]>arr[j]) inv++;
  const rowFromBottom = SIZE - Math.floor(state.indexOf(0)/SIZE);
  if (SIZE%2===1) return inv%2===0;
  return (rowFromBottom%2===0) ? inv%2===1 : inv%2===0;
}

function isSolved(){
  for (let i=0;i<state.length-1;i++) if (state[i] !== i+1) return false;
  return state[state.length-1]===0;
}

shuffleBtn.addEventListener('click', shuffle);

// keyboard controls
window.addEventListener('keydown', e=>{
  const empty = state.indexOf(0);
  const er = Math.floor(empty/SIZE), ec = empty%SIZE;
  let moved=false;
  if (e.key === 'ArrowUp' && er < SIZE-1) { // move tile down into empty
    const idx = (er+1)*SIZE + ec; [state[empty], state[idx]] = [state[idx], state[empty]]; moved=true;
  } else if (e.key === 'ArrowDown' && er > 0) {
    const idx = (er-1)*SIZE + ec; [state[empty], state[idx]] = [state[idx], state[empty]]; moved=true;
  } else if (e.key === 'ArrowLeft' && ec < SIZE-1) {
    const idx = er*SIZE + (ec+1); [state[empty], state[idx]] = [state[idx], state[empty]]; moved=true;
  } else if (e.key === 'ArrowRight' && ec > 0) {
    const idx = er*SIZE + (ec-1); [state[empty], state[idx]] = [state[idx], state[empty]]; moved=true;
  }
  if (moved) { render(); if (isSolved()) setTimeout(()=> alert('Solved!'), 120); }
});

// init
state = makeSolved();
shuffle();
