
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var map = L.map('map', {
    center: [18.788346, 98.985291], // ตั้งค่าพิกัดศูนย์กลางของแผนที่
    zoom: 18, // ตั้งค่าระดับซูมเริ่มต้น
    layers: [Esri_WorldImagery] // เพิ่ม Tile Layer เป็นภาพถ่ายจาก Esri
});

L.control.scale().addTo(map);

// สร้าง feature group สำหรับจัดการเลเยอร์
var cm = L.featureGroup().addTo(map);

// กำหนดสไตล์สำหรับเลเยอร์ GeoJSON
var style = {
    color: '#000000',    // ขอบสีดำ
    fillColor: 'transparent', // สีพื้นโปร่งใส
    opacity: 0.5,       // ความโปร่งใสของสีพื้น
    weight: 5            // ความหนาของขอบ
};

// เพิ่มข้อมูล GeoJSON ไปยัง feature group พร้อมสไตล์
L.geoJSON(polygon, { style: style }).addTo(cm);

// สร้างอ็อบเจ็กต์ overlayMaps สำหรับการควบคุมเลเยอร์
var overlayMaps = {
    "ขอบเขตเทศบาลนครเชียงใหม่": cm
};

// สร้างการควบคุมเลเยอร์และเพิ่มไปยังแผนที่ที่มุมล่างขวา
L.control.layers(null, overlayMaps, { position: 'bottomright' }).addTo(map);






map.on('click', (event) => {
    const latlng = event.latlng;
    const lat = latlng.lat.toFixed(2);
    const lng = latlng.lng.toFixed(2);
    console.log(`Latitude: ${lat}, Longitude: ${lng}`);
    document.getElementById("mapClick").value = `${lat}, ${lng}`;
});



map.on('zoomend', (event) => {
    document.getElementById("mapZoom").value = map.getZoom()
})

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// var drawControl = new L.Control.Draw({
//     draw: {
//         polygon: false,
//         polyline: false,
//         rectangle: true,
//         circle: false,
//         marker: false,
//         circlemarker: false // ปิดการใช้งานการวาด CircleMarker
//     },
//     edit: {
//         featureGroup: drawnItems,
//         remove: true
//     }
// });

// map.addControl(drawControl);

map.pm.addControls({
    position: 'topleft',
    drawCircleMarker: false,
    drawMarker: false,
    rotateMode: false,
    drawPolyline: false,
    drawPolygon: false,
    drawCircle: false,
    drawText: false,
    cutPolygon: false,

});


var polygonCount = 0;

map.on('pm:create', function (event) {
    // รับเลเยอร์ที่ถูกวาด
    var layer = event.layer;
    drawnItems.addLayer(layer);

    // แปลงเลเยอร์เป็นวัตถุ GeoJSON
    var geoJSON = layer.toGeoJSON();
    var coordinates = geoJSON.geometry.coordinates[0];

    polygonCount++;
    var polygonName = "Polygon ลำดับที่: " + polygonCount;
    layer.bindTooltip(polygonName).openTooltip();

    // แสดงพิกัดของมุมบนขวาและมุมล่างซ้าย
    console.log(coordinates[1][0], coordinates[3][1], coordinates[3][0], coordinates[1][1]);

    // ส่งพิกัดไปยัง API โดยใช้ axios 
    // กรณีจะรันใน localhost ให้ใช้ hostUrl //
    // กรณีจะรันใน Server ให้ใช้ server // 
    // กรณีเทสผ่านเครื่องเปิด localhost (บรรทัด71) เทสผ่าน server เปิดserver (บรรทัด72)

    const server = 'http://localhost:5200/pdt/roofdetect';
    // const server = '/pdt/roofdetect';

    function checkProperty() {

    }


    axios.post(server, {
        bbox: [coordinates[1][0], coordinates[3][1], coordinates[3][0], coordinates[1][1]]
    })
        .then(function (response) {
            let data = JSON.parse(response.data)
            console.log(data);

            let mr = 0;
            let cr = 0;
            L.geoJSON(data, {
                style: function (feature) {
                    let color = "red";

                    if (feature.properties.label == "Metal roof") {
                        color = "yellow";
                        mr++;
                    } else if (feature.properties.label == "Concrete roof") {
                        color = "green";
                        cr++;
                    }
                    console.log("Metal roof: ", mr);
                    console.log("Concrete roof: ", cr);
                    console.log(feature.properties.label);
                    return { color: color };
                }
            }).bindPopup(function (layer) {
                return layer.feature.properties.label;
            }).addTo(map);


        })
        .catch(function (error) {
            console.log(error);
        });

    // แสดงพิกัดพร้อมกับป้ายกำกับ
    coordinates.forEach(function (coord, index) {
        var corner = "";
        if (index === 1) {
            corner = "มุมบนขวา";
            console.log(corner + ": [" + coord[1] + ", " + coord[0] + "]");
        } else if (index === 3) {
            corner = "มุมล่างซ้าย";
            console.log(corner + ": [" + coord[1] + ", " + coord[0] + "]");
        }
    });
});



map.on("pm:drawend", (e) => {
    // Get the layer that was drawn
    const layer = e.shape;

    // Log the GeoJSON object
    console.log(layer);
});

// map.on(L.Draw.Event.CREATED, function (event) {
//     var layer = event.layer;
//     drawnItems.addLayer(layer);

//     var geoJSON = layer.toGeoJSON();
//     var coordinates = geoJSON.geometry.coordinates[0];
//     polygonCount++;
//     var polygonName = "Polygon ลำดับที่: " + polygonCount;
//     layer.bindTooltip(polygonName).openTooltip();

//     console.log(coordinates[1][0], coordinates[3][1], coordinates[3][0], coordinates[1][1]);

// axios.post(`http://localhost:5100/roofdetect`, {
//     bbox: [coordinates[1][0], coordinates[3][1], coordinates[3][0], coordinates[1][1]]
// })
//     .then(function (response) {
//         let data = JSON.parse(response.data)
//         console.log(data);
//         L.geoJSON(data, {
//             style: function (feature) {
//                 return { color: "red" };
//             }
//         }).bindPopup(function (layer) {
//             return layer.feature.properties.label;
//         }).addTo(map);
//     })
//     .catch(function (error) {
//         console.log(error);
//     });




// axios.get(`http://localhost:5100/api/bbox/${coordinates[1][0]}/${coordinates[1][1]}/${coordinates[3][0]}/${coordinates[3][1]}`).then(r => {
//     console.log(r);
// })

// แสดงพิกัดพร้อมกับป้ายกำกับ
//     coordinates.forEach(function (coord, index) {
//         var corner = "";
//         if (index === 1) {
//             corner = "มุมบนขวา";

//             console.log(corner + ": [" + coord[1] + ", " + coord[0] + "]");
//         } else if (index === 3) {
//             corner = "มุมล่างซ้าย";

//             console.log(corner + ": [" + coord[1] + ", " + coord[0] + "]");
//         }
//     });

// });


// // เพิ่ม event listener เพื่อ enable/disable การแก้ไขรูปสี่เหลี่ยม
// map.on('layeradd', function (event) {
//     if (event.layer instanceof L.Rectangle) {
//         event.layer.on('mouseover', function () {
//             event.layer.editing.enable();
//         });
//         event.layer.on('mouseout', function () {
//             event.layer.editing.disable();
//         });
//     }
// });

// drawnItems.addTo(map);
