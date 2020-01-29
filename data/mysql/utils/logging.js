
// gets a function which returns elapsed time
function timestamp() {
    var startTime = new Date();
    return () => ((new Date() - startTime) / 1000).toPrecision(4);
}
