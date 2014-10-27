function inIframe () {
    try {
        return window !== window.parent;
    } catch (e) {
        return true;
    }
}

document.addEventListener('slidechanged', function(event) {
    if (!inIframe()) {  // speaker notes
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
