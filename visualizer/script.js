const code = `
WHEN Green Flag CLICKED
  BEGIN
    Move 50 Steps
    Turn right 90 Degrees
    Go to 50,50
    REPEAT 10 TIMES
      BEGIN
        Move 10 Steps
      END
    Change X by 2
  END
`;
console.log(code);

const img = document.getElementById("cat");

const app = new PIXI.Application({ backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

// create a new Sprite from an image path
const cat = new PIXI.Graphics();

// Rectangle
cat.beginFill(0xde3249);
cat.drawRect(50, 50, 100, 100);
cat.endFill();



// move the sprite to the center of the screen
cat.x = app.screen.width / 2;
cat.y = app.screen.height / 2;

app.stage.addChild(cat);

// Listen for animate update
app.ticker.add((delta) => {
    // just for fun, let's rotate mr rabbit a little
    // delta is 1 if running at 100% performance
    // creates frame-independent transformation
    cat.rotation += 0.1 * delta;
});
