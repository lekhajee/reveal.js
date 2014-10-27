function inIframe () {
    try {
        return window !== window.parent;
    } catch (e) {
        return true;
    }
}

document.addEventListener('first-demo', function() {
    if (!inIframe()) {  // speaker notes
        var aVideo = document.getElementById("first-demo-video");
        aVideo.currentTime = 0.0;
        aVideo.play();
    }
} );
