let table;

// array of all letters
let letters = [];
//number of letters that are currently being shown on screen
let letternum = 1;
//speed at which the animations are playing
let easing = 0.06;
//different pngs of the animation
let animation = []
//how big the envelopes should be
let envelopesize = 2;
//the width of the envelopes, should scale things in the screen with this number
let enveloperatio;
//padding 
let padding = 30;
//text size
let sizetext;

function preload() {
    //load the csv file and push the animation frames
    table = loadTable("gpt4.csv", "csv", "header");
    for (let i = 1; i < 23; i++) {
        animation.push(loadImage('letter/Untitled_Artwork-' + str(i)+ '.png'));

}

}

function setup() {
    rectMode(CENTER);
    noStroke();
createCanvas(windowWidth,windowHeight);
//load letter data into objects
for (let row of table.rows) {
    let letter = row.get("note");
    let positivity = row.get("positivity");
    let originality = row.get("Originality");
    
    letters.push(new LoveLetter(letter, parseFloat(positivity), parseFloat(originality)))
}
}

function draw() {
    background(235,191,196,255);
    setText();
    //maintain letters
    for (let i = 0; i < letternum; i++) {
        letters[i].drawLetter();
       letters[i].update();
    }
    push();
    textAlign(CENTER);
    textSize(sizetext+10);
    text("how AI classifies love", width/2, height/20);
    textSize(sizetext+2);
    text("positivity ----------------->", width/2, 19*height/20);
    rotate(radians(270));
    text("originality ----------------->", -height/2, width/20);
    pop();
}


class LoveLetter {
constructor(letter, positivity, originality) {
    this.letter = letter;
    this.positivity = positivity;
    this.originality = originality;
    //how the values are mapped to the screen
    this.mappedPositivity = map(this.positivity, 0, 1, 0+padding, width-padding);
    this.mappedOriginality = map(this.originality, 0, 1, height-padding, 0+padding);
    //letter starting position
    this.x = width/2;
    this.y = height + 100;
    //current state of letter
    this.state = 0;
    //current frame of letter
    this.frame = 0;
    //how much delay is between the frames of the letter opening
    this.frameDelay = 1;
    this.noteposx;
    this.noteposy;
    this.notesize=1;
    this.currentchar = 0;
    this.temp = 0;
}
//draws the letter onto the screen
drawLetter() {
    drawFrame(animation[this.frame], this.x, this.y);

}

update() {
    //letter floats onto screen
    if (this.state == 0) {
    let newpos = this.ease(width / 2, 3*height/4, this.x, this.y);
    this.x = newpos.curx;
    this.y = newpos.cury;
    }
    //envelope opens up
    if (this.state == 1) {
    if (frameCount % this.frameDelay == 0) {
       if (this.frame >= 21) {
          this.frame = 21;
          this.noteposx = this.x;
          this.noteposy = this.y;
          this.state = 2;
       } else {
          this.frame++;
       }
      }
    }
    //letter floats out
    if (this.state == 2) {
        rect(this.noteposx,this.noteposy,this.notesize/1.2, this.notesize);
        let letsize = enveloperatio*1.7;
        if (this.notesize <= letsize) {
            this.notesize+=7;
        }
        let newpos = this.ease(width/2, height/2.2, this.noteposx,this.noteposy);
        this.noteposx = newpos.curx;
        this.noteposy = newpos.cury;
    }
    if (this.state == 3) {
        let currentString = this.letter.substring(0, this.currentchar);
        rect(this.noteposx,this.noteposy,this.notesize/1.2, this.notesize);
        push();
        //274 - 114
        rectMode(CORNER)
        text(currentString, this.noteposx-this.notesize/2.4+10, this.noteposy - this.notesize/2+10,this.notesize/1.2-10);
        pop();
        this.currentchar += 0.5;
        if (currentString == this.letter) {
            if (this.temp == 0) {
                this.temp = frameCount-5;
            }
            if ((frameCount - this.temp) % 150 == 0) {
                this.state++;
                this.temp = 0;
            }
        }

    }
    //letter goes to its position
    if (this.state == 4) {
    let newpos = this.ease(this.mappedPositivity, this.mappedOriginality, this.x, this.y);
    this.x = newpos.curx;
    this.y = newpos.cury;
    }
    //new letter time!!!
    if (this.state == 5) {
    if (letternum < letters.length) {
       letternum++;
       this.state++;
    }
    }
}
//helper function for animation. Goes from current location to destx,desty
ease (destx, desty, curx, cury) {
    let dx = destx - curx;
    let dy = desty - cury;
    curx += dx * easing;
    cury += dy * easing;
    if (abs(dx) <= 1 && abs(dy) <= 1) {
        this.state ++;
    }
    return {curx, cury}
}
}

//crazy ass function to draw the image in teh right way because I'm a horrible artist
function drawFrame (picture, posx, posy) {
    let img = picture;
    let imgAspect = img.width / img.height;
    let canvasAspect = width / height;

    let newWidth, newHeight;

    if (canvasAspect > imgAspect) {
       newHeight = envelopesize* height/10;
       newWidth = imgAspect * newHeight;
    } else {
       newWidth = envelopesize*width/10;
       newHeight = newWidth / imgAspect;
    }
    enveloperatio = newWidth;
    let xPos = posx-newWidth/2
    let yPos = posy-newHeight/2

    image(img, xPos, yPos-.26*newHeight, newWidth, newHeight);
}

function setText() {
    sizetext = round(map(enveloperatio,100,300,8,16));
    console.log(sizetext)
    textSize(sizetext);
    textFont(`Courier`);
    textAlign(LEFT, TOP);
}