
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var map = L.map('map', {
    center: [18.788346, 98.985291], // ตั้งค่าพิกัดศูนย์กลางของแผนที่
    zoom: 19, // ตั้งค่าระดับซูมเริ่มต้น
    layers: [Esri_WorldImagery] // เพิ่ม Tile Layer เป็นภาพถ่ายจาก Esri
});

L.control.scale().addTo(map);


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
    axios.post('http://localhost:5100/roofdetect', {
        bbox: [coordinates[1][0], coordinates[3][1], coordinates[3][0], coordinates[1][1]]
    })
        .then(function (response) {
            let data = JSON.parse(response.data)
            // let data2 = data.features[0].geometry.coordinates[0]
            console.log(data);
            // let label = JSON.parse(response.data[0].properties.label)
            // console.log(label);


            // let data = response.data;
            // L.geoJSON(data, {
            //     style: function (feature) {
            //         return { color: "red" };
            //     }
            // }).bindPopup(function (layer) {
            //     return layer.feature.properties.label;
            // }).addTo(map);


            L.geoJSON(data, {
                style: function (feature) {
                    return { color: "red" };
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
