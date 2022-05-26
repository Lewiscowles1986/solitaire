let from, to;
const tabIDs = []
const foundIDs = []

let deck = []

let table = {
  stock: [],
  waste: [],
  foundations: [[],[],[],[]],
  tableau: [[],[],[],[],[],[],[]],
}

const $stock = document.querySelector("#stock");
const $wastepile = document.querySelector("#wastepile");
const $infoSpace = document.querySelector("#info-space");
const $foundations = document.querySelectorAll(".foundation");
const $tableaus = document.querySelectorAll(".tableau");

$foundations.forEach(found => foundIDs.push(found.id))
$tableaus.forEach(tab => tabIDs.push(tab.id))

function cardCreation(){
  // let suitsList = ["club", "diamonds", "spades", "hearts"]
  let suitsList = ["♣", "♦", "♠", "♥"]
  
  for(let suitLoop = 0; suitLoop < 4; suitLoop++){
    for(let cardLoop = 1; cardLoop < 14; cardLoop++){
      let suit, number, color
      number = cardLoop
      suit = suitsList[suitLoop]
      
      suitLoop%2 === 0 ? color = "black": color = "red"
      
      let card = { number, suit, color, isFlipped: false }
      deck.push(card)
    }
  }
}

function shuffleCards(){
  for (let i = 0; i < 10; i++) {
    deck.sort(() => Math.random() > 0.5)
  }
}

function layCards(){
  for(let i = 0; i < table.tableau.length; i++){
    let quantity = i;
    for (let j = quantity+1; j > 0; j--) {
      table.tableau[i].push(deck[0])
      deck.shift()
    }
  }
  table.waste.push(deck[0])
  deck.shift()
  //for testing --------------------------------------------------
  table.foundations.forEach(foundation => {
    foundation.push(deck[0])
    deck.shift()
  })
  //for testing --------------------------------------------------
  table.stock = deck
  deck = []
}

//adding divisions in wastepile and tableau
function domDivisions(){
  $tableaus.forEach((thisTableau, pile) => {
    for (let space = 0; space < 20; space++) {
      createSpace(thisTableau,pile,space)
    }
  })
  createSpace($stock)
  createSpace($wastepile)
  $foundations.forEach((foundation,pile) => {
    createSpace(foundation,pile)
  })
}
//space creation with listener
function createSpace(appendTo, pile = 0, space = 0){
  let separator = document.createElement("div")
  separator.classList.add("separator",`n${space}`)
  
  separator.addEventListener("mousedown", () => {
    clickAction("mousedown", separator.parentNode.id, pile, space)
  })
  separator.addEventListener("mouseup", () => {
    clickAction("mouseup", separator.parentNode.id, pile, space)
  })

  appendTo.appendChild(separator)
}
//action to store the interacting cards
function clickAction(action, place, pile, space){
  let cardValue = {place,pile,space}
  if(action === "mousedown"){
    from = cardValue
    if(from.place === "stock"){
      stockPile()
      from = undefined
    }
  } else if(action === "mouseup"){
    to = cardValue
    if(from !== undefined || to !== undefined) dragCard()
    // removing values to helper variables
    from = undefined
    to = undefined
  }
}
//checks origin and destination of card
function dragCard(){
  let fromCard, toCard

  if(tabIDs.includes(from.place)){ //from tableau piles
    fromCard = table.tableau[from.pile][from.space]
    if(tabIDs.includes(to.place)){
      //+++++tableau to tableau
      toCard = table.tableau[to.pile][to.space]
      isValidMove({fromCard,toCard,ascendingNumber:false,sameSuit:false,
        sameColor:false})
    }else if(foundIDs.includes(to.place)){
      //+++++tableau to foundations
      toCard = table.foundations[to.pile][to.space]
      isValidMove({fromCard,toCard,ascendingNumber:true,sameSuit:true,
        sameColor:true})
    } else {
      console.log("movement canceled")
    }
  }else if(from.place === "wastepile"){//from waste pile
    fromCard = table.waste[from.pile]
    if(foundIDs.includes(to.place)){
      //+++++waste to foundation
      toCard = table.foundations[to.pile][to.space]
      isValidMove({fromCard,toCard,ascendingNumber:true,sameSuit:true,
        sameColor:true})
    }else if(tabIDs.includes(to.place)){
      //+++++waste to tableau piles
      toCard = table.tableau[to.pile][to.space]
      isValidMove({fromCard,toCard,ascendingNumber:false,sameSuit:false,
        sameColor:false})
    } else {
      console.log("movement canceled")
    }
  }else if(foundIDs.includes(from.place)){ //from foundation
    fromCard = table.foundations[from.pile][from.space]
    if(tabIDs.includes(to.place)){
      //+++++foundation to tableau piles
      toCard = table.tableau[to.pile][to.space]
      //-
      isValidMove({fromCard,toCard,ascendingNumber:false,sameSuit:false,
        sameColor:false})
    } else {
      console.log("movement canceled")
    }
  }
}
//function to check if move is valid
function isValidMove({fromCard,toCard,ascendingNumber,sameSuit,
  sameColor}){

  let validNum = validSuit = validColor = theLastCard
  = differentPile = isLastCard = false;
  if((ascendingNumber && fromCard.number === toCard.number+1)
  || (!ascendingNumber && fromCard.number === toCard.number-1)){
    validNum = true
  }

  if(sameSuit){
    if(fromCard.suit === toCard.suit){
      validSuit = true
    }
  }else{
    validSuit = true
  }

  if(sameColor){
    if(fromCard.color === toCard.color){
      validColor = true
    }
  } else {
    validColor = true
  }

  if(tabIDs.includes(to.place)){
    let lastCard = table.tableau[to.pile][table.tableau[to.pile].length-1]
    if(toCard === lastCard){
      isLastCard = true
    }
  } else {
    isLastCard = true
  }
  
  if(tabIDs.includes(from.place) && tabIDs.includes(to.place)){
    if(from.place !== to.place){
      differentPile = true
    }
  } else {
    differentPile = true
  }

  validNum && validSuit && validColor && isLastCard && differentPile ?
  console.log(true) : console.log(false)

  console.log("nmbr: "+validNum,"\n♥♦♣♠: "+validSuit,
  "\ncolr: "+validColor,"\nlast: "+isLastCard,"\ndiff: "+differentPile);
}
//function to place one card in waste or return cards if empty
function stockPile(){
  console.log("pending action: move card to waste");
}
//check if card can be moved to another pile
// function moveCards(origin, destination, direction){
//   let isvalidNum = isValidSuit = isValidColor = isLastCard = false
//   let fromCard, toCard
//   origin === "tableau" ? fromCard = table.tableau[from.pile][from.space] :
//   origin === "wastepile" ? fromCard = table.waste[from.pile] :
//   origin === "foundation" ? fromCard = table.foundations[from.pile][from.space] :
//   alert("origin card not assigned")

//   destination === "tableau" ? toCard = table.tableau[to.pile][to.space] :
//   destination === "foundation" ? toCard = table.foundations[to.pile][to.space] :
//   alert("destination card not assigned")

//   if(fromCard === undefined || toCard === undefined) return

//   if(direction === "+" && fromCard.number === toCard.number+1){
//     isvalidNum = true
//   }else if(direction === "-" && fromCard.number === toCard.number-1){
//     isvalidNum = true
//   }
  
//   if(destination === "foundation"){
//     if(fromCard.suit === toCard.suit){
//       isValidSuit = true
//     }
//   } else {
//     isValidSuit = true
//   }
  
//   console.log("num: "+isvalidNum, "\n♦♣♠: "+isValidSuit,
//   "\ncol: "+isValidColor, "\n..n: "+isLastCard);
// }
//placing cards on each tableau pile's space
function placeCardsDom(){
  table.stock.forEach(card => $stock.firstChild.innerText += ` ${card.suit} ${card.number}`)

  $wastepile.firstChild.innerText = ` ${table.waste[0].suit} ${table.waste[0].number}`

  for(let i = 0; i < table.tableau.length; i++){
    for (let j = 0; j < table.tableau[i].length; j++) {
      let space = document.querySelector(`#tab-${i} .n${j}`)
      space.innerText = `${table.tableau[i][j].suit} ${table.tableau[i][j].number}`
    }
  }
  //for testing --------------------------------------------------
  $foundations.forEach((foundation,i) => {
    foundation.firstChild.innerText = `${table.foundations[i][0].suit} ${table.foundations[i][0].number}`
  })
  //for testing --------------------------------------------------
}



cardCreation()
shuffleCards()
layCards()
domDivisions()
placeCardsDom()