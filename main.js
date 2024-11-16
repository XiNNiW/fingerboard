
const noteNameLookup = {
    "c": 0,
    "c#": 1,
    "db": 1,
    "d": 2,
    "d#": 3,
    "eb": 3,
    "e": 4,
    "fb": 4,
    "f": 5,
    "f#": 6,
    "gb": 6,
    "g": 7,
    "g#": 8,
    "ab": 8,
    "a": 9,
    "a#": 10,
    "bb": 10,
    "b": 11,
    "cb": 11,
};



function noteNamesToNumbers(noteNames) {
    let notes = [];
    for (const name of noteNames) {
        if (name in noteNameLookup) {
            notes.push(noteNameLookup[name]);
        } else {
            console.log("noteNamesToNumbers failed for.. ", name)
        }
    }

    return notes;
}

function noteNumberToName(number) {

    for (const key in noteNameLookup) {
        const value = noteNameLookup[key];
        if (number == value) { return key }
    }
    return ""
}

const DrawingRoutinePrototype = {
    draw() {
        this.drawStrings();
        this.drawFrets();
        this.drawNotes();
    },

    drawStrings() {
        for (let s = 0; s < this.numberOfStrings; s++) {
            this.context.moveTo(this.left, this.stringHeight * s + this.top);
            this.context.lineTo(this.left + this.drawingWidth - this.fretWidth, this.stringHeight * s + this.top);

            let openNote = this.tuning[this.numberOfStrings - 1 - s];
            let stringName = this.tuningNames[this.tuning.indexOf(openNote)];
            this.context.font = "30px Arial";
            let metrics = this.context.measureText(stringName);
            let textHeight = metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent;
            this.context.strokeText(stringName, this.left - metrics.width * 4, this.stringHeight * s + this.top + 0.5 * textHeight);
            this.context.stroke();
        }
    },
    drawFrets() {

        for (let f = 0; f < this.numberOfFrets; f++) {
            const dots = [3, 5, 7, 9, 15, 17];
            if (f > 0) {
                this.context.moveTo(this.left + f * this.fretWidth, this.top);
                this.context.lineTo(this.left + f * this.fretWidth, this.top + this.drawingHeight - this.stringHeight);
                this.context.stroke();
            }
            if (dots.includes(f)) {
                this.context.beginPath();
                this.context.arc(this.left + f * this.fretWidth + 0.5 * this.fretWidth, this.stringHeight * this.numberOfStrings - this.stringHeight * 0.5 + this.top, 3, 0, 2 * Math.PI);
                this.context.fillStyle = 'black';
                this.context.fill();
            }

            if (f == 12) {
                this.context.beginPath();
                this.context.arc(this.left + f * this.fretWidth + 0.25 * this.fretWidth, this.stringHeight * this.numberOfStrings - this.stringHeight * 0.5 + this.top, 3, 0, 2 * Math.PI);
                this.context.fillStyle = 'black';
                this.context.fill();
                this.context.beginPath();
                this.context.arc(this.left + f * this.fretWidth + 0.75 * this.fretWidth, this.stringHeight * this.numberOfStrings - this.stringHeight * 0.5 + this.top, 3, 0, 2 * Math.PI);
                this.context.fillStyle = 'black';
                this.context.fill();
            }


        }


    },
    drawNotes() {

        for (let s = 0; s < this.numberOfStrings; s++) {
            let bottom = this.fullHeight - this.top - this.stringHeight;
            let openNote = this.tuning[this.numberOfStrings - 1 - s];
            for (let f = 0; f < this.numberOfFrets - 1; f++) {
                this.context.moveTo(this.left + f * this.fretWidth, bottom - this.stringHeight * s);
                let frettedNote = openNote + f;
                let frettedPitch = frettedNote % 12;
                if (this.pitchClass.includes(frettedPitch)) {
                    let indexOfNote = this.pitchClass.indexOf(frettedPitch);
                    this.context.font = "24px Arial";

                    let circleFontMetrics = this.context.measureText("f#");
                    let circleHeight = circleFontMetrics.actualBoundingBoxAscent - circleFontMetrics.actualBoundingBoxDescent;
                    circleHeight = Math.max(circleFontMetrics.width, circleHeight);
                    this.context.beginPath();
                    this.context.arc(this.left + f * this.fretWidth + 0.5 * this.fretWidth, this.top + s * this.stringHeight, circleHeight, 0, 2 * Math.PI);
                    this.context.fillStyle = 'white';
                    this.context.lineWidth = indexOfNote == 0 ? 5 : 1;
                    this.context.fill();



                    let labelFontMetrics = this.context.measureText(noteNumberToName(frettedPitch));
                    let labelHeight = labelFontMetrics.actualBoundingBoxAscent - labelFontMetrics.actualBoundingBoxDescent;
                    this.context.fillStyle = 'black';
                    this.context.fillText(this.noteNames[indexOfNote], this.left + f * this.fretWidth - 0.5 * labelFontMetrics.width + 0.5 * this.fretWidth, this.top + s * this.stringHeight + 0.5 * labelHeight);

                    this.context.stroke();
                }
            }
        }
    }
};

function DrawingRoutine(properties) {
    this.canvas = properties.canvas;
    this.noteNames = properties.noteNames;
    this.pitchClass = noteNamesToNumbers(this.noteNames);
    this.tuningNames = properties.tuningNames;
    this.tuning = noteNamesToNumbers(this.tuningNames);
    this.numberOfStrings = this.tuning.length;
    this.numberOfFrets = properties.numberOfFrets;

    let { width, height } = this.canvas.getBoundingClientRect();
    this.fullWidth = width;
    this.fullHeight = height;
    this.drawingWidth = width * 0.8;
    this.drawingHeight = height * 0.8;

    this.top = 0.5 * (height - this.drawingHeight);
    this.left = 0.5 * (width - this.drawingWidth);
    this.stringHeight = this.drawingHeight / this.numberOfStrings;
    this.fretWidth = this.drawingWidth / this.numberOfFrets;


    this.context = properties.canvas.getContext("2d");
    this.context.clearRect(0, 0, width, height);
}

Object.assign(DrawingRoutine.prototype, DrawingRoutinePrototype);

function drawFingerboard() {
    let canvas = document.getElementById("fingerboard-canvas");
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    canvas.width = vw;
    canvas.height = Math.min(vh * 0.9, vw / 3);
    let routine = new DrawingRoutine({
        noteNames: document.getElementById("chord-input").value.split(" "),
        tuningNames: document.getElementById("tuning-input").value.split(" "),
        numberOfFrets: parseInt(document.getElementById("numFrets-input").value),
        canvas: canvas,
    });

    routine.draw();
}

function main() {
    console.log("begin!");
    document.getElementById("draw-btn").addEventListener("click", drawFingerboard);
    document.getElementById("chord-input").addEventListener("keyup", drawFingerboard);
    document.getElementById("tuning-input").addEventListener("change", drawFingerboard);
    document.getElementById("numFrets-input").addEventListener("change", drawFingerboard);
    drawFingerboard();
}

window.onload = main;
window.onresize = drawFingerboard;
