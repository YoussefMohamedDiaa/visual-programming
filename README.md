# Visual Programming: Source-to-Source Transformation

A NodeJS program that transforms a [Scratch](https://scratch.mit.edu/) visual program to a textual representation.

## Installation and Build

* Clone/Download the Code.
* Make sure [Node](https://nodejs.org/en/) is installed.

* Install the dependencies:
```node
npm install
```

## Running the program

Run on http://localhost:3000:
```
npm start
```
Upload a Scratch Project JSON to transform it into pseudo code and execute it. The transformed pseudo code will be displayed in the console.

*Note: When uploading another Scratch Project JSON a page refresh might be needed.*

## Examples

The following are sample projects, that can be found under the `./scratch-projects` directory.

### Sample Scratch Program

An example Scratch program is provided at `./scratch-projects/sample-program.json`.

#### Scratch Program
![Sample Scratch Program](./scratch-projects/images/sample-project.png)

#### Transformed Pseudo code Program
```
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
WHEN space PRESSED
  BEGIN
    Say I love VP! For 5
    IF (x>50)
      BEGIN
        Say MP1 DONE!
      END
  END
WHEN i PRESSED
  BEGIN
    FOREVER
      BEGIN
        Turn right 90 Degrees
      END
  END
```
