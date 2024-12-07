const mysql = require('mysql');
const turf = require('@turf/turf');

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Abcd1234",
    database: "infralink"
  });

const top1 = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAFdlaZn0yx4KiWTrtk24ZbmCHr9L7Ww6I&libraries=drawing&callback=initMap"
                async defer></script>
            </head>`;


async function getConflictManagementPage(dept, type, numberOrCoordinates, startDate, endDate, prjName){
    coordinates = null;
    conflictingCoordinates = null
    deptName = null;
    prjId = null;
    prjId2= null;
    if(type ==1){
        //generating page1, 2 for already tendered project
        con.connect(function(err) {
            if (err) throw err;
            con.query(`SELECT prjId, co_ordinates, date, endDate FROM projects where id = '${numberOrCoordinates}'`, function (err, result, fields) {
                if (err) throw err;
                // console.log(result[0].priority);
                coordinates = result[0].coordinates;
                prjId = result[0].prjId;
            });
            con.query(`select * from projects where conflict = '${numberOrCoordinates}'`, (err, result, fields)=>{
                if (err) throw err;
                if(result.length>0){
                    deptName = result[0].dept;
                    conflictingCoordinates = result[0].coordinates;
                    prjId2 = result[0].prjId;
                }
            });
        });
    }else{
        con.connect(function(err) {
            id =null;
            priority = null;
            if (err) throw err;
            con.query(`select max(id) as id from projects`, function (err, result, fields) {
                if (err) throw err;
                console.log(result[0]);
                id = result[0].id;
            });
            con.query(`select id, priority from projectList where prjName = '${prjName}'`, function (err, result, fields) {
                if (err) throw err;
                // console.log(result[0].priority);
                prjId = result[0].id;
                priority = result[0].priority;
            });
            con.query(`select * from projects left join projectList on projects.prjId = projectList.id where (projectList.priority > '${priority}' and (projects.endDate + projectList.loss_recovery) > '${startDate}' and projects.stage = '3')`, function (err, result, fields) {
                if (err) throw err;
                // console.log(result[0].priority);
                deptName = result[0].dept;
            });
            con.query(`insert into projects (id, dept, prjId, co_ordinates, date, endDate, stage) values('${id}', '${dept}', '${prjId}', '${coordinates}', '${startDate}', '${endDate}', '3')`, (err, result)=>{
                if (err) throw err;
                if(result.length>0){
                    deptName = result[0].dept;
                    for(res in results){
                        if(isConflicting(numberOrCoordinates, res.coordinates)){
                            conflictingCoordinates = res.coordinates;
                            break;
                        }
                    }
                }
            });
        });
    }

    mapdata = {
        map1:{
            polygons: [

            ]
        },
        map2:{
            polygons:[

            ]
        },
        map3:{
            polygons:[

            ]
        }
    };

    phases = null;
    if(deptName){
        mapdata.map1.polygons.push(coordinates);
        mapdata.map1.polygons.push(conflictingCoordinates);
        phases = ["phase1", "phase2", "phase3"];                        ///need to make dynamic
        // phases = getPhases(prjId, prjId2);
    }
    script = `
        <script>
            const dataToSendBack={};
            const dept1 = "${dept}";
            const dept2 = "${deptName}";
            phases = ${phases};
            currentPatch = 2;
            const totalPhases = phases.length;
            function sendMessage(endpoint, json){

            }    
            const mapsData = {
                ${mapdata}
            };

        </script>
    `;

    div1 = `
            <div id="part1" style="max-width: 100vw; height: calc(100vh - 20px);  display: flex; margin-top: 20px;">
            <section id="text" style=" padding: 50px;">
                <h2 style="color: white; padding: 15px 40px; background-image: linear-gradient(to right, rgb(134, 134, 192), rgb(0, 119, 255)); border-radius: 25px;  width: calc(100% - 60px); text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                Let's Build Together...
                </h2>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; background-color: #f9f9f9; border-radius: 20px; margin-top: 20px; width: 100%; max-width: 400px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">

                <h4 style="font-size: 22px; font-weight: bold; color: rgb(50, 50, 50); margin-bottom: 10px; text-align: center;">
                    You Are Conflicting With Another Project
                </h4>

                <span style="font-size: 16px; color: rgb(80, 80, 80); text-align: center; margin-bottom: 15px;">
                    You Can Solve This Conflict By Collaborating...
                </span>

                <label style="font-size: 14px; font-weight: bold; color: rgb(60, 60, 60); margin-bottom: 10px;">
                    Select Date To Schedule Collaboration Meeting
                </label>

                <div style="display: flex; gap: 10px; margin-bottom: 20px; width: 100%; justify-content: center;">
                    <input id="meetDate" type="date" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; width: 48%;">
                    <input id="meetTime" type="time" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; width: 48%;">
                </div>

                <button onclick="save1()"style="padding: 10px 20px; background-color: rgb(0, 119, 255); color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
                    <a href="#part2" style="text-decoration: none; color: honeydew; font-weight: bolder;">Continue</a>
                </button>
            </div>
            </section>
            <section id="map1"
                style="width: 50vw; height: 90%; background-color: white; margin: 50px auto; border-radius: 30px;">
            </section>
        </div>
    `;

    lastscript = `
    <script id="saving">
    page2Data = [];    
        function save1(){
            const date = document.getElementById("meetDate").value;
            const time = document.getElementById("meetTime").value;
            if(date && time){
                sendMessage("/scheduleMeet", {date: date, time:time, with: dept2});
            }else{
                alert("Please Select Valid Date And Time");
            }
        }
        function addPatch(){
           data = {patchNum : currentPatch -1, phasesDates:[]};
            for(i=0; i<totalPhases; i++){
                startDate = document.getElementById(\`startDate\${i+1}\`).value;
                endDate = document.getElementById(\`endDate\${i+1}\`).value;
                if(startDate && endDate){
                    if(i==0)    data.startDate = startDate;
                    if(i==(totalPhases-1))    data.endDate = endDate;
                    data.phasesDates.push({phaseName: phases[i], startDate: startDate, endDate : endDate});
                }else{
                    alert("Please Fill All Details");
                    return ;
                }
            }
            page2Data.push(data);
            htmlcontenet = \`
                <div style="padding: 15px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; max-width: 300px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif; margin: 10px; min-width:200px">
                    <h4 style="font-size: 20px; font-weight: bold; color: #333; margin-bottom: 10px;">Patch \${data.patchNum}</h4>
                    <label style="font-size: 14px; font-weight: bold; color: #555; margin-right: 10px;">Start Date:</label>
                    <span style="font-size: 14px; color: #333;">\${data.startDate}</span><br>
                    <label style="font-size: 14px; font-weight: bold; color: #555; margin-right: 10px;">End Date:</label>
                    <span style="font-size: 14px; color: #333;">\${data.endtDate}</span>
                </div>
            \`;
            document.getElementById("patchName").innerHTML = \`Patch \${currentPatch++}\`;
            document.getElementById("currentSchedule").innerHTML += htmlcontenet;
        }

        function submitSchedule(){
            console.log(page2Data);
            dataToSendBack.page2 = page2Data;
        }

        function setTenderedPatch(){
            date = document.getElementById("tentativeDate").value;
            if(!date) alert("Please Enter Date");
            else
                dataToSendBack.page3 = date;
        }
    </script>
    <script id="mapLoadingScript">
        let map1, map2, map3;
    
        function initMap() {
        // Define center coordinates for all maps
        const centerMap1 = { lat: 37.7749, lng: -122.4194 }; // San Francisco
        const centerMap2 = { lat: 34.0522, lng: -118.2437 }; // Los Angeles
        const centerMap3 = { lat: 34.0522, lng: -118.2437 }; // Los Angeles

        // Initialize maps
        map1 = new google.maps.Map(document.getElementById("map1"), {
            zoom: 10,
            center: centerMap1,
        });

        map2 = new google.maps.Map(document.getElementById("map2"), {
            zoom: 10,
            center: centerMap2,
        });

        map3 = new google.maps.Map(document.getElementById("map3"), {
            zoom: 10,
            center: centerMap3,
        });

        // Draw polygons for each map
        drawPolygons(map1, mapsData.map1);
        drawPolygons(map2, mapsData.map2);
        drawPolygons(map3, mapsData.map3);
    }

    function drawPolygons(map, mapData) {
        mapData.polygons.forEach(polygonCoords => {
            // Convert [lat, lng] to {lat, lng}
            const paths = polygonCoords.map(([lat, lng]) => ({ lat, lng }));

            // Draw the polygon
            const polygon = new google.maps.Polygon({
                paths,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
            });
            polygon.setMap(map);
        });
    }
    </script>
`;

    return top1  + script + `<body style="background-image: linear-gradient(to left, rgb(1, 1, 97), rgb(0, 14, 29))">` + div1 + `</body>` +  lastscript;
}

module.exports = getConflictManagementPage;

function isConflicting(cords1, cords2){
    if(typeof(cords1) == "string"){
        cords1 = JSON.parse(cords1);
    }
    if(typeof(cords2) == "string"){
        cords2 = JSON.parse(cords2);
    }
    var conflictingStatus = {
        cords1 : cords1,
        cords2 : cords2,
    };
    var intersection = turf.intersect(turf.featureCollection([turf.polygon(cords1), turf.polygon(cords2)]));
    if(intersection.geometry.coordinates){
        conflictingStatus.conflictingCords = intersection.geometry.coordinates;
        conflictingStatus.conflictingArea = turf.area(turf.polygon(intersection.geometry.coordinates));
        return conflictingStatus;
    }
    return false;
}

function fetchPossibility(data){

}

function getPhases(id1, id2){

}

