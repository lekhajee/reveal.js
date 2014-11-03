
function isPreviewFrame() {
    var frameElement = window.frameElement;

    if (frameElement !== null) {
        if (frameElement.getAttribute("id") === "next-slide") {
            return true;
        }
    }
    return false;

}

Reveal.addEventListener('slidechanged', function(event) {
    if (!isPreviewFrame()) {
        var sectionTag = Reveal.getCurrentSlide();
        var videos = document.getElementsByTagName("video");
        for (var i = 0; i < videos.length; i++) {
            var eachVideo = videos[i];
            if (eachVideo.parentNode === sectionTag) {
                console.log("starting a video");
                console.log(eachVideo);
                eachVideo.currentTime = 0.0;
                eachVideo.play();
            }
        }
    }
});
