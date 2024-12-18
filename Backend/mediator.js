import express from 'express';  // npm install express
import nodemailer from 'nodemailer';  // npm install nodemailer
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mysql from 'mysql';
import { verify } from 'crypto';
import getConflictManagementPage from './finalBackendModule.js'; // Add .js extension
import cors from 'cors';
import { fileURLToPath } from 'url';
import * as turf from '@turf/turf'; 


// import path from 'path';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'teaminfralink@gmail.com',
        pass: 'newc qlfe lxur rnnt' 
    }
});
var otp_log = {};

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(3000, () => {
    console.log("Server Started");
});


app.get("/forgot-password", (req, res) => {
    const email = req.query.email;
    const OTP = Math.floor(Math.random() * 9000 + 1000);
    const verification_id = Math.floor(Math.random() * 9000 + 10000);
    if(sendMail(email, "Verification Code", "OTP" + OTP)){
        otp_log[verification_id] = OTP;  // Store OTP against verification_id
        res.json({
            session_id: verification_id  // Return session_id to the user
        });
    }else{
        res.send("err");
    }
});

app.get("/verify", (req, res) => {
    const session_id = req.query.session_id;  // Corrected typo here
    const OTP = req.query.otp;

    if (otp_log[session_id] && otp_log[session_id] == OTP) {
        delete otp_log[session_id];  // Clear OTP after successful verification
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.get("/getdata1", (req, res)=>{
    res.json({
        project_progress : {
            pie : [["250", "110"], ["100", "260"]],
            content : ["Content1", "Content2"]
        },
        urgent : ["Action1"],
        project_summary: [
            {
                pie : [["270deg", "90deg"], ["270deg", "90deg"]],
                content : ["Content1", "Content"]
            },
            {
                pie : [["270deg", "90deg"], ["270deg", "90deg"]],
                content : ["Content1", "Content"]
            } 
        ],
        team : [
            {
                name : "Rushikesh Phalle",
                role : "Developer",
                current_task : "xyz",
                status: "Right Path"
            }, 
            {
                name : "Rushikesh Phalle",
                role : "Developer",
                current_task : "xyz",
                status: "Right Path"
            }
        ],
        timeline : {
            "11/12/2024": "Join Meeting"
        }
    });
});

app.get("/main", async (req, res)=>{
    res.send(await getConflictManagementPage("MOHOU", 2, {prjName: "Road Construction", co_ordinates: [[45.678,89.345],[45.679,89.346],[45.680,89.347],[45.681,89.348],[45.678,89.345]] , department_name: "MOHOU", start_date: 20250101, end_date: 20280101}));
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // Ensure unique filenames
    }
});

const upload = multer({ storage: storage });


const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}


app.post('/register', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const textData = req.body.data;
        const ary = textData.split("<split>");

        const tempPath = req.file.path;
        const targetPath = path.join(__dirname, 'uploads', req.file.originalname);

        fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

        fs.rename(tempPath, targetPath, (err) => {
            if (err) {
                console.error('Error moving the file:', err);
            }
            console.log(`File saved as ${targetPath}`);
        });
        res.status(200).send(verifyDocs(ary[0], ary[1], ary[2], ary[3], ary[4], ary[5], ary[6], "file"));
    } catch (error) {
        console.error('Error handling the request:', error);
        res.status(500).send('An error occurred');
    }
});



function verifyDocs(name, orgName, designation, email, mobile, address, password, filePath){
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Abcd1234",
        database: "infralink"
      });
      
      con.connect(function(err) {
        if (err) return "false";
        console.log("Connected!");
        var sql = `INSERT INTO users (id, name, org_name, designation, email, mobile, address, password) VALUES (  (SELECT COALESCE(MAX(id), 0) + 1 FROM (SELECT id FROM users) AS temp),   '${name}','${orgName}', '${designation}',  '${email}',  '${mobile}',  '${address}',   '${password}');`;
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
          con.query("commit", function (err, result) {
              if (err) throw err;
            });
          return "true";
        });
      });
}

function sendMail(email, subject, data){
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'teaminfralink@gmail.com',
            pass: 'newc qlfe lxur rnnt' // Use environment variables for sensitive info
        }
    });
    var mailOptions = {
        from: 'TeamInfralink@gmail.com',
        to: email,
        subject: subject,
        text: data
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return false;
        } else {
            return true;
        }
    });
}

function convert(cords){
    // console.log(cords);
    const polyline = turf.lineString(cords);

        // Desired width (1 unit)
        const width = 1;
        // Create offset lines
        const leftOffset = turf.lineOffset(polyline, width / 2); // Offset to the left
        const rightOffset = turf.lineOffset(polyline, -width / 2); // Offset to the right

        // Combine into a polygon by manually closing the coordinates
        const leftCoords = leftOffset.geometry.coordinates;
        const rightCoords = rightOffset.geometry.coordinates.reverse(); // Reverse to close the polygon
        return leftCoords.concat(rightCoords, [leftCoords[0]]);
}

// app.use(express.static(path.resolve('D:', 'Tech Stack', 'Projects', 'Sih', 'Infralink', 'Backend', 'pages')));


// Serve the index.html from the "pages" directory at the root
app.get("/", (req, res) => {
    const pagesDir = path.join("D:\\Tech Stack\\Projects\\Sih\\Infralink\\Backend\\pages", 'main');
    
    // Log the pages directory path for debugging
    console.log("Pages Directory:", pagesDir);
    
    // Serve static files (CSS, JS, images) from the "pages" directory
    app.use(express.static(pagesDir));
    const indexPath = path.resolve(pagesDir, 'index.html');
    console.log("Sending file:", indexPath);  // Log the path of the file being sent
    res.sendFile(indexPath);
});

app.get("/login", async(req, res)=>{
    
    const pagesDir = path.join("D:\\Tech Stack\\Projects\\Sih\\Infralink\\Backend\\pages", 'dashboard');

    // Log the pages directory path for debugging
    console.log("Pages Directory:", pagesDir);

    // Serve static files (CSS, JS, images) from the "pages" directory
    app.use(express.static(pagesDir));
    const login = req.query.login;
    const password = req.query.password;
    const stat = await executeQuery(`select * from users where email = '${login}' and password = '${password}'`);
    console.log(stat);
    if(stat.length >0){
        res.sendFile(path.resolve(pagesDir, 'index.html'));
    }else{
        res.send("Invalid Form");
    }
});

app.get("/our", (req, res)=>{
    const pagesDir = path.join("D:\\Tech Stack\\Projects\\Sih\\Infralink\\Backend\\pages", 'our projects');
    
    // Log the pages directory path for debugging
    console.log("Pages Directory:", pagesDir);
    
    // Serve static files (CSS, JS, images) from the "pages" directory
    app.use(express.static(pagesDir));
    const indexPath = path.resolve(pagesDir, 'index.html');
    console.log("Sending file:", indexPath);  // Log the path of the file being sent
    res.sendFile(indexPath);
});


app.get("/add", (req, res)=>{
    const pagesDir = path.join("D:\\Tech Stack\\Projects\\Sih\\Infralink\\Backend\\pages", 'add');
    
    // Log the pages directory path for debugging
    console.log("Pages Directory:", pagesDir);
    
    // Serve static files (CSS, JS, images) from the "pages" directory
    app.use(express.static(pagesDir));
    const indexPath = path.resolve(pagesDir, 'index.html');
    console.log("Sending file:", indexPath);  // Log the path of the file being sent
    res.sendFile(indexPath);
});


app.get("/get1", async(req, res)=>{
    // var data = JSON.parse(req.query.jsonData);
    // console.log(data.co_ordinates);
    // res.send(await getConflictManagementPage("MOHOU", 2, {prjName: "Road Construction", co_ordinates: [[45.678,89.345],[45.679,89.346],[45.680,89.347],[45.681,89.348],[45.678,89.345]] , department_name: "MOHOU", start_date: 20250101, end_date: 20280101}));
    var cookie = "rushikeshgphalle@gmail.com";
    var department_name = await executeQuery(`select dept from users where cookie ='${cookie}'`);
    var data = JSON.parse(req.query.jsonData);
    data.co_ordinates = convert(data.co_ordinates);
    data.department_name = department_name[0].dept;
    // console.log(req.query);
    res.send(await getConflictManagementPage(department_name[0].dept, 2, data));
});
 
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Abcd1234",
    database: "infralink"
});

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
