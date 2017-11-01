export function init() {
        new SeeMore();
}

class SeeMore {
    constructor() {
        this.vid = document.getElementsByClassName('seemore-video--element')[0];
        this.vid_width = this.vid.width;
        this.vid_height = this.vid.height;
        this.overlay = document.getElementsByClassName('seemore-video--overlay')[0];
        this.overlayCC = this.overlay.getContext('2d');
        this.front = document.getElementsByClassName("seemore-image--front")[0];
        this.back  = document.getElementsByClassName("seemore-image--back")[0];

        this.ctrack = new clm.tracker();
        this.ctrack.init();
        this.trackingStarted = false;

        this.factorFront = 10;
        this.factorBack = 5;

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
        this.overlayCC.clearRect(0, 0, this.vid_width, this.vid_height);
        if (this.ctrack.getCurrentPosition()) {
            this.ctrack.draw(this.overlay);

            this.updateImages( this.ctrack.getCurrentPosition()[33] );
        }
    }

    updateImages(coordinates) {
        let rX = (150-coordinates[1]);
        let rY = (200-coordinates[0]);

        let translateX = (150-coordinates[0])*1.5;

        this.front.style.transform = `perspective(525px) translateZ(0) rotateX(${rX/this.factorFront}deg) rotateY(${rY/this.factorFront}deg)`;
        this.back.style.transform = `perspective(525px) translateX(${translateX}px) translateZ(-100px) rotateX(${rX/this.factorBack}deg) rotateY(${rY/this.factorBack}deg)`;
    }
}