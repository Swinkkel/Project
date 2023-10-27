class Instrument {
    constructor(name, src, duration) {
        this.name = name;
        this.src = src;
        this.volume = 1;
        this.duration = duration;
    }
};

// 2D array of tracks – so one track can have multiple samples in a row
class Track {
    constructor(id) {
        this.id = id;
        this.volume = 0.5;
        this.instruments = [];
        this.looping = false;

        this.playing = false;
        this.audio = new Audio;
    }

    addInstrument(instrument) {
        const instrument_index = this.instruments.length;
        this.instruments.push(instrument);

        console.log(instrument);

        // Get track element we are adding this instrument.
        let trackDiv = document.getElementById("trackDiv" + this.id);

        // Create div for instrument and generate unique id for it.
        let newItem = document.createElement("div");
        newItem.setAttribute("id", "instrumentId" + this.id + "_" + instrument_index);
        newItem.style.width = (100 * Math.pow(Math.log(instrument.duration), 0.5)).toString() + "px";
        newItem.innerText = instrument.name;
        newItem.classList.add("instrument");

        let deleteInstrumentBtn = document.createElement("button");
        deleteInstrumentBtn.innerText = "Delete";
        deleteInstrumentBtn.addEventListener("click", () => {
            // Delete instrument from track.
            console.log("Delete instrument clicked")

            const instrumentToDelete = document.getElementById("instrumentId" + this.id + "_" + instrument_index);
            if (instrumentToDelete == null) {
                return ;
            }
            instrumentToDelete.parentNode.removeChild(instrumentToDelete);

            this.instruments.splice(instrument_index, 1);
        })

        newItem.appendChild(deleteInstrumentBtn);
        
        trackDiv.appendChild(newItem);
    }

    setVolume(volume) {
        this.volume = volume;
    }
};

track_id = 0;
let tracks = []

function addDragEventsToTrackItem(trackItem) {
    console.log("Adding drag events");

    trackItem.addEventListener("dragover", function(event) {
        event.preventDefault();

        if (event.target.tagName.toLowerCase() === 'h2' ||
        event.target.tagName.toLowerCase() === 'button') 
        {
            event.dataTransfer.dropEffect = 'none';
            return;
        }

        event.target.style.backgroundColor = "white";
    })

    trackItem.addEventListener("dragleave", function(event) {
        event.preventDefault();

        if (event.target.tagName.toLowerCase() === 'h2' ||
        event.target.tagName.toLowerCase() === 'button') {
            return;
        }

        event.target.style.backgroundColor = '#cccccc';
    })

    trackItem.addEventListener("drop", function(event) {
        event.preventDefault();

        console.log(event);

        // Retrieve the JSON string from the dataTransfer object
        var jsonData = event.dataTransfer.getData('application/json');

        // Parse the JSON string into an object
        var data = JSON.parse(jsonData);

        // Access the data attributes
        const src = data.src;
        const name = data.name;
        const duration = data.duration;

        // Add instrument to track.
        const index = trackItem.getAttribute('index');
        let track = tracks.find(item => item.id == index);
        if (track == null) {
            console.log("Track was not found with id " + index + ".");
            return;
        }

        track.addInstrument(new Instrument(name, src, duration));

        event.target.style.backgroundColor = '#cccccc';
        console.log("Dropped to track");
    })
}

// Add track to document. For each track there will be container div that contains
// delete button and the track div.
function addTrackToDocument(index) {
    tracks.push(new Track(index));

    let container = document.createElement("div");
    container.setAttribute("id", "trackContainer" + index);

    let deleteTrackBtn = document.createElement("button");
    deleteTrackBtn.innerText = "Delete";
    deleteTrackBtn.addEventListener("click", () => {
        console.log("delete clicked")
        tracks.splice(index, 1);
        const trackToDelete = document.getElementById("trackContainer" + index);
        trackToDelete.parentNode.removeChild(trackToDelete);
    })

    let loopingBtn = document.createElement("button");
    loopingBtn.innerText = "Looping";
    loopingBtn.addEventListener("click", () => {
        tracks[index].looping = !tracks[index].looping;
        if (tracks[index].looping) {
            loopingBtn.classList.add("selected");
        }
        else {
            loopingBtn.classList.remove("selected");
        }
    })


    let volumeControlDiv = document.createElement("div");
    volumeControlDiv.style.width = "100px";

    let volumeControl = document.createElement("div");
    volumeControl.style.width = "100%";

    let volumeLabelDiv = document.createElement("div");
    let volumeValue = document.createElement("span");
    volumeValue.textContent = (tracks[index].volume * 100) + "%";

    volumeLabelDiv.appendChild(volumeValue);

    let volumeSlider = document.createElement("input");
    volumeSlider.style.width = "70px";
    volumeSlider.setAttribute("type", "range");
    volumeSlider.setAttribute("min", "0");
    volumeSlider.setAttribute("max", "100");
    volumeSlider.setAttribute("step", "1");
    volumeSlider.setAttribute("value", "50");

    volumeSlider.addEventListener("input", () => {
        const volume = volumeSlider.value;
        tracks[index].volume = volume / 100;        

        volumeValue.textContent = volume + "%";
    });

    volumeControl.appendChild(volumeSlider);
    volumeControlDiv.appendChild(volumeLabelDiv);
    volumeControlDiv.appendChild(volumeControl);

    let trackDiv = document.createElement("div");
    trackDiv.setAttribute("id", "trackDiv" + index);
    trackDiv.setAttribute("index", index);
    trackDiv.className = "trackDiv";

    let trackDivHeader = document.createElement("h2")
    trackDivHeader.innerText = "Track " + (index + 1)
    trackDiv.appendChild(trackDivHeader)

    container.appendChild(deleteTrackBtn);
    container.appendChild(loopingBtn);
    
    container.appendChild(volumeControlDiv);
    container.appendChild(trackDiv);

    tracksDiv.appendChild(container);

    addDragEventsToTrackItem(trackDiv);
}

// Let's add default tracks to HTML page, so that user can see them
tracksDiv = document.getElementById("tracks")
addTrackToDocument(track_id++);
addTrackToDocument(track_id++);
addTrackToDocument(track_id++);

const playButton = document.getElementById("play")
playButton.addEventListener("click", () => playSong())

function stopSong() {
    console.log("Stop");

    tracks.forEach((track) => {
        stopTrack(track)
    })

    playButton.addEventListener("click", () => playSong());
}

// Song is played so that each track is started simultaneously 
function playSong() {
    console.log("Play");

    tracks.forEach((track) => {
        if (track.instruments.length > 0) {
            playTrack(track)
        }
    })

    playButton.addEventListener("click", () => stopSong());
}

function stopTrack(track) {
    track.audio.pause();
    track.audio.currentTime = 0;
}

// Track is looped – that means it is restarted each time its samples are playd through
function playTrack(track) {

    console.log("Play track " + track.name);

    let i = 0
    
    track.audio.addEventListener("ended", () => {
        if (track.instruments.length == 0) {
            // Empty track.
            return ;
        }

        i = ++i < track.instruments.length ? i : 0
        if (track.looping == false && i == 0) {
            return ;
        }

        track.audio.volume = track.volume;
        track.audio.src = track.instruments[i].src;
        const promise = track.audio.play();
        if (promise !== undefined) {
            promise.then(_ => {
                
            })
            .catch(error => {
    
            });
        }

        console.log("Starting: Track " + track.id + ", instrument " + track.instruments[i].name)
    }, true);

    track.audio.volume = track.volume;
    track.audio.loop = false;
    track.audio.src = track.instruments[0].src;
    const promise = track.audio.play();
    if (promise !== undefined) {
        promise.then(_ => {
            
        })
        .catch(error => {

        });
    }
    console.log("Starting: Track " + track.id + ", instrument " + track.instruments[i].name)
}

const addTrackButton = document.getElementById("add-track");
addTrackButton.addEventListener("click", () => {
    addTrackToDocument(track_id++);
})