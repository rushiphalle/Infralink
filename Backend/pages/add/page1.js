function update() {
    var selected_item = document.getElementById("projects").value;
    if (selected_item == "road") {
        var section = document.getElementById("question2");
        section.innerHTML =`<Label>Enter Start City</Label> <input type="text" id="start"> <Label>Enter End City</Label> <input type="text" id="end">`;  // Correct way to use innerHTML
    }
}

startCity;
endCity;
function showOnMap(){
    startCity = document.getElementById("start").value;
    console.log(startCity);
    endCity = document.getElementById("end").value;
    getCoordinatesAndDisplayRoute(startCity, endCity)
}