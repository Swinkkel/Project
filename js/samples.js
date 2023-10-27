// Get duration of sample.
function getSampleDuration(sample) {
    return new Promise((resolve, reject) => {
        const audioElement = new Audio(sample.src);

        audioElement.addEventListener('loadedmetadata', function() {
            const durationInSeconds = audioElement.duration;
            sample.duration = durationInSeconds;
            resolve(durationInSeconds);
        });

        audioElement.addEventListener('error', function() {
            reject('Failed to get duration');
        });

        audioElement.load(); // Load the audio element to trigger the 'loadedmetadata' event
    });
}

class Sample {
    constructor(src, name) {
        this.name = name;
        this.src = src;
        this.duration = undefined;
    }

    getDuration() {
        return this.duration;
    }
};

// Array for mp3 samples, items are object having file source and name
class samplesCategory {
    constructor(name) {
        this.name = name;
        this.samples = [];
    }

    addSample(sample) {
        this.samples.push(sample);
    }
};

let sample_categories = [];

// Add default samples.
let drumsCategory = new samplesCategory("Drums");
drumsCategory.addSample(new Sample("audio/drum.mp3", "Drum"));
sample_categories.push(drumsCategory);

let guitarsCategory = new samplesCategory("Guitars");
guitarsCategory.addSample(new Sample("audio/bass.mp3", "Bass"));
sample_categories.push(guitarsCategory);

let violinsCategory = new samplesCategory("Violins");
violinsCategory.addSample(new Sample("audio/violin.mp3", "Violin"));
sample_categories.push(violinsCategory);

let othersCategory = new samplesCategory("Others");
othersCategory.addSample(new Sample("audio/piano.mp3", "Piano"));
othersCategory.addSample(new Sample("audio/silence.mp3", "Silence"));
othersCategory.addSample(new Sample("audio/strange-beat.mp3", "Strange Beat"));
sample_categories.push(othersCategory);

// Set duration for all default samples.
async function calculateDurations() {
    promises = [];

    sample_categories.forEach((category) => {
        category.samples.forEach(async (sample) => {
            promises.push(getSampleDuration(sample));
        })
    })

    await Promise.all(promises);
}

// Adding the sample buttons to the page, each sample will generate its own button
function addSampleDropdowns() {
    const samplesDiv = document.getElementById('samples');
    let id = 0
    sample_categories.forEach((category) => {
        let dropdown = document.createElement("div");
        dropdown.className = "dropdown";

        // Create drop down button so that all samples are listed under that when pressed.
        let newButton = document.createElement("button")
        newButton.setAttribute("id", category.name);
        newButton.className = "dropdown-btn";
        newButton.innerText = category.name;

        // Add button to drop down
        dropdown.appendChild(newButton);

        // Create drop down choices.
        dropdownContent = document.createElement("div");
        dropdownContent.className = "dropdown-content";

        category.samples.forEach((sample) => {
            const itemName = sample.name;

            let dropdownItem = document.createElement("a");
            dropdownItem.draggable = true;
            dropdownItem.innerText = sample.name;
            dropdownItem.setAttribute("src", sample.src);
            dropdownItem.setAttribute("name", sample.name);
            dropdownItem.setAttribute("duration", sample.getDuration());
            dropdownItem.classList.add('sample');

            dropdownContent.appendChild(dropdownItem);
        })

        dropdown.appendChild(dropdownContent);

        samplesDiv.appendChild(dropdown)
    })
}

// Add drag events for all samples.
function setSampleEvents() {
    const samplesItems = document.querySelectorAll('.sample');
    
    if (samplesItems === null) {
        console.log("No samples found.");
        return;
    }
    
    samplesItems.forEach((sampleItem) => {
        const src = sampleItem.getAttribute('src');
        const name = sampleItem.getAttribute('name');
        const duration = sampleItem.getAttribute('duration');
        
        // Create an object with the data to be transferred
        var data = {
            src: src,
            name: name,
            duration: duration
        };
        
        sampleItem.addEventListener("dragstart", function(event) {
            // Serialize the object into a JSON string and set it as the data
            event.dataTransfer.setData('application/json', JSON.stringify(data));
            sampleItem.classList.add("dragging_sample");
            console.log("Started dragging " + sampleItem.name);
        })
    })
}

// Add drag related listeners for tracks.
function setTrackEvents() {
    const trackItems = document.querySelectorAll('.trackDiv');
    if (trackItems === null) {
        console.log("No tracks found.");
        return;
    }

    console.log(trackItems.length);

    trackItems.forEach((trackItem) => {
        addDragEventsToTrackItem(trackItem);
    })
}

// There is a upload button that adds a sample to samples array and a sample button with an event listener
const uploadButton = document.getElementById("upload")
uploadButton.addEventListener("click", () => {
    const file = document.getElementById("input-sample").files[0]
    let audioSrc = ""
    if(!file) return
    
    audioSrc = URL.createObjectURL(file)

    let sample = new Sample(audioSrc, "New Sample");
    const promise = getSampleDuration(sample);
    Promise.wait(promise);

    // Push to last category.
    sample_categories.

    samples.push(sample)
    id = samples.length - 1

    let newButton = document.createElement("button")
    newButton.setAttribute("data-id", id)
    newButton.addEventListener("click", () => addSample(newButton))
    newButton.innerText = sample.name

    addButtons.appendChild(newButton)


})

async function initThings() {
    await calculateDurations();
    addSampleDropdowns();
    setSampleEvents();
}

initThings();