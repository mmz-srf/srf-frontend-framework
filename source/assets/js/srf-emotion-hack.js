export function init() {
    new EmotionHack();
}

class EmotionHack {
    constructor() {
        this.enabled = true;

        this.bunnyvid = document.getElementById("bunnyvid");
        this.bunnyvidIsPlaying = false;
        this.emotionData = {
            "angry": [],
            "sad": [],
            "surprised": [],
            "happy": []
        };
        this.$emojis = $("#emojis");

        $(".js-start-video").on("click", () => {
            this.startBunnyVid();
        });

        this.vid = document.getElementById('videoel');
        this.vid_width = this.vid.width;
        this.vid_height = this.vid.height;
        this.overlay = document.getElementById('overlay');
        this.overlayCC = this.overlay.getContext('2d');
        this.$output = $("#output");
        this.$stop = $(".js-emotion-stop");
        this.$stop.on("click", () => {
            this.enabled = !this.enabled;
        });

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

        // set up video
        if (navigator.getUserMedia) {
            navigator.getUserMedia({video : true}, stream => this.onSuccess(stream), this.onFail);
        } else if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({video : true})
                .then(this.onSuccess)
                .catch(this.onFail);
        } else {
            this.onFail();
        }

        this.vid.addEventListener('canplay', () => {this.startVideo();}, false);


        //*********** setup of emotion detection *************
        // set eigenvector 9 and 11 to not be regularized. This is to better detect motion of the eyebrows
        pModel.shapeModel.nonRegularizedVectors.push(9);
        pModel.shapeModel.nonRegularizedVectors.push(11);

        this.ctrack = new clm.tracker({useWebGL : true});
        this.ctrack.init(pModel);

        this.trackingStarted = false;

        
        delete emotionModel['disgusted'];
        delete emotionModel['fear'];
        this.ec = new emotionClassifier();
        this.ec.init(emotionModel);
        let emotionData = this.ec.getBlank();
    }

    /*********** Setup of video/webcam and checking for webGL support *********/
    adjustVideoProportions() {
        // resize overlay and video if proportions of video are not 4:3
        // keep same height, just change width
        let proportion = this.vid.videoWidth/this.vid.videoHeight;
        this.vid_width = Math.round(this.vid_height * proportion);
        this.vid.width = this.vid_width;
        this.overlay.width = this.vid_width;
    }

    onSuccess(stream) {
        // add camera stream if getUserMedia succeeded
        if ("srcObject" in this.vid) {
            this.vid.srcObject = stream;
        } else {
            this.vid.src = (window.URL && window.URL.createObjectURL(stream));
        }
        this.vid.onloadedmetadata = () => {
            this.adjustVideoProportions();
            this.vid.play();
        }
        this.vid.onresize = () => {
            this.adjustVideoProportions();
            if (this.trackingStarted) {
                this.ctrack.stop();
                this.ctrack.reset();
                this.ctrack.start(this.vid);
            }
        }
    }
    onFail() {
        alert("There was some problem trying to fetch video from your webcam");
    }

    startVideo() {
        this.vid.play();
        this.ctrack.start(this.vid);
        this.trackingStarted = true;

        this.drawLoop();
    }

    drawLoop() {
        window.requestAnimationFrame(() => {this.drawLoop();    });

        if(this.enabled) {
            this.overlayCC.clearRect(0, 0, this.vid_width, this.vid_height);
            if (this.ctrack.getCurrentPosition()) {
                this.ctrack.draw(this.overlay);
            }

            let cp = this.ctrack.getCurrentParameters();
            let er = this.ec.meanPredict(cp);
            if (er) {
                let text = "";
                er.forEach(obj => {
                    text += `<p>${obj.emotion}: ${Number.parseFloat(obj.value).toFixed(3)}</p>`;

                    if (this.bunnyvidIsPlaying) {
                        if(obj.value > .85) {
                            this.emotionData[obj.emotion].push(this.getCurTime());
                        }
                    }

                });

                this.$output.html(text);
            }
        }
    }

    getCurTime() { 
        return this.bunnyvid.currentTime;
    }

    startBunnyVid() {
        this.bunnyvid.play();
        this.videoduration = this.bunnyvid.duration;
        this.bunnyvidIsPlaying = true;

        this.bunnyvid.onended = () => {
            this.bunnyvidIsPlaying = false;
            this.crunchTheNumbers();
        };
    }

    crunchTheNumbers() {
        console.log(this.emotionData);


        let chunks = [];
        for(var i = 0; i < this.videoduration.toFixed(0); i++) {
            chunks.push({s: i, "happy": 0, "sad": 0, "surprised": 0, "angry": 0});
        }

        ["happy", "sad", "surprised", "angry"].forEach(emotion => {
            this.emotionData[emotion].forEach(entry => {
                chunks[entry.toFixed(0)][emotion]++
            });
        });

        chunks.forEach(chunk => {
            if (chunk.happy + chunk.angry + chunk.sad + chunk.surprised <= 4) {
                // skip if very few emotions were shown
                return;
            }

            let maxEmotion = "";
            if (chunk.happy >= chunk.angry && chunk.happy >= chunk.sad && chunk.happy >= chunk.surprised) {
                maxEmotion = "happy";
            } else if (chunk.sad >= chunk.angry && chunk.sad >= chunk.happy && chunk.sad >= chunk.surprised) {
                maxEmotion = "sad";
            } else if (chunk.angry >= chunk.happy && chunk.angry >= chunk.sad && chunk.angry >= chunk.surprised) {
                maxEmotion = "angry";
            } else if (chunk.surprised >= chunk.angry && chunk.surprised >= chunk.sad && chunk.surprised >= chunk.happy) {
                maxEmotion = "surprised";
            } else {
                // idgaf
                return;
            }

            this.$emojis.append(`<div class="emoji emoji--${maxEmotion}" style="left: ${chunk.s / this.videoduration * 100}%"></div>`);
        });

        
    }
}
