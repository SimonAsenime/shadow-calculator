import './App.css';
import * as Astronomy from 'astronomy-engine'
import * as OverpassFrontend from 'overpass-frontend'
import { useRef } from 'react';

const overpassFrontend = new OverpassFrontend('https://overpass.kumi.systems/api/interpreter')

export const App = () => {

  const canvasRef = useRef(null);

  const toDegrees = (angle) => {
    return angle * (180 / Math.PI);
  }

  const toRadians = (angle) => {
    return angle * (Math.PI / 180);
  }

  /* const latitude = 32.79801
  const longitude = -96.83573
  const building_height = 4.7244 // meters
  const building_length = 48.768 // meters
  const building_sun_angle = 208.56 //degrees\
  const scale = {x:200, y:10}
  var d = 0; */

  var latitude = 0;
  var longitude = 0;
  var building_height = 4.7244;
  var building_length = 0;
  var building_sun_angle = 0;
  const scale = { x: 30, y: 15 }
  console.log(scale)
  var d = 0;
  var building_square = {}

  var shadow_offset = 0
  var shadow_width = 0
  var shadow_length = 0

  const findSquare = (feature) => {
    var square = {};
    var p1 = feature.geometry.find((point) => point.lat === feature.dbData.maxlat)
    p1.lng = p1.lon
    var p2 = feature.geometry.find((point) => point.lat === feature.dbData.minlat)
    p2.lng = p2.lon
    var p3 = feature.geometry.find((point) => point.lon === feature.dbData.maxlon)
    p3.lng = p3.lon
    var p4 = feature.geometry.find((point) => point.lon === feature.dbData.minlon)
    p4.lng = p4.lon

    if (p1.lng < p2.lng) {
      square.tl = p1
      square.br = p2
      square.tr = p3
      square.bl = p4
    } else {
      square.tr = p1
      square.bl = p2
      square.br = p3
      square.tl = p4
    }
    building_square = square;
    return square
  }

  const coordinateDistance = (p1, p2) => {
    var R = 6371000.0; // Radius of the earth in km
    var dLat = toRadians(p2.lat - p1.lat);  // deg2rad below
    var dLon = toRadians(p2.lng - p1.lng);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(p1.lat)) * Math.cos(toRadians(p2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  const calcOrientation = (feature) => {
    var points = findSquare(feature);
    console.log(points)

    var a = points.tl
    var b = { lat: feature.dbData.maxlat, lng: feature.dbData.maxlon }
    var c = points.tr

    var ab = coordinateDistance(a, b);
    var bc = coordinateDistance(b, c);
    var ac = coordinateDistance(a, c);

    var orientation = toDegrees(Math.acos((ac * ac + ab * ab - bc * bc) / (2 * ac * ab)))
    building_sun_angle = 180.0 + orientation

  }

  const getBuildingData = async () => {
    overpassFrontend.BBoxQuery(
      'way["building"]',
      { minlat: 32.79829, maxlat: 32.79830, minlon: -96.83559, maxlon: -96.835560 },
      {
        properties: OverpassFrontend.ALL
      },
      function (err, result) {
        latitude = result.center.lat
        longitude = result.center.lon
        calcOrientation(result);
        building_length = coordinateDistance(building_square.tr, building_square.br);
        console.log(building_length);
      },
      function (err) {
        if (err) { console.log(err) }
      }
    )
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  const calcSun = () => {
    d = new Date();
    d.setHours(17);
    const observer = new Astronomy.Observer(latitude, longitude, 0);
    let equ_ofdate = Astronomy.Equator('Sun', d, observer, true, true);
    let hor = Astronomy.Horizon(d, observer, equ_ofdate.ra, equ_ofdate.dec, 'normal');
    return hor;
  }

  const calcShadow = () => {
    shadow_offset = (building_height / Math.tan(toRadians(calcSun().altitude)));
    if (calcSun().azimuth > building_sun_angle) {
      shadow_width = Math.abs(shadow_offset * Math.sin(toRadians(calcSun().azimuth - building_sun_angle))) * scale.x;
      shadow_length = Math.abs(shadow_offset * Math.cos(toRadians(calcSun().azimuth - building_sun_angle))) * scale.x;
    }
    else
      shadow_width = 0;
  }

  calcShadow()
  console.log(calcSun());

  const drawShadow = async () => {
    await getBuildingData();
    console.log(shadow_offset);
    console.log(shadow_width);
    console.log(shadow_length)
    console.log(d);
    console.log(building_sun_angle);
    calcShadow()
    var pointOne = { x: 0, y: 0 }
    pointOne.x = 960 - shadow_width / 2;
    pointOne.y = building_length / 2 * scale.y + 540;

    const canvas = canvasRef.current
    const context = canvas.getContext('2d');
    context.reset()
    context.fillStyle = "rgba(0,0,0,0.75)";
    context.beginPath();
    context.moveTo(pointOne.x, pointOne.y);
    context.lineTo(pointOne.x + shadow_width, pointOne.y - shadow_length);
    context.lineTo(pointOne.x + shadow_width, pointOne.y - (building_length * scale.y));
    context.lineTo(pointOne.x, pointOne.y - (building_length * scale.y) + shadow_length);
    context.lineTo(pointOne.x, pointOne.y);
    context.closePath();
    context.fill();
  }

  return <>
    <div className='app'>
      <canvas id="shadow" className='shadow' ref={canvasRef} width="1920" height="1080"></canvas>
      <button className='shadow-button' onClick={() => drawShadow()}>Draw Shadow</button>
    </div>
  </>;
}
export default App;
