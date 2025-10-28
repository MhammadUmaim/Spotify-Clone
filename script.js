let Play = document.getElementById("play");
console.log("let's write javaScript")
let currentSong = new Audio();

// Global list of songs and the current index so next/previous can work
let songsList = [];
let currentIndex = -1; // -1 means no song loaded yet

async function getSongs() {
    let response = await fetch("./songs/songs.json");
    let data = await response.json();
    return data.songs;
}


function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00"; // Handle invalid duration
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);
    return (
        (minutes < 10 ? "0" + minutes : minutes) +
        ":" +
        (remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds)
    );
}

const playMusic = (track) => {
    // track can be a filename string or an index in songsList
    let trackName = track;
    if (typeof track === 'number') {
        trackName = songsList[track];
    }
    if (!trackName) return;

    currentSong.src = "/songs/" + decodeURI(trackName);
    document.querySelector(".songInfo").innerHTML = decodeURI(trackName);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
    Play.src = "./assets/images/pause.svg";

    // update currentIndex if we can find the track in songsList
    const foundIndex = songsList.indexOf(trackName);
    if (foundIndex !== -1) currentIndex = foundIndex;

    // Wait for the metadata (duration, etc.) to load before updating UI
    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".songTime").innerHTML = `
        ${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}
        `;
    });

    // Ensure the song starts playing as soon as it can
    currentSong.addEventListener("canplay", () => {
        currentSong.play().catch(err => console.log("Playback blocked:", err));
    }, { once: true }); // run only once per song
};

// Helpers to move through the playlist
function nextSong() {
    if (!songsList || songsList.length === 0) return;
    if (currentIndex === -1) currentIndex = 0;
    else currentIndex = (currentIndex + 1) % songsList.length;
    playMusic(songsList[currentIndex]);
}

function prevSong() {
    if (!songsList || songsList.length === 0) return;
    if (currentIndex === -1) currentIndex = 0;
    else currentIndex = (currentIndex - 1 + songsList.length) % songsList.length;
    playMusic(songsList[currentIndex]);
}



async function main() {
    let songs = await getSongs()
    // store globally so controls can access the playlist
    songsList = songs;
    console.log(songs)
    // playMusic(songs[0], true)
    // Play.src = "./assets/images/play.svg"

    // Show all the songs in the playlist.
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
         <li>
             <img class="invert" src="./assets/images/music.svg" alt="">
             <div class="song-info">
                 <div>${decodeURI(song)} </div>
                 <div>Umaim</div>
             </div>
            <span> play now</span>
             <img class="invert play-lib" src="./assets/images/play.svg" alt="">
         </li>`
    }


    // Attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", (element => {
            console.log(e.querySelector(".song-info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".song-info").firstElementChild.innerHTML.trim())
        }))
    })

    // Attach an event listner to play, previous and next
    Play.addEventListener("click", (e => {
        if (currentSong.paused) {
            currentSong.play()
            Play.src = "./assets/images/pause.svg"
        }
        else {
            currentSong.pause()
            Play.src = "./assets/images/play.svg"
        }
    }))

    // Listen for timeUpdate event
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration)
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songTime").innerHTML = `
        ${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}
        `;
        }
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"

        // Add an event listener to seekbar 
        document.querySelector(".seekbar").addEventListener("click", (e) => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
            document.querySelector(".circle").style.left = percent + "%"
            currentSong.currentTime = ((currentSong.duration) * percent) / 100
        })

    })

    // // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", (e)=>{
        e.preventDefault();
        document.querySelector(".left").style.left = "0"
    })

    // // Add an event listener to close hamburger
    document.querySelector(".cross").addEventListener("click", (e)=>{
        e.stopPropagation();
        e.preventDefault();
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    document.querySelector("#previous").addEventListener("click", ()=> {
        prevSong();
    })
    
    // Add an event listener to next
    document.querySelector("#next").addEventListener("click", ()=> {
        nextSong();
    })

    // When a track ends, automatically play the next one
    currentSong.addEventListener('ended', () => {
        nextSong();
    });
 


}

main()




