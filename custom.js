function inIframe () {
    try {
        return window !== window.parent;
    } catch (e) {
        return true;
    }
}

document.addEventListener('first-demo', function() {
    if (!inIframe()) {  // speaker notes
        document.getElementById("first-demo-video").play();
    }
} );
