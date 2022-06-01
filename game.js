let deckDesign = "traditional"
let unflippedImg = "./media/images/cards/traditional/reverse.png"
let emptyImg = "./media/images/cards/traditional/empty.png"
let from,to
let onDoubleClick = false
let cardsTotal
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
const $playArea = document.querySelector(".play-area")

$foundations.forEach(found => foundIDs.push(found.id))
$tableaus.forEach(tab => tabIDs.push(tab.id))

function cardCreation(){
  let suitsList = ["clubs", "diamonds", "spades", "hearts"]
  
  for(let suitLoop = 0; suitLoop < 4; suitLoop++){
    for(let cardLoop = 1; cardLoop < 14; cardLoop++){
      let suit, number, color
      number = cardLoop
      suit = suitsList[suitLoop]
      url = `./media/images/cards/${deckDesign}/${suit}${cardLoop}.png`
      
      suitLoop%2 === 0 ? color = "black": color = "red"
      
      let card = { number, suit, color, isFlipped: false, url }
      deck.push(card)
    }
  }
  //asigning number for win condition
  cardsTotal = deck.length;
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
  deck[0].isFlipped = true
  table.waste.push(deck[0])
  deck.shift()
  table.stock = deck
  deck = []

  //flip cards
  for(let i = 0; i < table.tableau.length; i++)
  table.tableau[i][i].isFlipped = true
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
  
  appendTo.appendChild(separator)
}

//action to store the interacting cards
function clickAction(action, place, pile, space){
  let cardValue = {place,pile,space}
  if(action === "mousedown"){
    to = undefined // removing values to helper variables
    from = cardValue
    if(from.place === "stock"){
      stockToWaste()
      from = undefined
    }else if(tabIDs.includes(from.place) && table.tableau[from.pile][from.space]
    === table.tableau[from.pile][table.tableau[from.pile].length-1]
    && table.tableau[from.pile].length > 0){
      table.tableau[from.pile][table.tableau[from.pile].length-1].isFlipped = true
      placeCardsInDom()
    }
  } else if(action === "mouseup"){
    to = cardValue
    if(from !== undefined || to !== undefined) dragCard()
    from = undefined // removing values to helper variables
  }
}

//checks origin and destination of card
function dragCard(){
  if(from === undefined) return
  let fromCard, toCard

  if(tabIDs.includes(from.place)){ //from tableau piles
    fromCard = table.tableau[from.pile][from.space]
    // console.log("fromCard",fromCard);
    if(tabIDs.includes(to.place)){//+++++tableau to tableau
      toCard = table.tableau[to.pile][to.space]
      isValidMove({fromCard,toCard,ascendingNumber:false,sameSuit:false,
        needsSameColor:false})
    }else if(foundIDs.includes(to.place)){//+++++tableau to foundations
      toCard = table.foundations[to.pile][table.foundations[to.pile].length-1]
      // console.log("toCard",toCard);
      isValidMove({fromCard,toCard,ascendingNumber:true,sameSuit:true,
        needsSameColor:true})
    } else {
      console.log("movement canceled")
    }
  }else if(from.place === "wastepile"){//from waste pile
    fromCard = table.waste[table.waste.length-1]
    if(foundIDs.includes(to.place)){//+++++waste to foundation
      toCard = table.foundations[to.pile][table.foundations[to.pile].length-1]
      isValidMove({fromCard,toCard,ascendingNumber:true,sameSuit:true,
        needsSameColor:true})
    }else if(tabIDs.includes(to.place)){//+++++waste to tableau piles
      toCard = table.tableau[to.pile][to.space]
      isValidMove({fromCard,toCard,ascendingNumber:false,sameSuit:false,
        needsSameColor:false})
    } else {
      console.log("movement canceled")
    }
  }else if(foundIDs.includes(from.place)){ //from foundation
    fromCard = table.foundations[from.pile][table.foundations[from.pile].length-1]
    if(tabIDs.includes(to.place)){//+++++foundation to tableau piles
      toCard = table.tableau[to.pile][to.space]
      isValidMove({fromCard,toCard,ascendingNumber:false,sameSuit:false,
        needsSameColor:false})
    } else {
      console.log("movement canceled")
    }
  }
}

//function to check if move is valid
function isValidMove({fromCard,toCard,ascendingNumber,sameSuit,
  needsSameColor}){
  if(fromCard === undefined){
    return
  }

  let validNum = validSuit = validColor = theLastCard
  = differentPile = isLastCard = isFacingUp = false;

  if(toCard !== undefined){
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
    if((needsSameColor && fromCard.color === toCard.color)
    || (!needsSameColor && fromCard.color !== toCard.color)){
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
    if(fromCard.isFlipped && toCard.isFlipped){
      isFacingUp = true
    }
    if(validNum && validSuit && validColor
      && isLastCard && isFacingUp && differentPile){
      moveCards()
    }
  } else if(foundIDs.includes(to.place) && fromCard.number === 1){
    // console.log("empty foundation");
    toCard = "empty"
    moveCards()
  } else if(tabIDs.includes(to.place)){
    // console.log("empty tableau");
    toCard = "empty"
    moveCards()
    // console.log("fromCard",fromCard,"toCard",toCard);
  }
}

//move cards from one pile to another
function moveCards(){
  let fromHere = removeFromHere = toHere = undefined
  //declaring fromHere
  if(tabIDs.includes(from.place)){
    fromHere = table.tableau[from.pile][from.space]
    removeFromHere = table.tableau[from.pile]
  } else if(foundIDs.includes(from.place)){
    fromHere = table.foundations[from.pile][table.foundations[from.pile].length-1]
    removeFromHere = table.foundations[from.pile]
  } else if(from.place === "wastepile"){
    fromHere = table.waste[table.waste.length-1]
    removeFromHere = table.waste
  }
  fromHere.isFlipped = true
  //declaring toHere
  if(foundIDs.includes(to.place)){
    toHere = table.foundations[to.pile]

  }else if(tabIDs.includes(to.place)){
    toHere = table.tableau[to.pile]
  }
  toHere.isFlipped = true

  //move piles
  let fromIndex = removeFromHere.findIndex(card => card === fromHere)
  let howMany = removeFromHere.length - fromIndex
  let cardsToMove = removeFromHere.slice(fromIndex)

  console.log(fromIndex,howMany,cardsToMove);

  // toHere.push(fromHere)
  // toHere.push(cardsToMove)
  cardsToMove.forEach(card => toHere.push(card))
  
  for (let i = howMany; i > 0; i--) {
    removeFromHere.pop()
  }
  // removeFromHere.pop()

  placeCardsInDom()
}

//function to place one card in waste or return cards if empty
function stockToWaste(){
  if(table.stock.length > 0){
    table.stock[0].isFlipped = true
    table.waste.push(table.stock[0])
    table.stock.shift()
  } else if(table.waste.length > 0){
    table.stock = table.waste
    table.waste = []
  }

  placeCardsInDom()
}

//draw the card's image in page
function placeCardsInDom(){
  //clear existing cards
  document.querySelectorAll(".separator").forEach(sep => { sep.innerHTML = ""})
  //in stock
  let img = document.createElement("img")
  if(table.stock.length > 0){
    img.src = unflippedImg
  } else {
    img.src = emptyImg
    img.classList.add("not-animated")
  }
    img.classList.add("card","card-stock")
    img.setAttribute("data-place","stock")

    $stock.firstChild.appendChild(img)
  //in waste
  img = document.createElement("img")
  if(table.waste.length > 0){
    img.src = table.waste[table.waste.length-1].url
  } else {
    img.src = emptyImg
    img.classList.add("not-animated")
  }
    img.classList.add("card","card-waste")
    img.setAttribute("data-place","wastepile")
    img.setAttribute("data-pile",0)
    img.setAttribute("data-space",0)

    $wastepile.firstChild.appendChild(img)
  //in tableau
  for(let i = 0; i < table.tableau.length; i++){
    if(table.tableau[i].length !== 0){
      for (let j = 0; j < table.tableau[i].length; j++) {
        let space = document.querySelector(`#tab-${i} .n${j}`)
        let img = document.createElement("img")
        if(table.tableau[i][j].isFlipped){
          img.src = table.tableau[i][j].url
        } else {
          img.src = unflippedImg
        }
        img.classList.add("card")
        img.setAttribute("data-place","tableau")
        img.setAttribute("data-pile",i)
        img.setAttribute("data-space",j)
        
        space.appendChild(img)
      }
    } else {
      let space = document.querySelector(`#tab-${i} .n${0}`)
        let img = document.createElement("img")
        img.src = emptyImg
        img.classList.add("not-animated")
        img.classList.add("card")
        img.setAttribute("data-place","tableau")
        img.setAttribute("data-pile",i)
        img.setAttribute("data-space",0)
        
        space.appendChild(img)
    }
  }
  //in foundations
  for (let i = 0; i < table.foundations.length; i++) {
    let img = document.createElement("img")
    img.classList.add("card","card-foundation")
    img.setAttribute("data-place","foundation")
    img.setAttribute("data-pile",i)
    img.setAttribute("data-space",0)
    if(table.foundations[i].length > 0){
      img.src = table.foundations[i][table.foundations[i].length-1].url
    } else {
      img.src = emptyImg
      img.classList.add("not-animated")
    }

    $foundations[i].firstChild.appendChild(img)
  }
  addListeners()
  adjustSeparators()
  checkWinCondition()
}

//add listeners to cards
function addListeners(){
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mousedown", (e) => {
      clickAction("mousedown", card.parentNode.parentNode.id,
      card.getAttribute("data-pile"),card.getAttribute("data-space"))
      doubleClick()
      e.preventDefault()
    })

    card.addEventListener("mouseup", () => {
      clickAction("mouseup", card.parentNode.parentNode.id,
      card.getAttribute("data-pile"),card.getAttribute("data-space"))
    })
  })
}

//hide unused separators
function adjustSeparators(){
  let longest = 0;
  table.tableau.forEach((tab) => {
    if(longest < tab.length){
      longest = tab.length
    }
  })

  for(let i = 0; i < table.tableau.length; i++){
    for (let j = 0; j < 20; j++) {
      let space = document.querySelector(`#tab-${i} .n${j}`)
      if(j > longest){
        space.classList.add("sep-hidden")
        space.classList.remove("separator")
      }else {
        space.classList.remove("sep-hidden")
        space.classList.add("separator")
      }
    }
  }
}

//game is over when the 4 foundations have all the 13 cards
function checkWinCondition(){
  let totalInFoundation = table.foundations[0].length
  + table.foundations[1].length
  + table.foundations[2].length
  + table.foundations[3].length
  if(totalInFoundation == cardsTotal){
    alert("YOU WIN! This is a temporal message")
  }
}

//card to foundation in double click
function doubleClick(){
  if (onDoubleClick && from !== undefined) {
    let fromCard, place
    done = false
    console.log("double click");
    if(tabIDs.includes(from.place)){
      fromCard = table.tableau[from.pile][from.space]
      place = "tableau"
    } else if(from.place === "wastepile"){
      fromCard = table.waste[table.waste.length-1]
      place = "waste"
    }
    
    for (let i = 0; i < 4; i++) {
      let foundation = table.foundations[i]
      if(foundation.length > 0){
        if(fromCard.suit === foundation[foundation.length-1].suit
          && foundation[foundation.length-1].number === fromCard.number-1){
            if(place === "tableau"){
              foundation.push(table.tableau[from.pile][from.space])
              table.tableau[from.pile].pop()
              placeCardsInDom()
            }
        }
      } else if(fromCard.number === 1 && !done){
        console.log(foundation);
        if(place === "tableau"){
          foundation.push(table.tableau[from.pile][from.space])
          table.tableau[from.pile].pop()
          done = true
        } else if(place === "waste"){
          foundation.push(table.waste[table.waste.length-1])
          table.waste.pop()
          done = true
        }
        placeCardsInDom()
      }
    }
  }

  onDoubleClick = true
  setTimeout(() => {
    onDoubleClick = false
  }, 250)
}

cardCreation()
shuffleCards()
layCards()
domDivisions()
placeCardsInDom()