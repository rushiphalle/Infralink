import mysql from 'mysql';  // Replacing require with import for mysql
// import turf from '@turf/turf';  // Replacing require with import for turf
import * as turf from '@turf/turf';


// const turf = require('@turf/turf');
import fetch from 'node-fetch';
 
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Abcd1234",
    database: "infralink"
  });


export default async function getConflictManagementPage(self_deptarment_name, project_type, required_parameters){
    var globalVariable = {};
    var selfProject = {};
    var page1ConflictingInfo = {isConflicting : false};
    if(project_type ==1){
        //its tendered project
        var project_info = await executeQuery(`select * from projects where id = '${required_parameters.id}'`);
        if(project_info){
            var task_info = await executeQuery(`select * from projectList where id = '${project_info[0].prjId}'`);
            selfProject.id = project_info[0].id;
            selfProject.department_name = project_info[0].dept;
            selfProject.project_id = project_info[0].prjId;
            selfProject.co_ordinates = project_info[0].co_ordinates;
            selfProject.start_date = project_info[0].date;
            selfProject.end_date = project_info[0].endDate;
            selfProject.project_name = task_info[0].prjName;
        }
        conflicting_project_info = await executeQuery(`select * from projects where conflict_id = '${selfProject.id}'`);
        if(conflicting_project_info){
            var task_info = await executeQuery(`select * from projectList where id = '${conflicting_project_info[0].prjId}'`);
            page1ConflictingInfo.isConflicting = true;
            page1ConflictingInfo.project = {};
            page1ConflictingInfo.project.id = conflicting_project_info[0].id;
            page1ConflictingInfo.project.department_name = conflicting_project_info[0].dept;
            page1ConflictingInfo.project.project_id = conflicting_project_info[0].prjId;
            page1ConflictingInfo.project.co_ordinates = conflicting_project_info[0].co_ordinates;
            page1ConflictingInfo.project.start_date = conflicting_project_info[0].date;
            page1ConflictingInfo.project.end_date = conflicting_project_info[0].date;
            page1ConflictingInfo.project.project_name = conflicting_project_info[0].prjName;
        }
    }else{
        
        var project_info = await executeQuery(`select * from projects left join projectList on projects.prjId = projectList.id where priority > (select priority from projectList where prjName = '${required_parameters.prjName}') and stage = '3'`);
        console.log("here1 = " + project_info[0].dept);
        // for(project in project_info){
            project_info.forEach((project, index)=>{
            if(isConflicting(project.co_ordinates, required_parameters.co_ordinates)){
                page1ConflictingInfo.isConflicting = true;
                page1ConflictingInfo.project = {};
                page1ConflictingInfo.project.id = project.id;
                page1ConflictingInfo.project.department_name = project.dept;
                page1ConflictingInfo.project.project_id = project.prjId;
                page1ConflictingInfo.project.co_ordinates = JSON.parse(project.co_ordinates);
                page1ConflictingInfo.project.start_date = project.date;
                page1ConflictingInfo.project.end_date = project.endDate;
                page1ConflictingInfo.project.project_name = project.prjName;
            }
        });
        // }
        selfProject.id = (await executeQuery(`select max(id) as id from projects`))[0].id + 1;
        selfProject.department_name = required_parameters.department_name;
        // console.log(required_parameters.prjName);
        selfProject.project_id = (await executeQuery(`select id from projectList where prjName = '${required_parameters.prjName}'`))[0].id;
        selfProject.co_ordinates = required_parameters.co_ordinates;
        selfProject.start_date = required_parameters.start_date;
        selfProject.end_date = required_parameters.end_date;
        // task_info = await executeQuery(`select * from projectList where id = '${conflicting_project_info[0].prjId}'`);
        selfProject.project_name = required_parameters.prjName;

        executeQuery(`insert into projects (id, dept, prjId, co_ordinates, date, endDate) values('${selfProject.id}', '${selfProject.department_name}', '${selfProject.project_id}', '${JSON.stringify(selfProject.co_ordinates)}', '${selfProject.start_date}', '${selfProject.end_date}')`);
    }

    if(page1ConflictingInfo.isConflicting){
        //SELECT DISTINCT(subtaskName), priority FROM task_subtask LEFT JOIN constructionsubtasks ON task_subtask.subtaskId = constructionsubtasks.subtaskId WHERE task_subtask.prjId IN (1, 2) ORDER BY priority ASC;
        var results = await executeQuery(`SELECT DISTINCT(subtaskName), priority FROM task_subtask LEFT JOIN constructionsubtasks ON task_subtask.subtaskId = constructionsubtasks.subtaskId WHERE task_subtask.prjId IN (${selfProject.id}, ${page1ConflictingInfo.project.id}) ORDER BY priority ASC`);
        var phases = [];
        // for(result in results){
            results.forEach((result, index)=>{
                phases.push(result.subtaskName);
            });
            console.log("res= " + results);
        // }
        var conflictingArea = isConflicting(selfProject.co_ordinates, page1ConflictingInfo.project.co_ordinates);
        globalVariable.myData = selfProject;
        globalVariable.conflictingDataPage1 = page1ConflictingInfo.project;
        globalVariable.phases = phases;
        globalVariable.conflictingArea = conflictingArea;
        globalVariable.map1 = [selfProject.co_ordinates, page1ConflictingInfo.project.co_ordinates, globalVariable.conflictingArea];            //mark for review
    }

    //time to check for tendered projects
    var page2ConflictingInfo = {isConflicting : false};
    var project_info = await executeQuery(`select * from projects left join projectList on projects.prjId = projectList.id where priority > (select priority from projectList where prjName = '${required_parameters.prjName}') and stage = '2'`);
    // for(project in project_info){
        project_info.forEach((project, index)=>{
            if(isConflicting(project.co_ordinates, required_parameters.co_ordinates)){
                page2ConflictingInfo.isConflicting = true;
                page2ConflictingInfo.project = {};
                page2ConflictingInfo.project.id = project.id;
                page2ConflictingInfo.project.department_name = project.dept;
                page2ConflictingInfo.project.project_id = project.prjId;
                page2ConflictingInfo.project.co_ordinates = project.co_ordinates;
                page2ConflictingInfo.project.start_date = project.date;
                page2ConflictingInfo.project.end_date = project.endDate;
                page2ConflictingInfo.project.project_name = project.prjName;
            }
        });
    // }

    if(page2ConflictingInfo.isConflicting){
        //SELECT DISTINCT(subtaskName), priority FROM task_subtask LEFT JOIN constructionsubtasks ON task_subtask.subtaskId = constructionsubtasks.subtaskId WHERE task_subtask.prjId IN (1, 2) ORDER BY priority ASC;
        executeQuery(`UPDATE projects SET conflict_id = '${selfProject.id}' where id = '${page2ConflictingInfo.project.id}'`);
        var conflictingArea = isConflicting(selfProject.co_ordinates, page2ConflictingInfo.project.co_ordinates);
        globalVariable.myData = selfProject;
        globalVariable.conflictingDataPage2 = page2ConflictingInfo.project;
        globalVariable.conflictingArea2 = conflictingArea;
        globalVariable.conflictingPortion2 = findArea(conflictingArea);
        globalVariable.conflictingPeriod = findConflictingDate(selfProject.start_date, selfProject.end_date, page2ConflictingInfo.project.start_date, page2ConflictingInfo.project.end_date); //
        // console.log("date1= " + selfProject.start_date + "Date2= "+ selfProject.end_date + "Date3 = "+  page2ConflictingInfo.project.start_date + "Date4"+ page2ConflictingInfo.project.end_date + "Conflicting: " +  globalVariable.conflictingPeriod);
        globalVariable.map2 = [selfProject.co_ordinates, JSON.parse(page2ConflictingInfo.project.co_ordinates), globalVariable.conflictingArea2];            //mark for review
    }

    //time to check for predicted conflicts
    var mlData = await executeQuery(`select * from features`);
    var dataToSendForPrediction = [];
    // for(singleData in mlData){
        mlData.forEach((singleData, index)=>{
            const conflictArea = isConflicting(required_parameters.co_ordinates, singleData.coordinates);
            if(conflictArea){
                dataToSendForPrediction.push({checkFor : "electricity", data : singleData});
            }
        });
        // console.log(dataToSendForPrediction);
    // }
    var prediction = await predict(dataToSendForPrediction);
    var predictionData = [];
    if(prediction){
        // for(p in prediction){
            // prediction.forEach((p, index)=>{
            //     predictionData.push({department_name: "Electricity", conflicting_area : isConflicting(p.    coordinates, selfProject.co_ordinates), probability : p.probability});
            // })

            // }
        }
        
        
        //time to work on divs
        var div1 = ``;
        var div2 = ``;
        if(page1ConflictingInfo.isConflicting){
            var dynamicPhases = ``;
            globalVariable.phases.forEach((phase, index)=>{
                dynamicPhases += `<label style="grid-column: 1/4; font-size: 14px; font-weight: bold; color: #333;">${[phase]}</label>
            <input id="startDate${index+1}" type="date" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; width: 90%;">
            <input id="endDate${index+1}" type="date" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; width: 90%;">`
            });
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

                <div style="background-color:green">
                    <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
                        <label style="font-weight: bold; color: #0056b3;">You Are Conflicting With:</label>
                        <span style="margin-left: 8px; color: #d9534f;">${page1ConflictingInfo.project.department_name}</span><br>
                        
                        <label style="font-weight: bold; color: #0056b3;">For Project:</label>
                        <span style="margin-left: 8px; color: #5bc0de;">${page1ConflictingInfo.project.project_nam}</span><br>
                        
                        <label style="font-weight: bold; color: #0056b3;">Project Duration:</label>
                        <span style="margin-left: 8px; color: #5cb85c;">${page1ConflictingInfo.project.start_date}-${page1ConflictingInfo.project.end_date}</span>
                    </div>
                </div>
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
        div2 = `
            <div id="part2" style="max-width: 100vw; height: calc(100vh - 20px);  display: flex; margin-top: 20px;">
            <div id="schedulingTool" style="width: 90%; background-color: white; border-radius: 12px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 20px; margin: 0 auto; overflow: hidden;">
                <div id="currentSchedule" style="margin-bottom: 20px; height: 150px; background-color: #aaa; display: flex; overflow: auto;">
                </div>
                <div id="SchedulerInterface" style="display: flex; flex-wrap: wrap; gap: 20px;">
                    <div id="Scheduler" style="flex: 2; min-width: 300px;">
                        <h4 style="font-size: 24px; font-weight: bold; color: #333; margin-bottom: 0px;" id="patchName">Patch 1</h4>
                        <div style="height: 50%; overflow-x: auto;">
                            <h6 style="font-size: 18px; font-weight: normal; color: #555; margin-bottom: 0px;">Attach GeoJSON File</h6>
                            <input type="file" style="margin-bottom: 20px; padding: 8px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; width: 90%;">
                
                            <h6 style="font-size: 18px; font-weight: normal; color: #555; margin-bottom: 10px;">Set The Schedule For Respective Tasks</h6>
                            <div id="tasks" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">` + dynamicPhases + 
                            `</div>
                        </div>
                    </div>
            
                    <div id="buttons" style="flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 10px; justify-content: flex-start; align-items: stretch;">
                        <div>
                            <button style="padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; font-size: 14px; cursor: pointer; transition: background-color 0.3s; width: 45%;" onclick="addPatch()">Add Patch</button>
                            <button style="padding: 10px; background-color: #28a745; color: white; border: none; border-radius: 5px; font-size: 14px; cursor: pointer; transition: background-color 0.3s; width: 45%;" onclick="submitSchedule()"><a href="#part3" style="text-decoration: none; color: white; font-weight: bolder;">Submit</a></button>
                        </div>
                        <div id="theirVideo" style="width: 100%; height: 150px; background-color: #f0f0f0; border: 1px solid #ddd; border-radius: 5px; display: flex; align-items: center; justify-content: center; margin-top: 10px; color: #aaa;">Their Video</div>
                        <div id="yourVideo" style="width: 100%; height: 150px; background-color: #f0f0f0; border: 1px solid #ddd; border-radius: 5px; display: flex; align-items: center; justify-content: center; margin-top: 10px; color: #aaa;">Your Video</div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
    var div3 = ``;
    if(page2ConflictingInfo.isConflicting){
        div3 = `<div id="part3" style="max-width: 100vw; height: calc(100vh - 20px);  display: flex; margin-top: 20px;">
                <section style="width: 100%; padding: 50px;">
                    <h2 style="color: white; padding: 15px 40px; background-image: linear-gradient(to right, rgb(134, 134, 192), rgb(0, 119, 255)); border-radius: 25px;  width: calc(100% - 60px); text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        Let's Build Together...
                        </h2>
                    <div id="content" style="
                        background-color: white;  
                        border-radius: 15px; 
                        padding: 20px 15px; 
                        margin: 20px 0px; 
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
                        font-family: Arial, sans-serif;">

                        <label style="
                            color: black; 
                            font-weight: bolder; 
                            font-size: 20px; 
                            display: block; 
                            margin: 20px 15px;">
                            Tendered Projects Which May Conflict With Your Project
                        </label>

                        <div style="padding: 15px 20px; border: 1px solid #ddd; border-radius: 10px; margin: 10px 0px;">
                            <h4 style="
                                margin-bottom: 10px; 
                                color: rgb(50, 50, 50); 
                                font-size: 18px; 
                                font-weight: bold;">
                            </h4>

                            <div id="timeline" style="margin-top: 15px; color: rgb(50, 50, 50);">
                                <p style="margin-bottom: 10px; font-size: 16px; background-color: rgb(178, 248, 225); border-radius: 10px; padding: 5px;">
                                    Your Plan Is Conflicting With Area ${globalVariable.conflictingPortion2} mSq<br>Which Can Be Done Colabratively Within ${globalVariable.conflictingPeriod.end - globalVariable.conflictingPeriod.start} days <br> So please Select the on which you want to start this collabrative task
                                </p>
                                <label for="" style="display: block; margin-bottom: 5px; color: rgb(80, 80, 80);">
                                    Tentative Start Date
                                </label>
                                <input id="tentativeDate" type="date" style="
                                    padding: 8px; 
                                    font-size: 14px; 
                                    border: 1px solid #ccc; 
                                    border-radius: 5px; 
                                    width: 100%;">
                            </div>
                            <button onclick="setTenderedPatch()"><a href="#part4">Submit</a></button>
                        </div>
                        
                        <div id="status" style="
                            width: 90%; 
                            display: flex; 
                            border-radius: 25px; 
                            margin: 20px auto; 
                            overflow: hidden; 
                            font-family: Arial, sans-serif; 
                            font-size: 14px; 
                            text-align: center; 
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                            <div style="
                                width: 33%;  
                                background-color: green; 
                                padding: 10px; 
                                color: white; 
                                font-weight: bold;">
                                YOUR AREA
                            </div>

                            <div style="
                                width: 33%;  
                                background-color: red; 
                                padding: 10px; 
                                color: white; 
                                font-weight: bold;">
                                CONFLICTING AREA
                            </div>

                            <div style="
                                width: 33%;  
                                background-color: blue; 
                                padding: 10px; 
                                color: white; 
                                font-weight: bold;">
                                THEIR AREA
                            </div>
                        </div>
                    </div>
                </section>
                <section id="map2" style="width: 50vw; height: 90%; background-color: white; margin: 50px auto; border-radius: 30px;">
                </section>
            </div>`;
    }
    var div4 = `
        <div id="part4" style="max-width: 100vw; height: calc(100vh - 20px);  display: flex; margin-top: 20px;">
        <section style="width: 100%; padding: 50px;">
            <h2
                style="color: white; padding: 15px 40px; background-image: linear-gradient(to right, rgb(134, 134, 192), rgb(0, 119, 255)); border-radius: 25px;  width: calc(100% - 60px); text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                Let's Build Together...
            </h2>
            <div id="content" style="background-color: white;  border-radius: 15px; padding: 20px 15px; margin: 20px 0px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">
    
                <label style="color: black; font-weight: bolder; font-size: 20px; display: block; margin: 20px 15px;">
                    Projects may be initiated in a few months (AI Analyzed)
                </label>
                <div
                    style="width: 90%; background-color: white; border: 1px solid #ddd; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
    
                    <div style="display: flex; flex-direction: column; gap: 10px; font-size: 16px; color: rgb(60, 60, 60);">
    
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <label style="font-weight: bold;">Department:</label>
                            <span style="font-size: 16px; color: rgb(50, 50, 50);">Ministry of Petroleum And Natural Gas</span>
                        </div>
    
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <label style="font-weight: bold;">Name:</label>
                            <span style="font-size: 16px; color: rgb(50, 50, 50);">Gas Pipeline</span>
                        </div>
    
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <label style="font-weight: bold;">Probability in Upcoming One Year:</label>
                            <span style="font-size: 16px; font-weight: bold; color: green;">73.2%</span>
                        </div>
    
                        <label style="color: rgb(120, 120, 120); font-style: italic; text-align: center; margin-top: 10px;">
                            Not Confirmed! Confirmation Request Sent to Department
                        </label>
    
                        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                            <button
                                style="padding: 10px 20px; background-color: red; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                                Ignore
                            </button>
                            <button
                                style="padding: 10px 20px; background-color: blue; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                                Contact Department
                            </button>   
                        </div>
                    </div>
    
                    <button onclick="next2()"
                        style="padding: 10px 20px; background-color: rgb(0, 119, 255); color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
                        Ignore All
                    </button>
                </div>
            </div>
        </section>
        <section id="map3"
            style="width: 50vw; height: 90%; background-color: white; margin: 50px auto; border-radius: 30px;">
        </section>
    </div>
    `;

    var head = `
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAFdlaZn0yx4KiWTrtk24ZbmCHr9L7Ww6I&libraries=drawing&callback=initMap"
            async defer></script> 
        </head>
    `;
    var globalScript = `
        <script>
            variables = ${JSON.stringify(globalVariable)};
            dataToSendBack = {};
        </script>
    `;
    var body = div1 + div2 + div3 + div4;
    var endingScripts = `
        <script id="saving">
            function sendMessage(endpoint, data){
            }
            currentPatch = 2;
            page2Data = [];    
            function save1(){
                const date = document.getElementById("meetDate").value;
                const time = document.getElementById("meetTime").value;
                if(date && time){
                    sendMessage("/scheduleMeet", {date: date, time:time, with: variables.conflictingDataPage1.department_name});
                }else{
                    alert("Please Select Valid Date And Time");
                }
            }
            function addPatch(){
            data = {patchNum : currentPatch -1, phasesDates:[]};
                for(i=0; i<variables.phases.length; i++){
                    startDate = document.getElementById(\`startDate\${i+1}\`).value;
                    endDate = document.getElementById(\`endDate\${i+1}\`).value;
                    if(startDate && endDate){
                        if(i==0)    data.startDate = startDate;
                        if(i==(variables.phases.length-2))    data.endDate = endDate;
                        data.phasesDates.push({phaseName: variables.phases[i], startDate: startDate, endDate : endDate});
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
            
            
           

            // Initialize maps
            console.log(variables.map1);
            if(document.getElementById("map1")){
            const centerMap1 = { lat: variables.map1[0][0][0], lng: variables.map1[0][0][1] }; // San Francisco
                map1 = new google.maps.Map(document.getElementById("map1"), {
                    zoom: 10,
                    center: centerMap1,
                });
                drawPolygons(map1, variables.map1);
            }
            if(document.getElementById("map2")){
            const centerMap2 = { lat: variables.map2[0][0][0], lng: variables.map2[0][0][1] }; // Los Angeles
                map2 = new google.maps.Map(document.getElementById("map2"), {
                    zoom: 10,
                    center: centerMap2,
                });
                console.log(variables.map2);
                drawPolygons(map2, variables.map2);
            }

            if(document.getElementById("map3")){
             const centerMap3 = { lat: variables.map3[0][0][0], lng: variables.map3[0][0][1] }; // Los Angeles
                map3 = new google.maps.Map(document.getElementById("map3"), {
                    zoom: 10,
                    center: centerMap3,
                });
                drawPolygons(map3, variables.map3);
            }

            // Draw polygons for each map
            
            
        }
        function drawPolygons(map, mapData) {
            color = ['green', 'red', 'blue'];
            index = 0;
            mapData.forEach(polygonCoords => {
                // Convert [lat, lng] to {lat, lng}
                const paths = polygonCoords.map(([lat, lng]) => ({ lat, lng }));

                // Draw the polygon
                const polygon = new google.maps.Polygon({
                    paths,
                    strokeColor: color[index++],
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
    return `<!DOCTYPE html> <html lang="en">` + head + globalScript + body + endingScripts + `</html>`;
}


// module.exports = getConflictManagementPage;

async function executeQuery(query) {
    return new Promise((resolve, reject) => {
      con.query(query, (err, results) => {
        if (err) {
          reject(err); // Reject if there is an error
        } else {
          resolve(results); // Resolve with the query result
        }
      });
    });
  }

function isConflicting(cords1, cords2){
    if(typeof(cords1) == "string"){
        cords1 = JSON.parse(cords1);
        // console.log(cords1);
    }
    if(typeof(cords2) == "string"){
        cords2 = JSON.parse(cords2);
        // console.log(cords2);
    }
    if(cords1 === cords2)   return cords1;
    var poly1 = turf.polygon([cords1]);
    var poly2 = turf.polygon([cords2]);
    var intersection = turf.intersect(turf.featureCollection([poly1, poly2]));
    if(intersection){
        return intersection.geometry.coordinates[0];
    }
    return false;
}

function findArea(cords){
    if(typeof(cords)=="string"){
        JSON.parse("string");
    }
    // console.log(cords);
    return turf.area(turf.polygon([cords]));

}

function findConflictingDate(startDate1, endDate1, startDate2, endDate2) {
    // Parse integer dates into JavaScript Date objects
    const parseDate = (dateInt) => {
        const year = Math.floor(dateInt / 10000);
        const month = Math.floor((dateInt % 10000) / 100) - 1; // JavaScript months are 0-indexed
        const day = dateInt % 100;
        return new Date(year, month, day);
    };

    const start1 = parseDate(startDate1);
    const end1 = parseDate(endDate1);
    const start2 = parseDate(startDate2);
    const end2 = parseDate(endDate2);

    // Check if the date ranges overlap
    if (end1 < start2 || end2 < start1) {
        return null; // No conflict
    }

    // Calculate the overlap
    const conflictStart = new Date(Math.max(start1, start2));
    const conflictEnd = new Date(Math.min(end1, end2));

    // Convert the result back to integer format YYYYMMDD
    const formatDateInt = (date) =>
        date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

    return {
        start: formatDateInt(conflictStart),
        end: formatDateInt(conflictEnd)
    };
}

async function predict(data){
    console.log("Data");
    var stream = [];
    return stream;
    data.forEach((d)=>{
        if(isConflicting(d.co_ordinates, selfProject.co_ordinates)){
            stream.push({searchFor: "Electricity", cords: isConflicting(d.co_ordinates, selfProject.co_ordinates), features : data});
        }
    });

    console.log(data);
    return await fetch('http://192.168.238.1:5000/predict_batch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(stream),
    }); 
}