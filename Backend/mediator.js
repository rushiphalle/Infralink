const express = require('express');  // npm install express
const nodemailer = require('nodemailer');  // npm install nodemailer
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql');
const { verify } = require('crypto');
const getConflictManagementPage = require('./finalBackendModule');

// Create a transporter object using your Gmail credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'teaminfralink@gmail.com',
        pass: 'newc qlfe lxur rnnt' // Use environment variables for sensitive info
    }
});

// Initialize OTP storage
var otp_log = {};

const app = express();
app.listen(3000, () => {
    console.log("Server Started");
});

// Middleware for parsing incoming data
app.use(express.json());  // For parsing JSON data
app.use(express.urlencoded({ extended: true }));  // For parsing URL-encoded form data

// Forgot password endpoint
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


app.get("/main", async (req, res)=>{
    res.send(await getConflictManagementPage("MOHOU", 2, {prjName: "Road Construction", co_ordinates: [[45.678,89.345],[45.679,89.346],[45.680,89.347],[45.681,89.348],[45.678,89.345]] , department_name: "MOHOU", start_date: 20250101, end_date: 20260101}));
});

// Verify OTP endpoint
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

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // Ensure unique filenames
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Ensure the uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Endpoint to handle user registration
app.post('/register', upload.single('file'), (req, res) => {
    try {
        // Validate the uploaded file
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        // Retrieve the text data
        const textData = req.body.data;
        const ary = textData.split("<split>");


        // Temporary and target paths
        const tempPath = req.file.path;
        const targetPath = path.join(__dirname, 'uploads', req.file.originalname);

        // Ensure the target directory exists
        fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

        // Move the file to the target directory
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

app.get("/checkConflicts", (req, res)=>{
    var conflicting_projects = {
        know: null,
        predicted : null
    }
    //get valid known constructions

    //pass for conflict detection and store in object

    //get all predictable data

    //pass for conflict detection and store in object

    //send for prediction

    //send department head a request for confirmation
    
    //store in object

    //return to requestor
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

function checkShapeConflict(shape1, shape2) {
    // Case 1: Polygon-Polygon intersection
    if (shape1.type === 'Polygon' && shape2.type === 'Polygon') {
      return turf.booleanIntersects(shape1, shape2); // Check if polygons intersect
    }
  
    // Case 2: Polygon-Polyline intersection
    if (shape1.type === 'Polygon' && shape2.type === 'LineString') {
      return turf.booleanIntersects(shape1, shape2); // Check if polygon intersects with polyline
    }
  
    if (shape1.type === 'LineString' && shape2.type === 'Polygon') {
      return turf.booleanIntersects(shape1, shape2); // Check if polyline intersects with polygon
    }
  
    // Case 3: Polyline-Polyline intersection
    if (shape1.type === 'LineString' && shape2.type === 'LineString') {
      // Check if any line segment of polyline1 intersects with polyline2
      const polyline1 = turf.lineString(shape1.coordinates);
      const polyline2 = turf.lineString(shape2.coordinates);
  
      // Loop through line segments and check for intersections
      for (let i = 0; i < polyline1.geometry.coordinates.length - 1; i++) {
        const segment1 = turf.lineString([polyline1.geometry.coordinates[i], polyline1.geometry.coordinates[i + 1]]);
        for (let j = 0; j < polyline2.geometry.coordinates.length - 1; j++) {
          const segment2 = turf.lineString([polyline2.geometry.coordinates[j], polyline2.geometry.coordinates[j + 1]]);
          if (turf.booleanIntersects(segment1, segment2)) {
            return true; // If any segment intersects, return true
          }
        }
      }
      return false; // If no intersection is found
    }
  
    return false; // Default case (no intersection)
}

function convertToRectangleCoordinates(corners) {
    const [[x1, y1], [x2, y2]] = corners;

    // Define the four corners of the rectangle
    const rectangle = [
        [x1, y1], // First corner
        [x1, y2], // Second corner (same x as the first, different y)
        [x2, y2], // Third corner (same y as second, different x)
        [x2, y1], // Fourth corner (same x as third, different y)
        [x1, y1]  // Close the rectangle by returning to the first corner
    ];

    return rectangle;
}

function isConflicting(shapeCords1, shapeCords2){
    const cords1 = JSON.parse(shapeCords1);
    const cords2 = JSON.parse(shapeCords2);
    shape1, shape2
    // if(isPolyline1){
    //     shape1 = turf.lineString(cords1);
    // }else{
        shape1 = turf.polygon([
            convertToRectangleCoordinates(cords1)
        ]);
    // }
    // if(isPolyline2){
    //     shape2 = turf.lineString(cords2);
    // }else{
        shape2 = turf.polygon([
            convertToRectangleCoordinates(cords2)
        ]);
    // }
    return turf.booleanIntersects(shape1, shape2);

}


